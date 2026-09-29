"use strict";
/**
 * MCP 端到端测试：调用 gcr_commit（自动提交全部变更）。
 */
const path = require("path");
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

const serverPath = path.join(__dirname, "..", "src", "mcp-server.js");

async function main() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
  });
  const client = new Client({ name: "gcr-test", version: "1.0.0" });
  await client.connect(transport);

  const res = await client.callTool({
    name: "gcr_commit_and_push",
    arguments: { cwd: process.cwd() },
  });
  console.log("=== gcr_commit_and_push 返回 ===");
  console.log(JSON.stringify(res.content, null, 2));

  await client.close();
  process.exit(0);
}
main().catch((e) => {
  console.error("失败:", e.message);
  process.exit(1);
});
