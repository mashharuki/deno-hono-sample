import { Hono } from "hono";
import { findAllUsers, findUserById } from "./util.ts";

const app = new Hono();

/**
 * ヘルスチェック用APIメソッド
 */
app.get("/health", (c) => {
  return c.text("OK!");
});

/**
 * ユーザー一覧取得APIメソッド
 */
app.get(
  "/users",
  async (c) => {
    // ユーザー一覧を取得する。
    const res = await findAllUsers();
    return c.json(res);
  },
).get("/users/:id", async (c) => {
  const id = c.req.param("id");
  // ユーザー情報を取得する。
  const value = await findUserById(id);
  return value ? c.json({ ...value, id }) : c.json("notFound", 404);
});

Deno.serve(app.fetch);

export default app;
