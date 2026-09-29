"use strict";
/**
 * 临时测试：用官方 MCP Client 连接本地 server 子进程，验证工具可用。
 */
const { spawn } = require("child_process");
const path = require("path");
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

const serverPath = path.join(__dirname, "..", "src", "mcp-server.js");

async function main() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
  });

  const client = new Client({
    name: "gcr-test-client",
    version: "1.0.0",
  });
  await client.connect(transport);

  console.log("=== 已连接 MCP server ===");

  // 列出工具
  const tools = await client.listTools();
  console.log("=== 可用工具 ===");
  tools.tools.forEach((t) => console.log(`  - ${t.name}`));

  // 调用 gcr_status
  const res = await client.callTool({
    name: "gcr_status",
    arguments: { cwd: process.cwd() },
  });
  console.log("=== gcr_status 返回 ===");
  console.log(JSON.stringify(res.content, null, 2));

  await client.close();
  process.exit(0);
}

main().catch((e) => {
  console.error("MCP 测试失败:", e.message);
  process.exit(1);
});
