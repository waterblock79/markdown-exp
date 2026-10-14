/**
 * Markdown Exp command-line tool
 *
 * Usage: pnpm convert <Markdown file> [options]
 * Options: -o, --output <name>; -s, --theme <github|serif|none>;
 *          -c, --css <CSS file>; -t, --title <title>; -h, --help
 * By default, exports an HTML file with the same name and uses the GitHub theme; when --css is specified, the built-in theme is not used by default.
 * Example: pnpm convert example.md --theme serif --title "Example Document"
 */

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

type CLIOptions = {
   input: string | null;
   output: string | null;
   theme: string | null;
   css: string | null;
   title: string | null;
   help?: boolean;
};

const printHelp = (): void => {
   console.log(`Usage: pnpm convert <markdown-file> [options]

Options:
  -o, --output <name>     HTML output name or path (default: input name)
  -s, --theme <name>      Built-in theme: github, serif, or none
  -c, --css <file>        Link an additional CSS file
  -t, --title <title>     HTML document title (default: input file name)
  -h, --help              Show this help`);
};

const parseArguments = (args: string[]): CLIOptions => {
   const options: CLIOptions = {
      input: null,
      output: null,
      theme: null,
      css: null,
      title: null,
   };
   const takeValue = (index: number, option: string): string => {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) {
         throw new Error(`Option ${option} requires a value.`);
      }
      return value;
   };

   for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      switch (arg) {
         case "-h":
         case "--help":
            options.help = true;
            break;
         case "-o":
         case "--output":
            options.output = takeValue(i, arg);
            i += 1;
            break;
         case "-s":
         case "--theme":
            options.theme = takeValue(i, arg).toLowerCase();
            i += 1;
            break;
         case "-c":
         case "--css":
            options.css = takeValue(i, arg);
            i += 1;
            break;
         case "-t":
         case "--title":
            options.title = takeValue(i, arg);
            i += 1;
            break;
         default:
            if (arg.startsWith("-")) {
               throw new Error(`Unknown option: ${arg}`);
            }
            if (options.input) {
               throw new Error("Only one Markdown input file can be specified.");
            }
            options.input = arg;
      }
   }
   return options;
};

const escapeHTML = (value: string): string =>
   value.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
   })[character]!);

const getStylesheetHref = (cssPath: string, outputPath: string): string => {
   if (/^(https?:|data:|file:)/i.test(cssPath)) return cssPath;
   const absoluteCssPath = path.resolve(cssPath);
   let href = path.relative(path.dirname(outputPath), absoluteCssPath);
   if (path.isAbsolute(href)) return pathToFileURL(absoluteCssPath).href;
   if (!href.startsWith(".")) href = `.${path.sep}${href}`;
   return href.split(path.sep).join("/");
};

const buildHTML = ({
   title,
   body,
   css,
   cssHref,
}: {
   title: string;
   body: string;
   css: string;
   cssHref: string;
}): string => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHTML(title)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Noto+Sans+SC:wght@100..900&display=swap" rel="stylesheet" />
<style>
${css}
.markdown-body { max-width: 80%; margin: 0 auto; padding: 2em 1.5em; }
.mr-1 { margin-right: 0.25em; }
</style>
${cssHref ? `<link rel="stylesheet" href="${escapeHTML(cssHref)}" />` : ""}
</head>
<body>
<div class="markdown-body">${body}</div>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"><\/script>
<script>
mermaid.initialize({ startOnLoad: false });
mermaid.run({ nodes: document.querySelectorAll(".language-mermaid") })
   .catch(function (err) {
      console.error("Failed to render mermaid diagram:", err);
   });
<\/script>
</body>
</html>`;

const main = async () => {
   const options = parseArguments(process.argv.slice(2));
   if (options.help) {
      printHelp();
      return;
   }
   if (!options.input) {
      printHelp();
      throw new Error("A Markdown input file is required.");
   }

   const inputPath = path.resolve(options.input);
   const inputBaseName = path.basename(inputPath).replace(/\.(md|markdown)$/i, "");
   const defaultOutput = inputPath.replace(/\.(md|markdown)$/i, ".html");
   const outputPath = path.resolve(options.output ?? defaultOutput);
   const outputName = path.basename(outputPath);
   const resolvedOutputPath = /\.html?$/i.test(outputName)
      ? outputPath
      : `${outputPath}.html`;
   const title = options.title ?? inputBaseName;
   const themeName = options.theme ?? (options.css ? "none" : "github");

   const dom = new JSDOM("<!doctype html><html><body></body></html>");
   Object.defineProperty(globalThis, "window", {
      value: dom.window,
      configurable: true,
   });
   globalThis.document = dom.window.document;
   globalThis.DOMParser = dom.window.DOMParser;
   globalThis.HTMLImageElement = dom.window.HTMLImageElement;

   const [{ renderMarkdown }, { presetStyles }] = await Promise.all([
      import("./src/utils/markdown.ts"),
      import("./src/stores/styling.ts"),
   ]);
   const themeStyles = Object.fromEntries(
      Object.entries(presetStyles).map(([name, style]) => [name.toLowerCase(), style]),
   );
   if (themeName !== "none" && !themeStyles[themeName]) {
      throw new Error(`Unknown theme "${themeName}". Choose github, serif, or none.`);
   }

   const rawMarkdown = await readFile(inputPath, "utf8");
   let cssHref = "";
   if (options.css && !/^(https?:|data:|file:)/i.test(options.css)) {
      await access(path.resolve(options.css));
   }
   if (options.css) {
      cssHref = getStylesheetHref(options.css, resolvedOutputPath);
   }

   const body = renderMarkdown(rawMarkdown);
   const html = buildHTML({
      title,
      body,
      css: themeStyles[themeName] ?? "",
      cssHref,
   });
   await mkdir(path.dirname(resolvedOutputPath), { recursive: true });
   await writeFile(resolvedOutputPath, html, "utf8");
   console.log(`HTML exported to ${resolvedOutputPath}`);
};

main().catch((error) => {
   console.error(`Error: ${error.message}`);
   process.exitCode = 1;
});
