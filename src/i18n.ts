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
            loadFromGithubRepo: "- Load files from GitHub repository",
            highQualityDocumentRendering: "- High-quality document rendering",
            customStylesAndThemes: "- Custom styles & themes",
            tryItOut: "Try it out",
            starUsOnGitHub: "Star us on GitHub",
            startingPoint: "Choose your starting point...",
            workspace: "Local Workspace",
            workspaceDescribe:
               "Open a folder containing the Markdown file and its assets",
            singleFile: "Single File",
            singleFileDescribe: "Choose a standalone .md file",
            fromRepo: "From Github Repository",
            fromRepoDescribe: "Open a Github repository.",
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
            pickAFile: "Pick a file from the workspace"
         },
         exportSettings: {
            title: "Title",
            useCustomStyle: "Use Custom Style",
            close: "Close",
            print: "Print",
            chromeInstructions: "Please select <b>Save as PDF</b> as the <b>Destination</b>. <br />Tips: Check <b>Background graphics</b> for a better visual experience. You can also adjust <b>Margins</b>, <b>Paper size</b>, and more in the print settings.",
            safariInstructions: "Please click <b>PDF</b> in the bottom-left corner.",
            androidInstructions: "Please select <b>Save as PDF</b>.",
            iosInstructions: "Tap the <b>Share</b> icon in the top-right to save as PDF.",
            starUs: "If you find this project useful, please consider giving it a star on GitHub."
         },
         styleEditor: {
            presets: "Presets",
            allowUnsafe: "Allow unsafe content",
            options: "Options",
            hideMeta: "Hide metadata",
            singleImageLabel: "Single line image",
            singleImage: {
               default: 'Default' ,
               center: 'Center',
               center_alt: 'Center image with alt text below'
            }
         },
         messages: {
            directoryNotExists: "Directory {dict} not exists.",
            failedToFetchTree: "Failed to fetch tree: {message}",
            failedToFetchRepository: "Failed to fetch repository: {message}",
         },
      },
      zh: {
         starting: {
            is: "是一个简洁、强大、开源的 Markdown to PDF 转换器。",
            gfmSupport: "- 支持 GitHub Flavored Markdown (GFM)",
            seamlessLocalAssetIntegration: "- 无缝的本地资源集成",
            loadFromGithubRepo: "- 从 GitHub 仓库载入文件",
            highQualityDocumentRendering: "- 打印质量的文档渲染",
            customStylesAndThemes: "- 自定义样式和主题",
            tryItOut: "试一试",
            starUsOnGitHub: "在 GitHub 上 Star 我们",
            startingPoint: "让我们从哪里开始？",
            workspace: "本地工作区",
            workspaceDescribe: "打开包含 Markdown 文件及其资源的文件夹",
            singleFile: "单个文件",
            singleFileDescribe: "选择单个 Markdown 文件",
            fromRepo: "从 Github 仓库",
            fromRepoDescribe: "打开 Github 仓库",
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
            pickAFile: "请从工作区选择一个文件"
         },
         exportSettings: {
            title: "标题",
            useCustomStyle: "自定义样式",
            close: "关闭",
            print: "打印",
            chromeInstructions: "请选择 <b>目标打印机</b> 为 <b>另存为 PDF</b>。<br/>提示：勾选 <b>背景图形</b> 以获得更好的视觉体验。<br/>您还可以在打印设置中调整 <b>边距</b>、<b>纸张大小</b> 等。",
            safariInstructions: "请点击左下角的 <b>PDF</b>。",
            androidInstructions: "请选择 <b>另存为 PDF</b>。",
            iosInstructions: "点击右上角的 <b>分享</b> 图标保存为 PDF。",
            starUs: "如果您喜欢这个项目的话，欢迎在 GitHub 上 Star 我们！"
         },
         styleEditor: {
            presets: "预设",
            allowUnsafe: "允许不安全的内容",
            options: "选项",
            hideMeta: "隐藏元数据",
            singleImageLabel: "单行图片",
            singleImage: {
               default: '默认' ,
               center: '居中',
               center_alt: '居中，在下方显示描述文本'
            }
         },
         messages: {
            directoryNotExists: "目录 {dict} 不存在。",
            failedToFetchTree: "获取树失败: {message}",
            failedToFetchRepository: "获取仓库失败: {message}",
         },
      },
   },
});
