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

const ulid = monotonicFactory();

export type User = {
  name: string;
  age: number;
};

type PostUserRequest = User;

type Error = {
  message: string;
};

type PutUserRequest = Partial<User>;

export const isPostUserRequest = (val: unknown): val is PostUserRequest => {
  return typeof val === "object" && !!val && "name" in val && "age" in val &&
    typeof val.name === "string" && typeof val.age === "number";
};

export const badRequest: Error = {
  message: "Invalid Request",
} as const;

export const notFound: Error = {
  message: "Not Found",
} as const;

export const internalServerError: Error = {
  message: "Internal Server Error",
} as const;

export const isPutUserRequest = (val: unknown): val is PutUserRequest => {
  return typeof val === "object" && !!val &&
    (!("name" in val) || typeof val.name === "string") &&
    (!("age" in val) || typeof val.age === "number");
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

/**
 * ユーザーを追加する
 * @param user ユーザー情報
 * @returns ユーザー情報
 */
export const addUser = async (user: User) => {
  const id = ulid();
  const primaryKey = ["users", "id", id];
  return {
    result: await kv.atomic().check({ key: primaryKey, versionstamp: null })
      .set(primaryKey, user).commit(),
    id,
  };
};

/**
 * ユーザーを更新する
 * @param id ユーザーのID
 * @param value 更新するユーザー情報
 * @returns 更新結果
 */
export const updateUser = async (id: string, value: Partial<User>) => {
  const user = await findUserById(id);
  if (!user) {
    return false;
  }
  const key = ["users", "id", id];
  // ユーザー情報を更新する
  const { ok } = await kv.set(key, { ...user, ...value });
  return ok;
};

/**
 * ユーザーを削除する
 * @param id ユーザーのID
 * @returns 削除結果
 */
export const deleteUser = async (id: string) => {
  const user = await findUserById(id);
  if (!user) {
    return false;
  }
  const key = ["users", "id", id];
  await kv.delete(key);
  return true;
};
