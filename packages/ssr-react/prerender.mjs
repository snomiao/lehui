// Pre-render the app into static HTML.
// run `yarn generate` and then `dist/static` can be served as a static site.

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { render } from "./dist/server/entry-server.js";

const template = readFileSync(resolve("dist/static/index.html"), "utf-8");

// determine routes to pre-render from src/pages
const routesToPrerender = readdirSync(resolve("src/pages")).map((file) => {
  const name = file.replace(/\.jsx|tsx$/, "").toLowerCase();
  return name === "index" ? `/` : `/${name}`;
});

(async () => {
  // pre-render each route...
  for (const url of routesToPrerender) {
    const context = {};
    const appHtml = await render(url, context);

    const html = template.replace(`<!--app-html-->`, appHtml);

    const filePath = `dist/static${url === "/" ? "/index" : url}.html`;
    writeFileSync(resolve(filePath), html);
    console.log("pre-rendered:", filePath);
  }
})();
