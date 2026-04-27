import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const staticRoutes = [
  "/",
  "/method",
  "/research",
  "/insights",
  "/pricing",
  "/signup",
  "/login",
  "/vidiq-alternative",
  "/tubebuddy-alternative",
  "/contact",
];

function loadInsights() {
  const insightsPath = path.join(__dirname, "..", "src", "content", "insights.ts");
  const source = fs.readFileSync(insightsPath, "utf8");

  const match = source.match(/export const insights(?:\s*:\s*[^=]+)?\s*=\s*(\[[\s\S]*?\]);/);

  if (!match) {
    throw new Error(`Unable to parse insights registry at ${insightsPath}`);
  }

  return vm.runInNewContext(match[1]);
}

const insightRoutes = loadInsights().map((article) => article.slug);

const routes = [...staticRoutes, ...insightRoutes];

export default routes;
