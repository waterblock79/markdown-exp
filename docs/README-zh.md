<a href="https://waterblock79.github.io/markdown-exp" about="_blank"><h2 align="center">Markdown Exp</h2></a>

<a href="https://waterblock79.github.io/markdown-exp"><img src="../public/markdown-exp.svg" width="100%" /></a>


<p align=center>
Markdown <b>Exp</b> 是一个干净、强大的开源 Markdown to PDF 在线转换器<br/>
我们还提供了一个 Skill，让 Agents 可以把 Markdown 文件转换成 HTML / PDF<br />
>
<a href="https://waterblock79.github.io/markdown-exp"> <b>在线体验</b> </a> | 
<a href="https://github.com/waterblock79/markdown-exp/blob/main/.agents/skills/"><b>查看 Skill</b></a>
</p>

### 功能

- 📄 完整的 **GitHub Flavored Markdown**（GFM）支持
- 📝 从 **本地** / **远程仓库** 加载文件
- 📁 无缝 **集成本地资源**（引用的本地图片等）
- 🪶 **在线编辑** 和 **预览** Markdown 文件
- 🖨️ **打印质量** 的 Markdown 渲染

<img src="../public/workflow-zh.svg" align="center"/>

### Skill

Agent 可以使用 Markdown Exp Skill 将 Markdown 文件转换为 HTML 或 PDF 文档。将以下提示粘贴到您的 Agent 中：

```text
将仓库 https://github.com/waterblock79/markdown-exp 克隆到本地，并安装 `.agents/skills/markdown-exp/` 中的 Skill，例如 `~/.agents/skills/markdown-exp/`（或当前项目中的 `.agents/skills/markdown-exp/`）。保持 `SKILL.md` 和 `scripts/` 在一起，阅读 `SKILL.md`，并在需要将 Markdown 转换为 HTML 或 PDF 时遵循它。
```

完整 Skill 说明：`.agents/skills/markdown-exp/SKILL.md`。  
与 `humanizer` 等类似 Skill 配合使用可生成更自然、高质量的文档。


### 截图

<img src="../public/screenshot-1.png" align="center"/>

<img src="../public/screenshot-2.png" align="center"/>

<img src="../public/screenshot-3.png" align="center"/>

### 开发

```bash
# 需要 Node.js 和 pnpm
pnpm install
pnpm dev
pnpm build
```

本项目的 Markdown 渲染工作流在 `docs/markdown-rendering.md` 中有详细说明~