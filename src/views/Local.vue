<template>
   <transition :name="translationReversed ? 'slide-reversed' : 'slide'">
      <div
         key="starting"
         class="local-starting text-h6 top-0 left-0 w-100 h-100"
         color="primary"
         variant="text"
         :v-ripple="false"
         v-if="!fileSystemRoot.size && !isVirtual && !exportSettings.is"
      >
         <div class="text-center font-weight-regular opacity-90 describe">
            <span @click="openGithubRepo" class="font-monospace text-subtitle-2 d-flex justify-center align-center opacity-60 cursor-pointer">
               <v-icon icon="mdi-github" class="mr-1" size="x-small"></v-icon>markdown-exp
            </span>
            <div class="project-title">
               <a
                  class="text-primary opacity-100 text-decoration-none cursor-pointer"
                  @click="showWelcomeDialog = true"
               >
                  Markdown <b>Exp</b>
               </a>
               {{ $t("starting.is") }}
            </div>
            <div class="text-subtitle-2 font-monospace my-4 project-descriptions">
               {{ $t("starting.gfmSupport") }}<br />
               {{ $t("starting.editOnlineAndLoadFromGitHub") }}<br />
               {{ $t("starting.seamlessLocalAssetIntegration") }}<br />
               {{ $t("starting.highQualityDocumentRendering") }}<br />
            </div>
            <div class="d-flex justify-center align-center ga-2 actions">
               <v-select
                  density="compact"
                  max-width="8em"
                  variant="outlined"
                  :items="[
                     { lang: 'zh', title: '中文' },
                     { lang: 'en', title: 'English' },
                  ]"
                  v-model="i18n.locale.value"
                  item-title="title"
                  item-value="lang"
                  hide-details
               ></v-select>
               <v-btn
                  variant="outlined"
                  size="small"
                  color="grey-darken-2"
                  width="8em"
                  class="shine-btn"
                  @click="tryItOut"
               >
                  {{ $t("starting.tryItOut") }}
               </v-btn>
            </div>
         </div>
         <div
            class="d-flex align-center justify-center user-select-none flex-column align-stretch ga-4"
         >
            <div class="text-primary text-center">
               {{ $t("starting.startingPoint") }}
            </div>
            <v-card
               max-width="calc(100% - 2em)"
               class="mode mx-8 d-flex align-center"
               variant="tonal"
               color="primary"
               prepend-icon="mdi-folder-open"
               :title="$t('starting.workspace')"
               :subtitle="$t('starting.workspaceDescribe')"
               v-ripple
               @click="
                  translationReversed = false;
                  selectFolder();
               "
            >
              <v-tooltip :text="$t('starting.singleFile')" location="top">
                  <template v-slot:activator="{ props }">
                     <div class="mode-inner" v-ripple @click="
                        translationReversed = false; selectFile();
                     " v-bind="props">
                        <v-icon icon="mdi-file-document"></v-icon>
                     </div>
                  </template>
               </v-tooltip>
            </v-card>
            <v-card
               max-width="calc(100% - 2em)"
               class="mode mx-8"
               variant="tonal"
               color="primary"
               prepend-icon="mdi-dots-square"
               :title="$t('starting.fromScratch')"
               :subtitle="$t('starting.fromScratchDescribe')"
               v-ripple
               @click="
                  translationReversed = false;
                  fileSystemRoot.items.length = 0;
                  preview = null;
                  previewFileSystemBase = null;
                  isVirtual = true;
                  addExampleFile();
               "
            >
            </v-card>
            <v-card
               max-width="calc(100% - 2em)"
               class="mode mx-8"
               variant="tonal"
               color="primary" 
               prepend-icon="mdi-source-branch"
               :title="$t('starting.fromRepo')"
               :subtitle="$t('starting.fromRepoDescribe')"
               v-ripple
               @click="
                  translationReversed = false;
                  openRepoDialog = true;
               "
            >
            </v-card>
         </div>
         <v-dialog v-model="openRepoDialog" min-width="36%" width="auto">
            <v-card prepend-icon="mdi-source-branch" :title="$t('repo.title')">
               <v-card-text>
                  <v-text-field
                     :label="$t('repo.repository')"
                     :rules="[(v) => /^[\w-]+\/[\w.-]+$/g.test(v)]"
                     v-model="openRepoInfo.repo"
                     placeholder="owner/repo"
                     variant="outlined"
                  ></v-text-field>
                  <v-text-field
                     :label="$t('repo.branch')"
                     :rules="[(v) => /^[\w./-]+$/g.test(v)]"
                     v-model="openRepoInfo.branch"
                     placeholder="main"
                     variant="outlined"
                     density="comfortable"
                     class="my-2"
                  ></v-text-field>
                  <v-text-field
                     :label="$t('repo.dictionary')"
                     v-model="openRepoInfo.dict"
                     placeholder="/"
                     variant="outlined"
                     density="comfortable"
                  ></v-text-field>
               </v-card-text>
               <v-card-actions>
                  <v-btn
                     :text="$t('repo.close')"
                     @click="openRepoDialog = false"
                  ></v-btn>
                  <v-btn
                     :text="$t('starting.tryItOut')"
                     color="secondary"
                     :disabled="openRepoInfo.loading"
                     @click="tryItOut"
                  ></v-btn>
                  <v-btn
                     :text="$t('repo.open')"
                     :loading="openRepoInfo.loading"
                     @click="openRepo"
                     color="primary"
                     :disabled="
                        !/^[\w./-]+$/g.test(openRepoInfo.branch) ||
                        !/^[\w-]+\/[\w.-]+$/g.test(openRepoInfo.repo)
                     "
                  ></v-btn>
               </v-card-actions>
            </v-card>
         </v-dialog>
      </div>
      <div
         key="workspace"
         class="w-100 h-100 top-0 left-0 py-4 px-6"
         v-else-if="(fileSystemRoot.size || isVirtual) && !exportSettings.is"
      >
         <div class="d-flex align-center ga-2 px-2 overflow-auto" v-if="isVirtual" style="min-height: 3.2em">
            <v-btn size="small" prepend-icon="mdi-file-plus-outline" @click="createFile" variant="outlined">
               {{ $t("workspace.newFile") }}
            </v-btn>
            <v-btn size="small" prepend-icon="mdi-folder-plus-outline" @click="createFolder" variant="outlined">
               {{ $t("workspace.newFolder") }}
            </v-btn>
            <v-btn size="small" prepend-icon="mdi-upload" @click="triggerUpload" variant="outlined">
               {{ $t("workspace.uploadFile") }}
            </v-btn>
            <input type="file" multiple ref="fileInput" class="d-none" @change="onUpload" />
            <input
               type="file"
               accept="application/zip"
               ref="zipInput"
               class="d-none"
               @change="onZipUpload"
            />
            <v-spacer></v-spacer>
            <v-btn
               size="small"
               prepend-icon="mdi-upload-box-outline"
               variant="outlined"
               @click="triggerZipUpload"
            >
               {{ $t("workspace.upload") }}
            </v-btn>
            <v-btn
               size="small"
               prepend-icon="mdi-zip-box"
               variant="outlined"
               :loading="packing"
               @click="packWorkspace"
            >
               {{ $t("workspace.pack") }}
            </v-btn>
      </div>
         <div
            class="w-100 d-flex local-workspace"
            :style="{
               height: isVirtual
                  ? 'calc(100% - 6.4em)'
                  : 'calc(100% - 3.2em)',
            }"
            @dragover.prevent="onDragOver"
            @drop.prevent="onDrop"
            @contextmenu.prevent.stop="() => {}"
         >
            <div
               class="w-25 h-100 overflow-auto user-select-none file-system"
               @dragover.prevent="onTreeDragOver"
               @drop.prevent="onTreeDrop"
               @dragend="onTreeDragEnd"
            >
               <v-treeview
                  :items="treeviewItems"
                  item-value="id"
                  open-on-click
                  class="mx-2 font-monospace"
                  style="overflow: auto"
                  @click:select="selectFileInTreeview"
                  @contextmenu.prevent.stop="onTreeContextMenu"
               >
                  <template v-slot:prepend="{ item }">
                     <v-icon
                        :icon="item.icon"
                        draggable="true"
                        @dragstart="onDragStart($event, item)"
                     ></v-icon>
                  </template>
                  <template v-slot:title="{ item }">
                     <span
                        class="tree-item-title"
                        draggable="true"
                        @dragstart="onDragStart($event, item)"
                        >{{ item.title }}</span
                     >
                  </template>
               </v-treeview>
               <Teleport to="body">
                  <Transition name="context-popover">
                     <div
                        v-if="contextMenu"
                        @contextmenu.prevent.stop="() => {}"
                        v-click-outside="() => (contextMenu = false)"
                        class="context-popover"
                        :style="{ left: contextPos.x + 'px', top: contextPos.y + 'px' }"
                     >
                        <v-list density="compact" nav>
                           <v-list-item
                              v-if="contextItem instanceof FileSystemFile"
                              prepend-icon="mdi-content-copy"
                              :title="$t('workspace.copy')"
                              @click="duplicateItem"
                           ></v-list-item>
                           <v-list-item
                              prepend-icon="mdi-rename"
                              :title="$t('workspace.rename')"
                              @click="renameItem"
                           ></v-list-item>
                           <v-list-item
                              prepend-icon="mdi-delete-outline"
                              :title="$t('workspace.delete')"
                              @click="confirmDelete"
                           ></v-list-item>
                        </v-list>
                     </div>
                  </Transition>
               </Teleport>
            </div>
            <div class="w-75 pa-2 preview">
               <file-preview
                  v-model="preview"
                  :file-system="previewFileSystemBase ?? undefined"
                  :in-virtual-workspace="isVirtual"
                  class="border rounded-lg"
               ></file-preview>
            </div>
         </div>
         <div
            class="d-flex justify-space-between align-center"
            :style="{ height: '3.2em' }"
         >
            <v-btn
               variant="tonal"
               prepend-icon="mdi-arrow-left"
               @click="
                  translationReversed = true;
                  fileSystemRoot.items.length = 0;
                  preview = null;
                  previewFileSystemBase = null;
                  isVirtual = false;
               "
            >
               {{ $t("workspace.back") }}
            </v-btn>
            <v-btn
               variant="tonal"
               prepend-icon="mdi-export"
               :disabled="!isMarkdownFile"
               color="primary"
               @click="
                  translationReversed = false;
                  exportSettings.title = preview?.name.replace(/\.md$/g, '') || '';
                  exportSettings.is = true;
               "
            >
               {{ $t("workspace.export") }}
            </v-btn>
         </div>
      </div>
      <div
         key="export"
         class="w-100 h-100 top-0 left-0 py-4 px-6"
         v-else-if="exportSettings.is"
      >
         <div
            class="w-100 d-flex pa-2 justify-center ga-12 align-center"
            :style="{ height: 'calc(100% - 3.2em)' }"
         >
            <div :style="{ width: '24em' }">
               <v-text-field
                  :label="$t('exportSettings.title')"
                  variant="outlined"
                  density="comfortable"
                  v-model="exportSettings.title"
               ></v-text-field>
               <v-dialog height="75%" max-height="90%">
                  <template v-slot:activator="{ props: activatorProps }">
                     <v-btn
                        variant="outlined"
                        v-bind="activatorProps"
                        density="comfortable"
                        class="opacity-70 shine-btn"
                        block
                     >
                        {{ $t("exportSettings.useCustomStyle") }}
                     </v-btn>
                  </template>
                  <template v-slot:default="{ isActive }">
                     <v-card>
                        <v-card-text><style-editor></style-editor></v-card-text>

                        <v-card-actions>
                           <v-spacer></v-spacer>

                           <v-btn
                              :text="$t('exportSettings.close')"
                              @click="isActive.value = false"
                           ></v-btn>
                        </v-card-actions>
                     </v-card>
                  </template>
               </v-dialog>
               <v-divider thickness="2" class="my-4"></v-divider>
               <div class="text-center mb-8 user-select-none">
                  <div v-if="platform == 'chrome'">
                     <img
                        src="../assets/chrome-save-as-pdf.svg"
                        class="w-75"
                        draggable="false"
                     />
                     <div
                        v-html="$t('exportSettings.chromeInstructions')"
                     ></div>
                  </div>
                  <div v-else-if="platform == 'safari'">
                     <img
                        src="../assets/safari-save-as-pdf.svg"
                        class="w-75"
                        draggable="false"
                     />
                     <div
                        v-html="$t('exportSettings.safariInstructions')"
                     ></div>
                  </div>
                  <div v-else-if="platform == 'android'">
                     <img
                        src="../assets/android-save-as-pdf.svg"
                        class="w-75"
                        draggable="false"
                     />
                     <div
                        v-html="$t('exportSettings.androidInstructions')"
                     ></div>
                  </div>
                  <div v-else-if="platform == 'ios'">
                     <img
                        src="../assets/ios-save-as-pdf.svg"
                        class="w-75"
                        draggable="false"
                     />
                     <div v-html="$t('exportSettings.iosInstructions')"></div>
                  </div>
                  <div v-else>
                     <img
                        src="../assets/chrome-save-as-pdf.svg"
                        class="w-100"
                        draggable="false"
                     />
                     <div
                        v-html="$t('exportSettings.chromeInstructions')"
                     ></div>
                  </div>
               </div>
               <v-btn
                  class="mb-2"
                  variant="tonal"
                  color="primary"
                  block
                  prepend-icon="mdi-printer"
                  size="large"
                  @click="printDocument"
               >
                  {{ $t("exportSettings.print") }}
               </v-btn>
               <v-btn
                  class="mb-4"
                  variant="text"
                  color="primary"
                  block
                  prepend-icon="mdi-xml"
                  dense
                  @click="exportHTML"
               >
                  {{ $t("exportSettings.outputHTML") }}
               </v-btn>
               <div class="text-center text-subtitle-2" v-if="false && exportSettings.starUsIfYouLikeIt">
                  <a
                     class="text-indigo text-decoration-none font-weight-medium cursor-pointer"
                     href="//github.com/waterblock79/markdown-exp"
                     target="blank"
                     >{{ $t("exportSettings.starUs") }}</a
                  >
               </div>
            </div>
            <div class="border elevation-8 h-100 export-preview">
               <file-preview
                  v-model="preview"
                  :in-virtual-workspace="false"
                  :file-system="previewFileSystemBase ?? undefined"
               ></file-preview>
            </div>
         </div>
         <div
            class="d-flex justify-space-between align-center"
            :style="{ height: '3.2em' }"
         >
            <v-btn
               variant="tonal"
               prepend-icon="mdi-arrow-left"
               @click="
                  translationReversed = true;
                  preview = null;
                  exportSettings.is = false;
               "
            >
               {{ $t("workspace.back") }}
            </v-btn>
         </div>
      </div>
   </transition>
   <v-dialog v-model="replaceDialog" max-width="30em">
      <v-card :title="$t('workspace.upload')">
         <v-card-text>
            {{ $t("workspace.replaceConfirm") }}
         </v-card-text>
         <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
               :text="$t('exportSettings.close')"
               @click="replaceDialog = false"
            ></v-btn>
            <v-btn
               :text="$t('workspace.replace')"
               color="primary"
               @click="confirmReplace"
            ></v-btn>
         </v-card-actions>
      </v-card>
   </v-dialog>
   <v-dialog v-model="deleteDialog" max-width="28em">
      <v-card :title="$t('workspace.delete')">
         <v-card-text>
            {{ $t("workspace.deleteConfirm", { name: contextItem?.name ?? "" }) }}
         </v-card-text>
         <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
               :text="$t('exportSettings.close')"
               @click="deleteDialog = false"
            ></v-btn>
            <v-btn
               :text="$t('workspace.delete')"
               color="error"
               @click="doDeleteItem"
            ></v-btn>
         </v-card-actions>
      </v-card>
   </v-dialog>
   <v-dialog v-model="renameDialog" max-width="24em">
      <v-card :title="$t('workspace.rename')">
         <v-card-text>
            <v-text-field
               :label="$t('workspace.renameName')"
               v-model="renameName"
               class="font-monospace"
               :rules="[renameNameRule]"
               variant="outlined"
               density="comfortable"
               autofocus
               @keyup.enter="confirmRename"
            ></v-text-field>
         </v-card-text>
         <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :text="$t('repo.close')" @click="renameDialog = false"></v-btn>
            <v-btn
               :text="$t('repo.open')"
               color="primary"
               @click="confirmRename"
            ></v-btn>
         </v-card-actions>
      </v-card>
   </v-dialog>
   <v-dialog v-model="newItemDialog" max-width="24em">
      <v-card
         :title="
            newItemMode == 'folder'
               ? $t('workspace.newFolder')
               : $t('workspace.newFile')
         "
      >
         <v-card-text>
            <v-text-field
               :label="
                  newItemMode == 'folder'
                     ? $t('workspace.newFolderName')
                     : $t('workspace.newFileName')
               "
               v-model="newItemName"
               class="font-monospace"
               :rules="[createNameRule]"
               variant="outlined"
               density="comfortable"
               autofocus
               @keyup.enter="confirmNewItem"
            ></v-text-field>
         </v-card-text>
         <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :text="$t('repo.close')" @click="newItemDialog = false"></v-btn>
            <v-btn
               :text="$t('repo.open')"
               color="primary"
               @click="confirmNewItem"
            ></v-btn>
         </v-card-actions>
      </v-card>
   </v-dialog>
   <v-dialog v-model="showWelcomeDialog" width="80%" scrollable>
      <v-card>
         <v-card-text class="pa-0">
            <Welcome></Welcome>
            <i class="font-monospace mx-auto text-center w-66 d-block"><b>Markdown Exp</b> {{ $t("starting.is") }}{{ $t("starting.using") }}</i>
         </v-card-text>
         <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
               variant="text"
               color="primary"
               @click="showWelcomeDialog = false"
            >
               {{ $t("repo.close") }}
            </v-btn>
         </v-card-actions>
      </v-card>
   </v-dialog>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import JSZip from "jszip";
import FilePreview from "../components/FilePreview.vue";
import { useMessagesStore } from "../stores/messages";
import { useFullscreenPreview } from "../stores/fullscreen-preview";
import { useStyling } from "../stores/styling";
import { FileSystemFile, FileSystemFolder } from "../utils/FileSystemTypes";
import { renderMarkdown } from "../utils/markdown";
import StyleEditor from "../components/StyleEditor.vue";
import Welcome from "../components/Welcome.vue";

const showWelcomeDialog = ref(localStorage.getItem("showWelcomeDialog") !== "false");
localStorage.setItem("showWelcomeDialog", "false");
(window as any).showWelcomeDialog = () => {
   showWelcomeDialog.value = true;
};

const { t } = useI18n();
const i18n = useI18n();

const openGithubRepo = () => {
   window.open("https://github.com/waterblock79/markdown-exp");
}

const getFileIcon = (name: string) => {
   const icons: { [key: string]: RegExp } = {
      "mdi-file-document": /\.(md|markdown|txt)$/,
      "mdi-vector-square": /\.svg$/,
      "mdi-image": /\.(jpe?g|png|gif|bmp|webp?)$/,
   };
   for (const icon in icons) {
      if (icons[icon]!.test(name)) return icon;
   }
   return "mdi-file";
};

const messages = useMessagesStore();
const fullscreenPreview = useFullscreenPreview();
const styling = useStyling();

const translationReversed = ref(false);

const fileSystemRoot = reactive(new FileSystemFolder(""));
(window as any).virtualFileSystemRoot = fileSystemRoot;

/** Whether we are in the in-browser virtual workspace (From Scratch mode). */
const isVirtual = ref(false);

/** Whether any file under the folder has unsaved in-memory changes. */
const hasDirtyFile = (folder: FileSystemFolder): boolean => {
   for (const item of folder.items) {
      if (item instanceof FileSystemFolder) {
         if (hasDirtyFile(item)) return true;
      } else if (item.dirty) {
         return true;
      }
   }
   return false;
};

/** Warn before leaving/reloading when the workspace has unsaved changes. */
const onBeforeUnload = (e: BeforeUnloadEvent) => {
   if (hasDirtyFile(fileSystemRoot)) {
      e.preventDefault();
      e.returnValue = "";
   }
};
onMounted(() => window.addEventListener("beforeunload", onBeforeUnload));
onUnmounted(() =>
   window.removeEventListener("beforeunload", onBeforeUnload),
);

type TreeViewItem = {
   id: string;
   title: string;
   children?: TreeViewItem[];
   fileSystemItem: FileSystemFile | FileSystemFolder;
   type: "file" | "folder";
   icon: string;
};
const treeviewItems = computed(() => {
   const toTreeview = (path: string, folder: FileSystemFolder) => {
      let items: TreeViewItem[] = [];
      folder.items.forEach((item) =>
         items.push({
            id: `${path}${item.name}`,
            title: item.name,
            children:
               item instanceof FileSystemFolder
                  ? toTreeview(`${path}${item.name}/`, item)
                  : undefined,
            fileSystemItem: item,
            type: item instanceof FileSystemFolder ? "folder" : "file",
            icon:
               item instanceof FileSystemFolder
                  ? "mdi-folder"
                  : getFileIcon(item.name),
         }),
      );
      items.sort((a, b) =>
         a.title.startsWith(".") ? 1 : 0 - (b.title.startsWith(".") ? 1 : 0),
      );
      return items;
   };
   return toTreeview("", fileSystemRoot);
});

const preview = ref<FileSystemFile | null>(null);
const isMarkdownFile = computed(() => {
   return preview.value && /\.(md|markdown|txt)$/.test(preview.value.name) || preview.value?._osFile?.type.startsWith("text");
});
const previewFileSystemBase = ref<FileSystemFolder | null>();

const selectFileInTreeview = async (arg: {
   id: unknown;
   value: boolean;
   path: unknown[];
}) => {
   if (arg.value) {
      const file = fileSystemRoot.getItem(arg.id as string) as FileSystemFile;
      previewFileSystemBase.value = file.parent;
      preview.value = file;
   } else {
      preview.value = null;
      previewFileSystemBase.value = null;
   }
};

const selectFile = async () => {
   isVirtual.value = false;
   const handle = await window.showOpenFilePicker({
      types: [
         {
            description: "Markdown file",
            accept: {
               "text/markdown": [".md", ".markdown"],
               "text/plain": [".txt"],
            },
         },
      ],
      multiple: false,
   });
   if (handle[0]) {
      const file = new FileSystemFile(
         handle[0].name,
         handle[0],
         fileSystemRoot,
      );
      fileSystemRoot.putItem(file);
      // open the file in preview
      previewFileSystemBase.value = file.parent;
      preview.value = file;
   }
};
const selectFolder = async () => {
   isVirtual.value = false;
   const handle = await window.showDirectoryPicker();
   if (handle) {
      const resolveDirectoryHandle = async (
         name: string,
         handle: FileSystemDirectoryHandle,
         parent?: FileSystemFolder,
      ) => {
         const folder = new FileSystemFolder(name, [], parent);
         for await (const [name, entry] of handle.entries()) {
            if (entry.kind === "directory") {
               folder.putItem(
                  await resolveDirectoryHandle(name, entry, folder),
               );
            } else {
               folder.putItem(new FileSystemFile(name, entry, folder));
            }
         }
         return folder;
      };
      fileSystemRoot.items = (await resolveDirectoryHandle("", handle)).items;
      fileSystemRoot.name = handle.name;
   }
};

const fileInput = ref<HTMLInputElement>();
const newItemDialog = ref(false);
const newItemMode = ref<"file" | "folder">("file");
const newItemName = ref("");

const createFile = () => {
   newItemMode.value = "file";
   newItemName.value = "untitled.md";
   newItemDialog.value = true;
};

const createFolder = () => {
   newItemMode.value = "folder";
   newItemName.value = "New Folder";
   newItemDialog.value = true;
};

/** Insert an example `document.md` unless one already exists. */
const addExampleFile = () => {
   if (hasDuplicate(fileSystemRoot, "document.md")) return;
   fileSystemRoot.putItem(
      new FileSystemFile(
         "document.md",
         new File(["## Markdown Document\n\nThis is a Markdown document."], "document.md", { type: "text/markdown" }),
         fileSystemRoot,
      ),
   );
};

const confirmNewItem = () => {
   const name = newItemName.value.trim();
   if (!name) return;
   if (hasDuplicate(fileSystemRoot, name)) {
      messages.add(t("messages.nameExists"), "error");
      return;
   }
   try {
      if (newItemMode.value === "folder") {
         fileSystemRoot.putItem(new FileSystemFolder(name, [], fileSystemRoot));
      } else {
         fileSystemRoot.putItem(
            new FileSystemFile(
               name,
               new File([""], name, { type: "text/markdown" }),
               fileSystemRoot,
            ),
         );
      }
      newItemDialog.value = false;
   } catch (e) {
      messages.add(String(e), "error");
   }
};

const createNameRule = (v: string) => {
   const name = v.trim();
   if (!name) return true;
   return !hasDuplicate(fileSystemRoot, name) || t("messages.nameExists");
};

const renameNameRule = (v: string) => {
   const item = contextItem.value;
   const name = v.trim();
   if (!name || !item) return true;
   if (item.parent && hasDuplicate(item.parent, name, item))
      return t("messages.nameExists");
   return true;
};

const hasDuplicate = (
   folder: FileSystemFolder | null | undefined,
   name: string,
   exclude?: FileSystemFile | FileSystemFolder,
): boolean => {
   if (!folder) return false;
   return folder.items.some((it) => it !== exclude && it.name === name);
};

const contextMenu = ref(false);
const contextPos = reactive({ x: 0, y: 0 });
const contextItem = ref<FileSystemFile | FileSystemFolder | null>(null);

const findTreeViewItem = (title: string): TreeViewItem | null => {
   const walk = (items: TreeViewItem[]): TreeViewItem | null => {
      for (const it of items) {
         if (it.title === title) return it;
         if (it.children) {
            const found = walk(it.children);
            if (found) return found;
         }
      }
      return null;
   };
   return walk(treeviewItems.value);
};

const onTreeContextMenu = (e: MouseEvent) => {
   const node = (e.target as HTMLElement).closest<HTMLElement>(".v-treeview-item");
   const titleEl = node?.querySelector<HTMLElement>(".tree-item-title");
   const title = titleEl?.textContent?.trim();
   if (!title) return;
   const item = findTreeViewItem(title);
   if (!item) return;
   if (contextMenu.value) {
      contextMenu.value = false;
      return;     
   }
   contextPos.x = e.clientX;
   contextPos.y = e.clientY;
   contextItem.value = item.fileSystemItem;
   contextMenu.value = true;
};

// --- Drag & drop to move files/folders within the tree ---
const dragItem = ref<FileSystemFile | FileSystemFolder | null>(null);
let dragOverNode: HTMLElement | null = null;

const onDragStart = (e: DragEvent, item: TreeViewItem) => {
   dragItem.value = item.fileSystemItem;
   if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", item.title);
   }
};

const getTreeItemFromEvent = (
   e: DragEvent,
): FileSystemFile | FileSystemFolder | null => {
   const node = (e.target as HTMLElement).closest<HTMLElement>(".v-treeview-item");
   const titleEl = node?.querySelector<HTMLElement>(".tree-item-title");
   const title = titleEl?.textContent?.trim();
   if (!title) return null;
   return findTreeViewItem(title)?.fileSystemItem ?? null;
};

const isDescendant = (
   folder: FileSystemFile | FileSystemFolder,
   item: FileSystemFile | FileSystemFolder,
): boolean => {
   if (!(folder instanceof FileSystemFolder)) return false;
   return folder.items.some(
      (it) =>
         it === item ||
         (it instanceof FileSystemFolder && isDescendant(it, item)),
   );
};

const clearDragOver = () => {
   dragOverNode?.classList.remove("tree-drag-over");
   dragOverNode = null;
};

const onTreeDragOver = (e: DragEvent) => {
   if (!dragItem.value) return;
   e.stopPropagation();
   if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
   const node = (e.target as HTMLElement).closest<HTMLElement>(".v-treeview-item");
   if (node) {
      if (node !== dragOverNode) {
         clearDragOver();
         dragOverNode = node;
         dragOverNode?.classList.add("tree-drag-over");
      }
   } else {
      // Over the blank area -> drop target is the root; just clear item highlight.
      clearDragOver();
   }
};

const onTreeDrop = (e: DragEvent) => {
   clearDragOver();
   const source = dragItem.value;
   dragItem.value = null;
   if (!source) return;
   e.stopPropagation();
   const target = getTreeItemFromEvent(e);
   // Dropping onto a file (not a folder) is not a valid target.
   if (target && !(target instanceof FileSystemFolder)) return;
   const dest = target instanceof FileSystemFolder ? target : fileSystemRoot;
   if (source === dest) return;
   if (isDescendant(source, dest)) return;
   // Prevent name collisions in the destination folder.
   if (hasDuplicate(dest, source.name, source)) {
      messages.add(t("messages.nameExists"), "error");
      return;
   }
   source.parent?.deleteItem(source);
   dest.putItem(source);
   source.parent = dest;
   if (preview.value === source) previewFileSystemBase.value = dest;
};

const onTreeDragEnd = () => {
   clearDragOver();
   dragItem.value = null;
};

const renameDialog = ref(false);const renameName = ref("");

const renameItem = () => {
   if (!contextItem.value) return;
   renameName.value = contextItem.value.name;
   contextMenu.value = false;
   renameDialog.value = true;
};

const confirmRename = () => {
   const item = contextItem.value;
   if (!item) return;
   const name = renameName.value.trim();
   if (!name) return;
   if (item.parent && hasDuplicate(item.parent, name, item)) {
      messages.add(t("messages.nameExists"), "error");
      return;
   }
   try {
      item.rename(name);
      renameDialog.value = false;
      contextItem.value = null;
   } catch (e) {
      messages.add(String(e), "error");
   }
};

const deleteDialog = ref(false);

const confirmDelete = () => {
   contextMenu.value = false;
   deleteDialog.value = true;
};

const doDeleteItem = () => {
   const item = contextItem.value;
   deleteDialog.value = false;
   if (!item) return;
   item.parent?.deleteItem(item);
   if (preview.value === item) {
      preview.value = null;
      previewFileSystemBase.value = null;
   }
   contextItem.value = null;
};

const makeCopyName = (name: string, counter?: number): string => {
   const dot = name.lastIndexOf(".");
   const base = dot > 0 ? name.slice(0, dot) : name;
   const ext = dot > 0 ? name.slice(dot) : "";
   return counter ? `${base} copy ${counter}${ext}` : `${base} copy${ext}`;
};

const duplicateItem = async () => {
   const source = contextItem.value;
   contextMenu.value = false;
   if (!source || !(source instanceof FileSystemFile)) return;
   let srcFile = source.file;
   if (!srcFile) {
      await source.updateFile();
      srcFile = source.file;
   }
   if (!srcFile || !source.parent) return;
   // Find a unique "<name> copy.ext" name.
   let copyName = makeCopyName(source.name);
   let counter = 2;
   while (hasDuplicate(source.parent, copyName)) {
      copyName = makeCopyName(source.name, counter++);
   }
   try {
      source.parent.putItem(
         new FileSystemFile(
            copyName,
            new File([srcFile], copyName, { type: srcFile.type }),
            source.parent,
         ),
      );
   } catch (e) {
      messages.add(String(e), "error");
   }
   contextItem.value = null;
};

const triggerUpload = () => fileInput.value?.click();

const onUpload = (e: Event) => {
   const input = e.target as HTMLInputElement;
   for (const f of input.files ?? []) {
      // Skip files whose name already exists in the workspace root.
      if (hasDuplicate(fileSystemRoot, f.name)) {
         messages.add(t("messages.nameExists"), "error");
         continue;
      }
      try {
         fileSystemRoot.putItem(new FileSystemFile(f.name, f, fileSystemRoot));
      } catch (err) {
         messages.add(String(err), "error");
      }
   }
   input.value = "";
};

const onDragOver = (e: DragEvent) => {
   if (isVirtual.value) e.preventDefault();
};

const onDrop = (e: DragEvent) => {
   if (!isVirtual.value) return;
   e.preventDefault();
   for (const f of e.dataTransfer?.files ?? []) {
      // Skip files whose name already exists in the workspace root.
      if (hasDuplicate(fileSystemRoot, f.name)) {
         messages.add(t("messages.nameExists"), "error");
         continue;
      }
      try {
         fileSystemRoot.putItem(new FileSystemFile(f.name, f, fileSystemRoot));
      } catch (err) {
         messages.add(String(err), "error");
      }
   }
};

const packing = ref(false);

/** Pack the whole virtual workspace into a ZIP and download it. */
const packWorkspace = async () => {
   if (packing.value) return;
   packing.value = true;
   try {
      const zip = new JSZip();
      const walk = async (folder: FileSystemFolder, zipFolder: JSZip | null) => {
         for (const item of folder.items) {
            if (item instanceof FileSystemFolder) {
               const sub = (zipFolder ?? zip).folder(item.name)!;
               await walk(item, sub);
            } else {
               let file = item.file;
               if (!file) {
                  await item.updateFile();
                  file = item.file;
               }
               if (!file) continue;
               (zipFolder ?? zip).file(item.name, file);
            }
         }
      };
      await walk(fileSystemRoot, null);
      const blob = await zip.generateAsync({ type: "blob" });
      const name = fileSystemRoot.name
         ? `${fileSystemRoot.name}.zip`
         : `Workspace - ${new Date().getTime()}.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
      messages.add(t("workspace.packed"), "success");
   } catch (e) {
      messages.add(String(e), "error");
   } finally {
      packing.value = false;
   }
};

const zipInput = ref<HTMLInputElement>();
const replaceDialog = ref(false);
const pendingZipEntries = ref<{ path: string; blob: Blob }[]>([]);

/** Open the file picker for a ZIP archive. */
const triggerZipUpload = () => zipInput.value?.click();

/** Create (and fill) a file at the given "/" or "\"-separated path inside a folder. */
const addFileToFolder = (folder: FileSystemFolder, path: string, blob: Blob) => {
   const parts = path.split(/[\\/]/).filter(Boolean);
   const name = parts.pop()!;
   let cur = folder;
   for (const part of parts) {
      let sub = cur.getItem(part);
      if (!(sub instanceof FileSystemFolder)) {
         sub = new FileSystemFolder(part, [], cur);
         cur.putItem(sub);
      }
      cur = sub;
   }
   cur.putItem(
      new FileSystemFile(
         name,
         new File([blob], name, { type: blob.type }),
         cur,
      ),
   );
};

/** Validate the chosen ZIP and ask before replacing the workspace. */
const onZipUpload = async (e: Event) => {
   const input = e.target as HTMLInputElement;
   const file = input.files?.[0];
   input.value = "";
   if (!file) return;
   try {
      const zip = await JSZip.loadAsync(file);
      const entries: { path: string; blob: Blob }[] = [];
      for (const [path, entry] of Object.entries(zip.files)) {
         if (entry.dir) continue;
         entries.push({ path, blob: await entry.async("blob") });
      }
      if (entries.length === 0) {
         messages.add(t("workspace.invalidZip"), "error");
         return;
      }
      pendingZipEntries.value = entries;
      replaceDialog.value = true;
   } catch {
      messages.add(t("workspace.invalidZip"), "error");
   }
};

/** Clear the workspace and rebuild it from the extracted ZIP entries. */
const confirmReplace = () => {
   fileSystemRoot.items.length = 0;
   preview.value = null;
   previewFileSystemBase.value = null;
   for (const { path, blob } of pendingZipEntries.value) {
      addFileToFolder(fileSystemRoot, path, blob);
   }
   pendingZipEntries.value = [];
   replaceDialog.value = false;
};

const openRepoDialog = ref(false);
const openRepoInfo = reactive({
   repo: "",
   branch: "main",
   dict: "/",
   loading: false,
});
const openRepo = () => {
   openRepoInfo.loading = true;
   fetch(
      `https://api.github.com/repos/${openRepoInfo.repo}/branches/${openRepoInfo.branch}`,
   )
      .then((r) => r.json())
      .then(async (r) => {
         if (r.commit) {
            const sha = r.commit.sha as string;
            const fetchTree = await (
               await fetch(
                  `https://api.github.com/repos/${openRepoInfo.repo}/git/trees/${sha}?recursive=true`,
               )
            ).json();
            if (fetchTree.tree) {
               let tree = fetchTree.tree as {
                  path: string;
                  type: string;
                  size: number;
               }[];
               tree.sort(
                  (a, b) =>
                     (a.path.match(/\//g)?.length ?? 0) -
                     (b.path.match(/\//g)?.length ?? 0),
               );
               const root = new FileSystemFolder("");
               for (const index in tree) {
                  const path = tree[index]!.path;
                  const rawUrl = `https://raw.githubusercontent.com/${openRepoInfo.repo}/${openRepoInfo.branch}/${path}`;
                  const type = tree[index]!.type;
                  const size = tree[index]!.size;
                  if (path?.includes("/")) {
                     const name = path.match(/[^/]+$/g)?.[0];
                     const dictTo = path.replace(/[^/]+$/, "");
                     const parent = root.getItem(dictTo) as FileSystemFolder;
                     if (name && dictTo && parent) {
                        if (type == "tree") {
                           parent.putItem(
                              new FileSystemFolder(name, [], parent),
                           );
                        } else {
                           parent.putItem(
                              new FileSystemFile(
                                 name,
                                 { url: rawUrl, size },
                                 parent,
                              ),
                           );
                        }
                     }
                  } else {
                     if (type == "tree")
                        root.putItem(new FileSystemFolder(path));
                     else {
                        root.putItem(
                           new FileSystemFile(
                              path,
                              { url: rawUrl, size },
                              root,
                           ),
                        );
                     }
                  }
               }
               const dict = root.getItem(openRepoInfo.dict);
               if (!(dict instanceof FileSystemFolder)) {
                  messages.add(
                     t("messages.directoryNotExists", {
                        dict: openRepoInfo.dict,
                     }),
                     "error",
                  );
               } else {
                  fileSystemRoot.items = dict.items;
                  fileSystemRoot.parent = dict.parent;
               }
               openRepoInfo.loading = false;
            } else {
               messages.add(
                  t("messages.failedToFetchTree", {
                     message: fetchTree.message,
                  }),
                  "error",
               );
               openRepoInfo.loading = false;
            }
         } else {
            messages.add(
               t("messages.failedToFetchRepository", { message: r.message }),
               "error",
            );
            openRepoInfo.loading = false;
         }
      })
      .catch((reason) => {
         messages.add(reason, "error");
         openRepoInfo.loading = false;
      });
};

const tryItOut = () => {
   openRepoDialog.value = true;
   openRepoInfo.branch = "main";
   openRepoInfo.repo = "waterblock79/markdown-exp";
   openRepoInfo.dict = "example";
   openRepo();
};

const exportSettings = reactive({
   is: false,
   title: "",
   customStyle: "",
   starUsIfYouLikeIt: false
});

const getMimeFromName = (name: string) => {
   const ext = name.split(".").pop()?.toLowerCase() ?? "";
   const mimes: Record<string, string> = {
      svg: "image/svg+xml",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      bmp: "image/bmp",
      webp: "image/webp",
      ico: "image/x-icon",
   };
   return mimes[ext] ?? "";
};

const blobToDataURL = (blob: Blob) =>
   new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
         let result = reader.result as string;
         // Fall back to a MIME inferred from the extension when the blob has none.
         if (!blob.type) {
            const mime = getMimeFromName((blob as File).name);
            if (mime) {
               result = result.replace(/^data:[^;]+/, `data:${mime}`);
            }
         }
         resolve(result);
      };
      reader.readAsDataURL(blob);
   });

/** Build a self-contained HTML document around the rendered markdown body. */
const buildHTML = (title: string, body: string, css: string) => `<!DOCTYPE html>
<html lang="${i18n.locale.value}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Noto+Sans+SC:wght@100..900&display=swap" rel="stylesheet" />
<style>
${css}
.markdown-body { max-width: 80%; margin: 0 auto; padding: 2em 1.5em; }
</style>
</head>
<body>
${body}
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"><\/script>
<script>
mermaid.initialize({ startOnLoad: false });
document.querySelectorAll(".language-mermaid").forEach(function (el) {
   mermaid.run({ node: el });
});
<\/script>
</body>
</html>`;

/** Export the current markdown as a standalone HTML file. */
const exportHTML = async () => {
   const file = preview.value;
   if (!file) return;
   const text = await file.readText();
   if (text === null) return;
   let body = renderMarkdown(text);
   // Inline local image resources as data URLs; keep remote URLs as-is.
   const base = previewFileSystemBase.value ?? fileSystemRoot;
   const doc = new DOMParser().parseFromString(
      `<div class="markdown-body">${body}</div>`,
      "text/html",
   );
   for (const img of doc.querySelectorAll("img[src]")) {
      const src = img.getAttribute("src")!;
      if (URL.canParse(src)) continue;
      const res = base.getItem(src);
      if (res instanceof FileSystemFile) {
         let f = res.file;
         if (!f) {
            await res.updateFile();
            f = res.file;
         }
         if (f) img.setAttribute("src", await blobToDataURL(f));
      }
   }
   body = doc.body.innerHTML;
   const title =
      exportSettings.title || file.name.replace(/\.(md|markdown)$/g, "");
   const blob = new Blob([buildHTML(title, body, styling.style)], {
      type: "text/html;charset=utf-8",
   });
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = `${title}.html`;
   a.click();
   setTimeout(() => URL.revokeObjectURL(url), 1000);
   messages.add(t("exportSettings.outputHTMLDone"), "success");
};

const printDocument = async () => {
   if (!preview.value) return;
   document.title = exportSettings.title;
   await fullscreenPreview.display(preview.value);
   document.title = "Markdown Exp";
   exportSettings.starUsIfYouLikeIt = true;
};

const platform = computed(() => {
   const ua = navigator.userAgent.toLowerCase();

   if (/android/.test(ua)) return "android";
   if (/iphone|ipad|ipod/.test(ua)) return "ios";

   if (/chrome/.test(ua) && /google inc/.test(navigator.vendor.toLowerCase())) {
      return "chrome";
   }
   if (
      /safari/.test(ua) &&
      /apple computer/.test(navigator.vendor.toLowerCase())
   ) {
      return "safari";
   }

   return "unknown";
});
</script>

<style scoped>
.mode-inner {
   border-left: 2px solid rgba(var(--v-theme-primary), 0.2);
   height: stretch;
   display: inline-flex;
   align-items: center;
   padding: 0 1em;
   flex-direction: column;
   font-size: 0.8em;
   justify-content: center;
   text-align: center;
}

.context-popover {
   position: fixed;
   z-index: 1000;
   min-width: 12em;
   border-radius: 4px;
   overflow: hidden;
   background: rgb(var(--v-theme-surface));
   box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
   transform-origin: top left;
}

.context-popover-enter-active,
.context-popover-leave-active {
   transition:
      opacity 0.16s cubic-bezier(0.25, 0.8, 0.5, 1),
      transform 0.16s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.context-popover-enter-from,
.context-popover-leave-to {
   opacity: 0;
   transform: scale(0.92);
}

.context-popover-enter-to,
.context-popover-leave-from {
   opacity: 1;
   transform: scale(1);
}

.tree-drag-over {
   background: rgba(var(--v-theme-primary), 0.15) !important;
   outline: 1px dashed rgb(var(--v-theme-primary));
   outline-offset: -1px;
   border-radius: 4px;
}

.tree-item-title {
   display: block;
   flex: 1;
}

:deep(.v-list-item__content) {
   display: flex;
   align-items: center;
   flex: 1;
   min-width: 0;
}
.local-starting {
   display: flex;
   align-items: center;
   justify-content: center;
   user-select: none;
   padding-bottom: 5%;
   gap: 2em;
}

.local-starting .describe {
   width: 32%;
   max-width: 22em;
}

.local-starting .actions {
   flex-direction: column;
}

@media (max-width: 768px) {
   .local-starting {
      flex-direction: column;
      gap: 1em;
      height: 100%;
   }
   .local-starting .describe {
      width: 75%;
   }
}

@media (max-width: 768px) and (max-height: 900px) {
   .local-starting .project-descriptions {
      display: none;
   }
   .local-starting .project-title {
      margin-bottom: 0.5em;
   }
}

@media (max-width: 768px) and (max-height: 600px) {
   .local-starting .actions {
      flex-direction: row;
      gap: 1em;
   }
}

@media (max-width: 768px) {
   .local-workspace {
      display: flex;
      flex-direction: column !important;
   }
   .local-workspace > .file-system {
      width: 100% !important;
      height: 16em !important;
   }

   .local-workspace > .preview {
      width: 100% !important;
      height: calc(100% - 16em) !important;
   }
}

.slide-enter-active,
.slide-leave-active {
   transition:
      transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
      opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-enter-from,
.slide-reversed-leave-to {
   position: absolute;
   transform: translateX(50%);
   opacity: 0;
}

.slide-leave-to,
.slide-reversed-enter-from {
   position: absolute;
   transform: translateX(-50%);
   opacity: 0;
}

.slide-reversed-enter-active,
.slide-reversed-leave-active {
   transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.export-preview {
   max-height: 100%;
   max-width: 50%;
   aspect-ratio: 1 / 1.414;
}

.export-preview ::-webkit-scrollbar,
:deep(.export-preview .preview-source-toggle) {
   display: none;
}

@media (max-width: 768px) {
   .export-preview {
      display: none;
   }
}

</style>
