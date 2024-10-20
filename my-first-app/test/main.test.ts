import app from "../src/main.ts";
import { assert, assertEquals, assertInstanceOf } from "assert";

type User = { id: string; name: string; age: number };

Deno.test("GET /users", async () => {
  const res = await app.request("/users", { method: "GET" });
  assertEquals(res.status, 200);
  const json = await res.json();
  assertInstanceOf(json, Array<User>);
});
