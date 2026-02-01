## Example Markdown Document

With **Markdown**, you can create complex formatting for your documents using a simple, readable syntax. For instance, we can use `**bold text**` to create **bold text**.

![](./images/example-image.svg)

Markdown **Exp** helps you transform Markdown files into print-quality documents. You can save your work as a PDF via the **Save as PDF** option in the browser's print dialog :page_facing_up:.

> [!TIP]
> Markdown **Exp** utilizes libraries such as markdown-it, mermaid, highlight.js, @vscode/markdown-it-katex, markdown-it-footnote, markdown-it-emoji, and github-markdown-css. It also features Noto Sans SC and JetBrains Mono fonts, along with style fine-tuning to make the rendering more suitable for printing, for example:
> ```css
> .markdown-body pre,
> .markdown-body code {
>    font-family: "JetBrains Mono", "Noto Sans SC", monospace !important;
>    text-wrap: auto !important;
> }
> ```

Markdown **Exp**'s default rendering remains as consistent as possible with **GitHub Flavored Markdown (GFM)** in both style and functionality[^1]. Thanks to the File System API, we also support referencing local assets[^2].

If you like Markdown **Exp**, feel free to Star the project!

[^1]: Includes $\text{LaTeX}$, syntax highlighting, mermaid, etc.
[^2]: For example, local images.