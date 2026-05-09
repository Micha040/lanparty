import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let globalState = {
    games: [],
    currentChallengeId: null,
    timerElapsed: 0,
    timerIsRunning: false,
    lastTimerUpdate: null,
  };

  const clients = new Set<express.Response>();

  app.get("/api/state", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write(`data: ${JSON.stringify(globalState)}\n\n`);

    clients.add(res);

    req.on("close", () => {
      clients.delete(res);
    });
  });

  app.post("/api/state", (req, res) => {
    globalState = { ...globalState, ...req.body };
    const data = `data: ${JSON.stringify(globalState)}\n\n`;
    for (const client of clients) {
      client.write(data);
    }
    res.status(200).json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use((req, res, next) => {
      vite.middlewares(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
