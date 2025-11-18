import { Hono } from "hono";
// Minimal bindings typing to satisfy TS when Env is not defined in this repo
type WorkerBindings = Record<string, unknown>;
const app = new Hono<{ Bindings: WorkerBindings }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

export default app;
