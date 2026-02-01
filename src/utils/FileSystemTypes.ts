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
   public file: File | null = null;
   public parent: FileSystemFolder;
   public handle?: FileSystemFileHandle | RemoteFileHandle;
   constructor(
      name: string,
      file: FileSystemFileHandle | RemoteFile,
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
      } else {
         this.handle = new RemoteFileHandle(file.url, name, file.size);
      }
   }

   /** Update or retrieve the File object from the handle and store it in this.file; returns true if successful. */
   public async updateFile() {
      const file = await this.handle?.getFile(),
         permission = await this.handle?.queryPermission();
      if (!file || !(permission === "granted")) return false;
      else {
         this.file = file;
         return true;
      }
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
}
