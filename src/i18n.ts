import { createI18n } from "vue-i18n";

const language = (navigator.language || 'zh').toLocaleLowerCase()
const locale = language.startsWith('zh') ? 'zh' : 'en'

export const i18n = createI18n({
   locale: locale,
   fallbackLocale: "en",
   messages: {
      en: {
         starting: {
            is: "is a clean, powerful, open-source converter that transforms your Markdown into print-quality PDFs.",
            gfmSupport: "- GitHub Flavored Markdown (GFM) support",
            seamlessLocalAssetIntegration: "- Seamless local asset integration",
            editOnlineAndLoadFromGitHub: "- Edit online / Load files from GitHub repository",
            highQualityDocumentRendering: "- High-quality document rendering",
            tryItOut: "Try it out",
            starUsOnGitHub: "Star us on GitHub",
            startingPoint: "Choose your starting point...",
            workspace: "Local Workspace",
            workspaceDescribe:
               "Open a folder containing the Markdown file and its assets.",
            singleFile: "Open Single File",
            singleFileDescribe: "Choose a standalone .md file",
            fromRepo: "From Github Repository",
            fromRepoDescribe: "Open a Github repository.",
            fromScratch: "From Scratch",
            fromScratchDescribe: "Create an empty virtual workspace.",
            using: " With Markdown Exp, you can convert your Markdown files into print-quality PDF documents online.",
            exampleDocument: "## Example Markdown Document  \nWith **Markdown**, you can create complex formatting for your documents using a simple, readable syntax. For instance, we can use `**bold text**` to create **bold text**. \n\n Furthermore, $\\LaTeX$ formulas, `code block`, tables, and more can be easily integrated into your Markdown documents!\n\n![image](./example-image.svg)"
         },
         repo: {
            title: "Open a Github repository",
            repository: "Repository",
            branch: "Branch",
            dictionary: "Dictionary",
            close: "Close",
            open: "Open",
         },
         workspace: {
            back: "Back",
            export: "Export",
            pickAFile: "Pick a file from the workspace",
            newFile: "New File",
            newFolder: "New Folder",
            uploadFile: "Upload",
            newFileName: "Enter file name",
            newFolderName: "Enter folder name",
            rename: "Rename",
            delete: "Delete",
            copy: "Copy",
            renameName: "Enter new name",
            deleteConfirm: 'Delete this file or folder? This action cannot be undone.',
            pack: "Save Workspace",
            packed: "Workspace saved as ZIP.",
            upload: "Upload ZIP",
            replaceConfirm: "Replace the current workspace with the files from the ZIP?",
            replace: "Replace",
            invalidZip: "Invalid ZIP file."
         },
         preview: {
            preview: "Preview View",
            source: "Source View",
            split: "Split View"
         },
         exportSettings: {
            title: "Title",
            useCustomStyle: "Use Custom Style",
            close: "Close",
            print: "Print",
            outputHTML: "Export HTML",
            outputHTMLDone: "HTML exported.",
            chromeInstructions: "Please select <b>Save as PDF</b> as the <b>Destination</b>. <br />Tips: Check <b>Background graphics</b> for a better visual experience. You can also adjust <b>Margins</b>, <b>Paper size</b>, <b>Scale</b> and more in the print settings.",
            safariInstructions: "Please click <b>PDF</b> in the bottom-left corner.",
            androidInstructions: "Please select <b>Save as PDF</b>.",
            iosInstructions: "Tap the <b>Share</b> icon in the top-right to save as PDF.",
            starUs: "If you find this project useful, please consider giving it a star on GitHub."
         },
         styleEditor: {
            presets: "Presets",
            allowUnsafe: "Allow unsafe content"
         },
         messages: {
            directoryNotExists: "Directory {dict} not exists.",
            failedToFetchTree: "Failed to fetch tree: {message}",
            failedToFetchRepository: "Failed to fetch repository: {message}",
            nameExists:
               "A file or folder with this name already exists.",
         }
      },
      zh: {
         starting: {
            is: "是一个简洁、强大、开源的 Markdown to PDF 转换器。",
            gfmSupport: "- 支持 GitHub Flavored Markdown (GFM)",
            seamlessLocalAssetIntegration: "- 无缝的本地资源集成",
            editOnlineAndLoadFromGitHub: "- 在线编辑 / 从 GitHub 仓库加载",
            highQualityDocumentRendering: "- 打印质量的文档渲染",
            tryItOut: "试一试",
            starUsOnGitHub: "在 GitHub 上 Star 我们",
            startingPoint: "让我们从哪里开始？",
            workspace: "本地工作区",
            workspaceDescribe: "打开包含 Markdown 文件及其资源的文件夹",
            singleFile: "打开单个文件",
            singleFileDescribe: "选择单个 Markdown 文件",
            fromRepo: "从 Github 仓库",
            fromRepoDescribe: "打开 Github 仓库",
            fromScratch: "在线编辑",
            fromScratchDescribe: "创建一个新的虚拟工作区、适合临时编辑",
            using: "通过 Markdown Exp，您可以在线地将您的 Markdown 文件转换为打印质量的 PDF 文档。",
            exampleDocument: "## 示例 Markdown 文档  \n使用 **Markdown**，您可以使用简单、可读的语法为文档创建复杂的格式。例如，我们可以使用 `**加粗文本**` 来创建 **加粗文本**。\n\n 此外，$\\LaTeX$ 公式、`代码块`、表格等都可以轻松地集成到您的 Markdown 文档中！\n\n![image](./example-image.svg)"
         },
         repo: {
            title: "打开 Github 仓库",
            repository: "仓库",
            branch: "分支",
            dictionary: "目录",
            close: "关闭",
            open: "打开",
         },
         workspace: {
            back: "返回",
            export: "导出",
            pickAFile: "请从工作区选择一个文件",
            newFile: "新建文件",
            newFolder: "新建文件夹",
            uploadFile: "上传文件",
            newFileName: "请输入文件名",
            newFolderName: "请输入文件夹名",
            rename: "重命名",
            delete: "删除",
            copy: "复制",
            renameName: "请输入新名称",
            deleteConfirm: '确定要删除该文件或文件夹吗？此操作无法撤销。',  
            pack: "保存工作区",
            packed: "工作区已保存为 ZIP。",
            upload: "上传 ZIP",
            replaceConfirm: "是否用 Zip 中的文件替换当前工作区中的文件？",
            replace: "替换",
            invalidZip: "无效的 ZIP 文件。"
         },
         preview: {
            preview: "预览视图",
            source: "源码视图",
            split: "分割视图"
         },
         exportSettings: {
            title: "标题",
            useCustomStyle: "自定义样式",
            close: "关闭",
            print: "打印",
            outputHTML: "导出 HTML",
            outputHTMLDone: "HTML 已导出。",
            chromeInstructions: "请选择 <b>目标打印机</b> 为 <b>另存为 PDF</b>。<br/>提示：勾选 <b>背景图形</b> 以获得更好的视觉体验。<br/>您还可以在打印设置中调整 <b>边距</b>、<b>纸张大小</b>、<b>缩放</b> 等。",
            safariInstructions: "请点击左下角的 <b>PDF</b>。",
            androidInstructions: "请选择 <b>另存为 PDF</b>。",
            iosInstructions: "点击右上角的 <b>分享</b> 图标保存为 PDF。",
            starUs: "如果您喜欢这个项目的话，欢迎在 GitHub 上 Star 我们！"
         },
         styleEditor: {
            presets: "预设",
            allowUnsafe: "允许不安全的内容"
         },
         messages: {
            directoryNotExists: "目录 {dict} 不存在。",
            failedToFetchTree: "获取树失败: {message}",
            failedToFetchRepository: "获取仓库失败: {message}",
            nameExists: "已存在同名文件或文件夹。",
         },
      },
   },
});
