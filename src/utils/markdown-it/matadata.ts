import MarkdownIt from "markdown-it";
import { parseDocument } from "yaml";

const regex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*/;

export const markdownItMetadata = (md: MarkdownIt): void => {
   md.core.ruler.before("block", "yaml_metadata", (state) => {
      const match = state.src.match(regex);

      if (match && match[1]) {
         const token = new state.Token("yaml_metadata", "pre", 0);
         token.content = match[1].trim();
         state.tokens.push(token);
         state.src = state.src.slice(match[0].length);
      }
      return true;
   });

   md.renderer.rules.yaml_metadata = (tokens, idx) => {
      return `<pre class="yaml-metadata">${md.utils.escapeHtml(tokens[idx]!.content)}</pre>\n`;
   };
};

export const getMetadata = (raw: string) => {
   const match = raw.match(regex);
   if (match && match[1]) {
      return parseDocument(match[1].trim()).toJSON();
   } else return {};
}