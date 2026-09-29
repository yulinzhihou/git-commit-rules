#!/usr/bin/env node
"use strict";

/**
 * git-commit-rules MCP Server
 * 通过 Model Context Protocol 暴露 Git 操作工具，供各种 AI（豆包、GPT、Claude、Gemini 等）调用。
 *
 * 暴露的工具：
 *   gcr_status            —— 查看仓库状态
 *   gcr_init              —— 初始化 commit 规则
 *   gcr_add_all           —— git add -A
 *   gcr_commit            —— 按规范提交（可指定 type/emoji/scope/subject，不指定则自动推断）
 *   gcr_push              —— 推送当前分支到远端
 *   gcr_commit_and_push   —— add -A + commit + push 一站式
 *
 * 启动方式（stdio transport，供 MCP 客户端接入）：
 *   node src/mcp-server.js
 *   或通过包内 bin： gcr-mcp
 */

const { z } = require("zod");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { initRules } = require("./init");
const { commitAll } = require("./commit");
const {
  isGitRepo,
  status,
  addAll,
  hasRemote,
  currentBranch,
  push,
} = require("./git");

const server = new McpServer({
  name: "git-commit-rules",
  version: require("../package.json").version || "0.1.0",
});

/** 返回 MCP 文本内容 */
function content(text) {
  return { content: [{ type: "text", text }] };
}

const CwdSchema = { cwd: z.string().optional().describe("工作目录（默认当前目录）") };

const CommitSchema = {
  cwd: z.string().optional().describe("工作目录（默认当前目录）"),
  type: z.string().optional().describe("type：feat/fix/docs/style/refactor/perf/test/build/chore（可选，自动推断）"),
  emoji: z.string().optional().describe("gitmoji emoji，如 ✨ 🐛 📝（可选，自动推断）"),
  scope: z.string().optional().describe("scope，影响模块（可选）"),
  subject: z.string().optional().describe("描述，简短一行（可选，自动生成）"),
};

// ---------- 工具：查看状态 ----------
server.tool(
  "gcr_status",
  "查看当前 Git 仓库状态：是否仓库、有无待提交变更、变更数量",
  CwdSchema,
  async (args) => {
    const cwd = args.cwd || process.cwd();
    if (!isGitRepo(cwd)) {
      return content(`{ "isRepo": false, "cwd": ${JSON.stringify(cwd)} }`);
    }
    const s = status(cwd);
    return content(JSON.stringify({
      isRepo: true,
      cwd,
      staged: s.staged.length,
      unstaged: s.unstaged.length,
      untracked: s.untracked.length,
      totalChanges: s.staged.length + s.unstaged.length + s.untracked.length,
      branch: currentBranch(cwd),
    }));
  }
);

// ---------- 工具：初始化规则 ----------
server.tool(
  "gcr_init",
  "初始化 Git commit 规则：自动 git init（如需要）、生成 COMMIT_RULES.md / .gitmessage 并配置 commit.template，Node 项目额外生成 commitlint.config.js",
  CwdSchema,
  async (args) => {
    const cwd = args.cwd || process.cwd();
    const r = initRules({ cwd });
    return content(JSON.stringify({
      ok: true,
      created: r.created,
      isNodeProject: r.isNodeProject,
      cwd,
    }));
  }
);

// ---------- 工具：git add -A ----------
server.tool(
  "gcr_add_all",
  "执行 git add -A，暂存全部变更",
  CwdSchema,
  async (args) => {
    const cwd = args.cwd || process.cwd();
    if (!isGitRepo(cwd)) {
      return content(`{ "ok": false, "error": "不是 Git 仓库: ${cwd}" }`);
    }
    addAll(cwd);
    const s = status(cwd);
    return content(JSON.stringify({ ok: true, stagedCount: s.staged.length, cwd }));
  }
);

// ---------- 工具：提交 ----------
server.tool(
  "gcr_commit",
  "按 gitmoji + conventional commits 规范提交。自动 git add -A 全部变更，若不指定 type/emoji/subject 则根据变更文件自动推断生成规范消息",
  CommitSchema,
  async (args) => {
    const r = commitAll({
      cwd: args.cwd || process.cwd(),
      type: args.type,
      emoji: args.emoji,
      scope: args.scope,
      subject: args.subject,
    });
    return content(JSON.stringify({
      ok: true,
      committed: r.committed,
      reason: r.reason || null,
      message: r.message || null,
    }));
  }
);

// ---------- 工具：推送 ----------
server.tool(
  "gcr_push",
  "推送当前分支到远端 origin",
  CwdSchema,
  async (args) => {
    const cwd = args.cwd || process.cwd();
    if (!isGitRepo(cwd)) return content(`{ "ok": false, "error": "不是 Git 仓库" }`);
    if (!hasRemote(cwd)) return content(`{ "ok": false, "error": "未配置远端，请先 git remote add origin <url>" }`);
    push(cwd);
    return content(JSON.stringify({ ok: true, pushed: true, branch: currentBranch(cwd) }));
  }
);

// ---------- 工具：一站式提交并推送 ----------
server.tool(
  "gcr_commit_and_push",
  "一站式完成：git add -A 全部变更 + 按规范提交 + 推送到远端 origin。AI 开发完成后调用此工具即可自动提交推送",
  CommitSchema,
  async (args) => {
    const r = commitAll({
      cwd: args.cwd || process.cwd(),
      push: true,
      type: args.type,
      emoji: args.emoji,
      scope: args.scope,
      subject: args.subject,
    });
    const out = {
      ok: true,
      committed: r.committed,
      reason: r.reason || null,
      message: r.message || null,
      pushed: r.pushed || false,
    };
    if (r.pushInfo) out.pushInfo = r.pushInfo;
    return content(JSON.stringify(out));
  }
);

// ---------- 启动 ----------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("git-commit-rules MCP server 已启动 (stdio)");
}

main().catch((e) => {
  console.error("MCP server 启动失败:", e.message);
  process.exit(1);
});
