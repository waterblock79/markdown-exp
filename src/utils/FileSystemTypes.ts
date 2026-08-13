const isFilenameValid = (name: string) =>
   new RegExp(/^[^\\/:*?"<>|]+$/).test(name);

type RemoteFile = {
   url: string;
   size: number;
};

export class RemoteFileHandle {
   public url: string;
   public name: string;
   public size: number;
   constructor(url: string, name: string, size: number) {
      this.url = url;
      this.name = name;
      this.size = size;
   }

   public async queryPermission() {
      return "granted";
   }

   public async getFile() {
      try {
         return new File([await (await fetch(this.url)).blob()], this.name);
      } catch (e) {
         return undefined;
      }
   }
}

export class FileSystemFile {
   public name: string;
   public parent: FileSystemFolder;
   public handle?: FileSystemFileHandle | RemoteFileHandle;
   /** OS-level snapshot of the file, lazily fetched from the handle. */
   public _osFile: File | null = null;
   /** In-memory text content — the virtual file's authoritative data. null = not loaded. */
   public _text: string | null = null;
   /** Whether the in-memory content has unsaved changes. */
   public _dirty = false;
   constructor(
      name: string,
      file: FileSystemFileHandle | RemoteFile | File,
      parent: FileSystemFolder,
   ) {
      if (!isFilenameValid(name))
         throw new Error(
            `${name} is invalid. Avoid symbols like \ / : * ? " < > |`,
         );
      this.name = name;
      this.parent = parent;
      if (file instanceof FileSystemFileHandle) {
         this.handle = file;
         this.updateFile();
      } else if (file instanceof File) {
         // In-memory file with no OS handle (created, uploaded, or dragged in).
         this._osFile = file;
      } else {
         this.handle = new RemoteFileHandle(file.url, name, file.size);
      }
   }

   /**
    * The virtual file as a `File`. Prefers the in-memory content so edits are
    * reflected everywhere; falls back to the OS snapshot for binary files.
    */
   public get file(): File | null {
      if (this._text !== null) {
         return new File([this._text], this.name, {
            type: this._osFile?.type ?? "text/plain",
            lastModified: this._osFile?.lastModified ?? Date.now(),
         });
      }
      return this._osFile;
   }
   public set file(f: File | null) {
      this._osFile = f;
   }

   /** Fetch the OS-level snapshot into `_osFile`; returns true on success. */
   public async updateFile() {
      const file = await this.handle?.getFile(),
         permission = await this.handle?.queryPermission();
      if (!file || !(permission === "granted")) return false;
      this._osFile = file;
      return true;
   }

   /**
    * Read the text content into memory. Returns the in-memory value when
    * already loaded, otherwise reads from the handle and caches it.
    */
   public async readText(): Promise<string | null> {
      if (this._text !== null) return this._text;
      if (!this._osFile && !(await this.updateFile())) return null;
      if (!this._osFile) return null;
      this._text = await this._osFile.text();
      return this._text;
   }

   /** Update the in-memory content and mark it dirty (no disk I/O). */
   public setText(text: string) {
      this._text = text;
      this._dirty = true;
   }

   /** Rename the file with validation. */
   public rename(newName: string) {
      if (!isFilenameValid(newName))
         throw new Error(
            `${newName} is invalid. Avoid symbols like \\ / : * ? " < > |`,
         );
      this.name = newName;
   }

   /** Whether the in-memory content has unsaved changes. */
   public get dirty() {
      return this._dirty;
   }

   /**
    * Persist the in-memory content to the OS handle. Only writes when dirty,
    * so edits stay in memory and disk I/O stays low-frequency. Remote files
    * are kept in memory only (their source cannot be modified).
    */
   public async save(): Promise<boolean> {
      if (!this._dirty || this._text === null) return true;
      const handle = this.handle;
      if (handle instanceof FileSystemFileHandle) {
         // showOpenFilePicker only grants read access by default, so request
         // write permission before attempting to write.
         let permission = await handle.queryPermission({ mode: "readwrite" });
         if (permission !== "granted") {
            permission = await handle.requestPermission({ mode: "readwrite" });
         }
         if (permission !== "granted") return false;
         try {
            const writable = await handle.createWritable();
            await writable.write(this._text);
            await writable.close();
         } catch {
            return false;
         }
      } else if (!(handle instanceof RemoteFileHandle)) {
         return false;
      }
      // Keep the in-memory snapshot in sync and clear the dirty flag.
      this._osFile = new File([this._text], this.name, {
         type: this._osFile?.type ?? "text/plain",
         lastModified: Date.now(),
      });
      this._dirty = false;
      return true;
   }

   /** Alias of {@link save} used on file switches / unmount. */
   public async flush(): Promise<boolean> {
      return this.save();
   }
}

export class FileSystemFolder {
   public name: string;
   public items: (FileSystemFile | FileSystemFolder)[] = [];
   public parent: FileSystemFolder | null = null;
   constructor(
      name: string,
      items: (FileSystemFile | FileSystemFolder)[] = [],
      parent: FileSystemFolder | null = null,
   ) {
      if (!isFilenameValid(name) && name.length)
         throw new Error(
            `${name} is invalid. Avoid symbols like \ / : * ? " < > |`,
         );
      this.name = name;
      this.items = items;
      this.parent = parent;
   }

   public putItem(item: FileSystemFile | FileSystemFolder) {
      this.items.push(item);
   }

   public getItem(name: string): FileSystemFile | FileSystemFolder | null {
      if (name === "" || name === ".") return this;
      if (name === "..") {
         if (this.parent) return this.parent;
         else return null;
      }
      if (name.includes("/")) {
         const splitter = name.indexOf("/");
         const u = this.getItem(name.substring(0, splitter)),
            v = name.substring(splitter + 1);
         if (u instanceof FileSystemFolder) {
            return u.getItem(v);
         } else return null;
      }
      name = decodeURIComponent(name);
      return (
         this.items.find((ite) => decodeURIComponent(ite.name) === name) ?? null
      );
   }

   public deleteItem(item: string | FileSystemFile | FileSystemFolder) {
      const index = this.items.findIndex((ite) =>
         typeof item === "string" ? ite.name === item : ite === item,
      );
      if (index === -1) return false;
      this.items.splice(index, 1);
      return true;
   }

   get size() {
      return this.items.length;
   }

   /** Rename the folder with validation. */
   public rename(newName: string) {
      if (!isFilenameValid(newName))
         throw new Error(
            `${newName} is invalid. Avoid symbols like \\ / : * ? " < > |`,
         );
      this.name = newName;
   }
}
