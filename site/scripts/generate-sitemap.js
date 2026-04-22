import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./sitemap-routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://vidcluster.com";

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const urls = routes
  .map((route) => {
    const loc = `${SITE_URL}${route}`;
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outputPath = path.join(__dirname, "..", "public", "sitemap.xml");

fs.writeFileSync(outputPath, xml, "utf8");

console.log(`sitemap.xml generated at: ${outputPath}`);
