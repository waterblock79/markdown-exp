---
name: markdown-exp
description: 通过 Markdown Exp CLI 将 Markdown 转换为高质量的 HTML / PDF 文件，适用于 Agent 输出结果文档时生成高可读性的美观文档等场景；需要把 Markdown 交付成 HTML 或 PDF、或在命令行批量转换时使用。
---

# Markdown Exp

Markdown Exp 是一个开源的 Markdown 渲染器，支持 GitHub 风格的 Markdown、代码高亮、KaTeX 公式、脚注、提示块和 Mermaid 图表，内置两套排版主题。源码在 https://github.com/waterblock79/markdown-exp 。

## 安装

CLI 是仓库里的脚本，先把仓库放到本地并安装依赖：

```bash
git clone https://github.com/waterblock79/markdown-exp.git
cd markdown-exp
pnpm install
```

需要 Node.js 18 或更高版本。换成 npm、yarn 或 bun 也可以，把 `pnpm install` 替换成对应命令就行，下面的示例统一用 pnpm。`pnpm convert` 要在仓库根目录执行，命令里的相对路径都相对当前工作目录。

Markdown 转 HTML 只用仓库自身的依赖，不必额外安装东西。

## Markdown 转 HTML

```bash
pnpm convert my_md.md
```

默认在输入文件旁边生成同名的 HTML，套用 GitHub 主题。

| 参数 | 说明 |
| --- | --- |
| `-o, --output <name>` | 输出文件名或路径，默认与输入文件同名 |
| `-s, --theme <name>` | 内置主题，可选 `github`（默认）、`serif`、`none` |
| `-c, --css <file>` | 额外引入一个 CSS 文件，指定后默认不再套用内置主题 |
| `-t, --title <title>` | 文档的 `<title>`，默认取输入文件名 |
| `-h, --help` | 显示帮助 |

其中 GitHub 主题是无衬线的，简洁风格，适合技术文档等场景；衬线主题 Serif 模仿出版物风格，适合于日常报告、或需要打印的长文档。`none` 主题不套用任何内置样式，可以通过 `--css <file>` 指定自定义 CSS 文件样式。

```bash
# 指定输出路径和标题
pnpm convert report.md --output dist/report.html --title "季度报告"

# 衬线主题，适合长文和打印
pnpm convert report.md --theme serif

# 用自己的样式表，内置主题自动关闭
pnpm convert report.md --css ./styles/report.css

# 完全不要内置样式
pnpm convert report.md --theme none
```

用 npm 时参数要放在 `--` 后面：

```bash
npm run convert -- report.md --output report.html
```

输出是单个 HTML 文件。字体、KaTeX 样式和 Mermaid 脚本从 CDN 加载，打开和打印时都要联网。Markdown 里引用的图片沿用原来的路径，把 HTML 输出到 Markdown 所在目录可以避免图片失效。

## HTML 转 PDF

把上一步的 HTML 交给 Playwright，用 Chromium 的打印引擎出 PDF。`printBackground: true` 会一起打印背景色和代码高亮。

先装运行环境。请在恰当的目录里安装，比如 Agent 自己的工作区，不要装进 Markdown Exp 仓库：

```bash
cd <agent 工作区>
pnpm i playwright
pnpx playwright install chromium
```

本机如果已经有 Playwright、Puppeteer 或 Chrome/Edge 的无头模式可用，直接调用就好，不必重复安装。

把脚本复制到工作区，Playwright 才能被解析到，然后执行：

```bash
cd <agent 工作区>
cp <本 skill 目录>/scripts/html-to-pdf.mjs .
node html-to-pdf.mjs report.html report.pdf
```

脚本内容（本目录下的 `scripts/html-to-pdf.mjs` 就是这份代码）：

```js
import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [input, output = "output.pdf"] = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(pathToFileURL(path.resolve(input)).href, {
   waitUntil: "networkidle",
});
// Mermaid renders in the page after its CDN script loads, so give it a moment.
await page.waitForTimeout(1000);

await page.pdf({
   path: path.resolve(output),
   format: "A4",
   margin: {
      top: "10mm",
      right: "0mm",
      bottom: "10mm",
      left: "0mm",
   },
   printBackground: true,
});

await browser.close();
```

纸张大小和页边距在 `page.pdf()` 里改。Mermaid 由 HTML 内的 CDN 脚本在页面里渲染，脚本等到网络空闲后再多等一秒；图表多或比较大时，把这个等待时间调长。

## 其他格式

生成的 HTML 不止能打印，Pandoc 可以接着把它转成 Word、EPUB 之类，截图则能得到图片。但若无必要，不要装 Pandoc。
