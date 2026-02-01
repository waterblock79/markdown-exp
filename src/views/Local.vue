<template>
   <transition :name="translationReversed ? 'slide-reversed' : 'slide'">
      <div
         key="starting"
         class="local-starting text-h6 top-0 left-0 w-100 h-100"
         color="primary"
         variant="text"
         :v-ripple="false"
         v-if="!fileSystemRoot.size && !exportSettings.is"
      >
         <div class="text-center font-weight-regular opacity-90 describe">
            <div>
               <a
                  class="text-primary opacity-100 text-decoration-none"
                  href="//github.com/waterblock79/markdown-exp"
                  target="blank"
               >
                  Markdown <b>Exp</b>
               </a>
               {{ $t("starting.is") }}
            </div>
            <div class="text-subtitle-2 font-monospace my-4">
               {{ $t("starting.gfmSupport") }}<br />
               {{ $t("starting.seamlessLocalAssetIntegration") }}<br />
               {{ $t("starting.highQualityDocumentRendering") }}<br />
               <a
                  class="text-primary text-decoration-none font-weight-medium cursor-pointer"
                  @click="tryItOut"
               >
                  > {{ $t("starting.tryItOut") }} <
               </a>
            </div>
            <div class="d-flex justify-center">
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
               ></v-select>
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
               class="mode mx-8"
               variant="tonal"
               color="primary"
               :prepend-icon="mode.icon"
               :title="mode.title"
               :subtitle="mode.subtitle"
               v-ripple
               v-for="mode in availableModes"
               @click="
                  translationReversed = false;
                  mode.action();
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
         v-else-if="fileSystemRoot.size && !exportSettings.is"
      >
         <div
            class="w-100 d-flex local-workspace"
            :style="{ height: 'calc(100% - 3.2em)' }"
         >
            <div class="w-25 h-100 overflow-auto user-select-none file-system">
               <v-treeview
                  :items="treeviewItems"
                  item-value="id"
                  open-on-click
                  class="mx-2 font-monospace"
                  style="overflow: auto"
                  @click:select="selectFileInTreeview"
               >
                  <template v-slot:prepend="{ item }">
                     <v-icon :icon="item.icon"></v-icon>
                  </template>
               </v-treeview>
            </div>
            <div class="w-75 pa-2 preview">
               <file-preview
                  v-model="preview"
                  :file-system="previewFileSystemBase ?? undefined"
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
                  exportSettings.title = preview?.name || '';
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
               <v-dialog height="75%">
                  <template v-slot:activator="{ props: activatorProps }">
                     <v-btn
                        variant="outlined"
                        v-bind="activatorProps"
                        density="comfortable"
                        class="opacity-70"
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
                  class="mb-4"
                  variant="tonal"
                  color="primary"
                  block
                  prepend-icon="mdi-printer"
                  size="large"
                  @click="printDocument"
               >
                  {{ $t("exportSettings.print") }}
               </v-btn>
               <div class="text-center text-subtitle-2">
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
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import FilePreview from "../components/FilePreview.vue";
import { useMessagesStore } from "../stores/messages";
import { useFullscreenPreview } from "../stores/fullscreen-preview";
import { FileSystemFile, FileSystemFolder } from "../utils/FileSystemTypes";
import StyleEditor from "../components/StyleEditor.vue";

const { t } = useI18n();
const i18n = useI18n();

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

const translationReversed = ref(false);

const fileSystemRoot = reactive(new FileSystemFolder(""));

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
   return preview.value && /\.(md|markdown|txt)$/.test(preview.value.name);
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
   }
};
const selectFolder = async () => {
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

const availableModes = computed(() => [
   {
      title: t("starting.workspace"),
      subtitle: t("starting.workspaceDescribe"),
      icon: "mdi-folder-open",
      action: selectFolder,
   },
   {
      title: t("starting.singleFile"),
      subtitle: t("starting.singleFileDescribe"),
      icon: "mdi-file-document-outline",
      action: selectFile,
   },
   {
      title: t("starting.fromRepo"),
      subtitle: t("starting.fromRepoDescribe"),
      icon: "mdi-source-branch",
      action: () => (openRepoDialog.value = true),
   },
]);

const exportSettings = reactive({
   is: false,
   title: "",
   customStyle: "",
});

const printDocument = async () => {
   if (!preview.value) return;
   document.title = exportSettings.title;
   await fullscreenPreview.display(preview.value);
   document.title = "Markdown Exp";
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
