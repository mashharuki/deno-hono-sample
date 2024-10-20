import { monotonicFactory } from "ulid";

// drop table
try {
  await Deno.remove("kv.sqlite");
} catch (err) {
  if (!(err instanceof Deno.errors.NotFound)) {
    throw err;
  }
}

const kv = await Deno.openKv("kv.sqlite");

export type User = {
  name: string;
  age: number;
};

/**
 * 全てのユーザーを取得する
 * @returns ユーザーの配列
 */
export const findAllUsers = async () => {
  const entries = kv.list<User>({
    prefix: ["users", "id"],
  });
  let res: Array<User & { id: string }> = [];
  for await (const entry of entries) {
    res = [...res, { ...entry.value, id: entry.key[2] as string }];
  }
  return res;
};

/**
 * ユーザーをIDで取得する
 * @param id ユーザーのID
 * @returns ユーザー情報
 */
export const findUserById = async (id: string): Promise<User | null> => {
  const { value } = await kv.get<User>(["users", "id", id]);
  return value;
};
