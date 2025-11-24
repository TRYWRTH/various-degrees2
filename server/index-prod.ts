import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";

import express, { type Express } from "express";
import runApp from "./app";

export async function serveStatic(app: Express, _server: Server) {
  // Correct build folder
  const distPath = path.resolve(import.meta.dirname, "../dist");

  if (!fs.existsSync(distPath)) {
    console.warn(
      `Build directory not found: ${distPath}. Run 'npm run build' to create it.`,
    );
    
    app.use("*", (_req, res) => {
      res.status(503).send("Service temporarily unavailable. Please run: npm run build");
    });
    return;
  }

  // Serve root dist files (index.html, index.js, favicon, etc.)
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true,
  }));

  // Serve Vite-generated assets separately
  app.use('/assets', express.static(path.join(distPath, "assets"), {
    maxAge: '1d',
    immutable: true,
  }));

  // Catch-all: return index.html
  app.use("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

(async () => {
  await runApp(serveStatic);
})();
