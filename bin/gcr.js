#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { isGitRepo, git, hasRemote, currentBranch } = require("../src/git");
const { initRules } = require("../src/init");
const { commitAll } = require("../src/commit");

const pkg = require("../package.json");

// ---------- 帮助信息（中文） ----------
const HELP = `
git-commit-rules (gcr) v${pkg.version}
为 Git 仓库一键配置「中文 + emoji（gitmoji + conventional commits）」commit 规则，
并支持自动 commit / push，供开发者与 AI 本地调用。

用法:
  gcr init [目录]           初始化 commit 规则（生成 COMMIT_RULES.md / .gitmessage / commitlint 配置）
  gcr commit [选项]         自动 add 全部变更并提交，消息自动生成 gitmoji 规范格式
  gcr push [选项]           推送到远端（origin 当前分支）
  gcr help                  显示本帮助
  gcr version               显示版本

commit 选项:
  --push                    提交后自动 push 到远端
  --auto-init               非 git 仓库时自动 git init
  --type <type>             手动指定 type（feat/fix/docs/...）
  --emoji <emoji>           手动指定 gitmoji（如 ✨ 🐛）
  --scope <scope>           手动指定 scope
  --subject <desc>          手动指定描述
  --cwd <目录>              指定工作目录（默认当前目录）

push 选项:
  --cwd <目录>              指定工作目录

示例:
  gcr init                       在当前目录配置规则
  gcr commit --push              自动提交并推送
  gcr commit --subject "修复登录 bug" --type fix --emoji 🐛

其他电脑部署:
  npm i -g git-commit-rules      全局安装后可直接用 gcr
  npx git-commit-rules commit    免安装临时调用
`;

// ---------- 参数解析 ----------
function parseArgs(argv) {
  const opts = { _: [] };
  const flags = [
    "--push", "--auto-init", "--help", "--version",
  ];
  const keyed = ["--type", "--emoji", "--scope", "--subject", "--cwd"];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (flags.includes(a)) {
      opts[a.slice(2)] = true;
    } else if (keyed.includes(a)) {
      opts[a.slice(2)] = argv[++i];
    } else if (a === "-h") {
      opts.help = true;
    } else if (a === "-v") {
      opts.version = true;
    } else {
      opts._.push(a);
    }
  }
  return opts;
}

function run() {
  const args = process.argv.slice(2);
  const opts = parseArgs(args);
  const cmd = opts._[0] || "help";

  if (opts.version || cmd === "version") {
    console.log(pkg.version);
    return;
  }
  if (opts.help || cmd === "help") {
    console.log(HELP);
    return;
  }

  const cwd = opts.cwd || process.cwd();

  try {
    if (cmd === "init") {
      const target = opts._[1] || cwd;
      const r = initRules({ cwd: target });
      console.log("[成功] 已配置 commit 规则：");
      r.created.forEach((p) => console.log("  " + p));
      if (r.initialized) console.log("[提示] 已自动执行 git init");
      if (r.isNodeProject) {
        console.log("[提示] Node 项目已生成 commitlint.config.js");
        console.log("[提示] 启用校验：npm i -D @commitlint/cli @commitlint/config-conventional husky");
      }
    } else if (cmd === "commit") {
      const r = commitAll({
        cwd,
        push: !!opts.push,
        autoInit: !!opts.autoInit,
        type: opts.type,
        emoji: opts.emoji,
        scope: opts.scope,
        subject: opts.subject,
      });
      if (r.committed) {
        console.log("[提交] " + r.message);
        if (r.pushed) console.log("[推送] 已推送到 origin/" + currentBranch(cwd));
        if (r.pushInfo) console.log("[跳过] " + r.pushInfo);
      } else {
        console.log("[跳过] " + r.reason);
      }
    } else if (cmd === "push") {
      if (!isGitRepo(cwd)) throw new Error("不是 Git 仓库");
      if (!hasRemote(cwd)) throw new Error("未配置远端，请先 git remote add origin <url>");
      git(["push", "origin", currentBranch(cwd)], cwd);
      console.log("[推送] 已推送到 origin/" + currentBranch(cwd));
    } else {
      console.log(HELP);
    }
  } catch (e) {
    console.error("[错误] " + e.message);
    process.exitCode = 1;
  }
}

run();
