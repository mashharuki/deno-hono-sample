import { Hono, validator } from "hono";
import {
  addUser,
  badRequest,
  deleteUser,
  findAllUsers,
  findUserById,
  isPostUserRequest,
  isPutUserRequest,
  notFound,
  updateUser,
} from "./util.ts";

// insert initial data
await addUser({
  name: "Harmon",
  age: 25,
});
await addUser({
  name: "Wheeler",
  age: 26,
});
await addUser({
  name: "Parks",
  age: 27,
});

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
  return value ? c.json({ ...value, id }) : c.json(notFound, 404);
}).post( // ユーザー追加APIメソッド
  "/users",
  validator("json", (value, c) => {
    return isPostUserRequest(value) ? value : c.json(badRequest, 400);
  }),
  async (c) => {
    const { name, age } = c.req.valid("json");
    const { result, id } = await addUser({ name, age });
    if (result.ok) {
      return c.json({ name, age, id }, 201);
    }
    return c.json(internalServerError, 500);
  },
).put( // ユーザー更新APIメソッド
  "/users/:id",
  validator("json", (value, c) => {
    return isPutUserRequest(value) ? value : c.json(badRequest, 400);
  }),
  async (c) => {
    const id = c.req.param("id");
    const value = c.req.valid("json");
    const isUpdated = await updateUser(id, value);
    return isUpdated ? c.json(null) : c.json(badRequest, 400);
  },
).delete( // ユーザー削除APIメソッド
  "/users/:id",
  async (c) => {
    const id = c.req.param("id");
    const result = await deleteUser(id);
    return result ? c.json(null) : c.json(badRequest, 400);
  },
);

Deno.serve(app.fetch);

export default app;
