import { Hono } from "hono";

// 1.Wasmをロード
const wasmCode = await Deno.readFile(
  "./hello-wasm/target/wasm32-unknown-unknown/debug/hello_wasm.wasm",
);
// 2.ロードしたファイルからWasmモジュールを作成
const wasmModule = new WebAssembly.Module(wasmCode);
// 3.関数を使用できるようモジュールのインスタンスを作成
const wasmInstance = new WebAssembly.Instance(wasmModule);

const { greet } = wasmInstance.exports;

const app = new Hono();

app.get("/health", (c) => {
  return c.text("Hello Hono!");
});

app.post("/greet", (c) => {
  return greet();
});

Deno.serve(app.fetch);
