// @ts-check
import express from "express";
import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import { resolve as _resolve } from "path";

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

process.env.MY_CUSTOM_SECRET = "API_KEY_qwertyuiop";

async function createServer(root = process.cwd(), isProd = process.env.NODE_ENV === "production") {
  const resolve = (p) => _resolve(root, p);
  const indexProd = isProd ? readFileSync(resolve("dist/client/index.html"), "utf-8") : "";
  const app = express();
  let vite;
  if (!isProd) {
    vite = await (
      await import("vite")
    ).createServer({
      root,
      logLevel: isTest ? "error" : "info",
      server: {
        middlewareMode: "ssr",
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100,
        },
      },
    });
    // use vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    throw "TODO prod server";
    // app.use(await (await import("compression")).default());
    // app.use(
    //    (await import("serve-static")).default(resolve("dist/client"), {
    //     index: false,
    //   })
    // );
  }
  app.use("/api/*", async (req, res) => {
    try {
      const api = (await vite.ssrLoadModule("/api/api")).default;
      return api(req, res); // dont use next()
    } catch (e) {
      const json = { code: 500, ...e };
      res.status(500).set({ "Content-Type": "application/json" }).end(JSON.stringify(json));
    }
  });
  // other
  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;
      let template, render;
      // HTML render
      if (!isProd) {
        // always read fresh template in dev
        template = await readFile(resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule("/src/entry-server")).render;
      } else {
        // TODO prod
        // template = indexProd;
        // render = await import("./dist/server/entry-server").render;
      }
      const context = {};
      const result = render(url, context);
      if (context.url) {
        // Somewhere a `<Redirect>` was rendered
        return res.redirect(301, context.url);
      }
      const html = template.replace(`<!--app-html-->`, result);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e);
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });
  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(65535, "0.0.0.0", () => {
      console.log("http://localhost:65535");
    }),
  );
}

// for test use
const _createServer = createServer;
export { _createServer as createServer };
