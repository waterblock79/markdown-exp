/**
 * Print an HTML file to PDF with Playwright's Chromium.
 *
 * Usage: node html-to-pdf.mjs <input.html> [output.pdf]
 */

import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [input, output = "output.pdf"] = process.argv.slice(2);

if (!input) {
   console.error("Usage: node html-to-pdf.mjs <input.html> [output.pdf]");
   process.exit(1);
}

const inputPath = path.resolve(input);
const outputPath = path.resolve(output);

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(pathToFileURL(inputPath).href, { waitUntil: "networkidle" });
// Mermaid renders in the page after its CDN script loads, so give it a moment.
await page.waitForTimeout(1000);

await page.pdf({
   path: outputPath,
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
console.log(`PDF exported to ${outputPath}`);
