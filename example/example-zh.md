## 示例 Markdown 文档

通过 **Markdown**，您可以使用简单、可读的语法，为您的文档创建复杂的格式。例如，我们可以通过 `**加粗文本**` 来创建一个 **加粗文本**。

![样例图像](./images/example-image-zh.svg)

Markdown **Exp** 可以帮助您将 Markdown 文件呈现为打印质量的文档，您可以通过浏览器打印功能中的 **另存为 PDF** 来将文档保存为 PDF:page_facing_up:。

> [!TIP]
> Markdown **Exp** 使用 markdown-it、mermaid、highlight.js、@vscode/markdown-it-katex、markdown-it-footnote、markdown-it-emoji 和 github-markdown-css
 库，Noto Sans SC 和 Jetbrains Mono 字体，以及样式微调来让文档呈现更适合打印，例如：
> ```css
> .markdown-body pre,
> .markdown-body code {
>    font-family: "JetBrains Mono", "Noto Sans SC", monospace !important;
>    text-wrap: auto !important;
> }
> ```


Markdown **Exp** 的默认呈现尽可能与 **Github 风格的 Markdown** 保持一致，包括样式与功能[^1]。得益于文件系统 API，我们还支持引用本地资源[^2]。

如果您喜欢 Markdown **Exp** 的话，欢迎 Star 这个项目！

[^1]: 包括 $\LaTeX$、`代码高亮`、*mermaid* 等等。
[^2]: 例如本地图片。