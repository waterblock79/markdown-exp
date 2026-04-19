import MarkdownIt from "markdown-it";

const ALERT_MAP: Record<string, { label: string; icon: string }> = {
   NOTE: { label: "Note", icon: "mdi-information-slab-circle-outline" },
   TIP: { label: "Tip", icon: "mdi-lightbulb-outline" },
   IMPORTANT: { label: "Important", icon: "mdi-comment-alert-outline" },
   WARNING: { label: "Warning", icon: "mdi-alert-outline" },
   CAUTION: { label: "Caution", icon: "mdi-alert-circle-outline" },
};

export const markdownItAlert = (md: MarkdownIt) => {
   md.core.ruler.after("block", "github_alerts", (state) => {
      const tokens = state.tokens;
      for (let i = 0; i < tokens.length; i++) {
         if (tokens[i]?.type === "blockquote_open") {
            for (let j = i + 1; j < tokens.length; j++) {
               if (tokens[j]?.type === "blockquote_close") break;

               if (tokens[j]?.type === "inline") {
                  const match = tokens[j]?.content.match(
                     /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i,
                  );
                  if (match) {
                     const type = match[1]!.toUpperCase();
                     tokens[j]!.content = tokens[j]!.content.replace(
                        match[0],
                        "",
                     ).trimStart();
                     tokens[i]!.meta = { alertType: type };
                     break;
                  }
               }
            }
         }
      }
   });

   md.renderer.rules.blockquote_open = (tokens, idx, options, _env, self) => {
      const type = tokens[idx]?.meta?.alertType;

      if (type && ALERT_MAP[type]) {
         const config = ALERT_MAP[type];
         return `<blockquote class="alert alert-${type.toLocaleLowerCase()}"><div class="alert-head"><i class="${config.icon} mdi mr-1"></i>${config.label}</div>`;
      }

      return self.renderToken(tokens, idx, options);
   };
};
