"use strict";

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * 执行 git 命令，返回 stdout 去除尾部空白后的字符串。
 * 失败时抛出包含 stderr 的错误。
 */
function git(args, cwd) {
  try {
    return execFileSync("git", args, {
      cwd: cwd || process.cwd(),
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch (e) {
    const msg = (e.stderr && e.stderr.toString()) || e.message;
    throw new Error(`git ${args.join(" ")} 失败: ${msg}`);
  }
}

/** 判断是否为 Git 仓库 */
function isGitRepo(cwd) {
  try {
    git(["rev-parse", "--is-inside-work-tree"], cwd);
    return true;
  } catch (_) {
    return false;
  }
}

/** 初始化仓库 */
function init(cwd) {
  return git(["init"], cwd);
}

/** 获取暂存区与工作区的变更摘要（区分 staged / unstaged / untracked） */
function status(cwd) {
  const out = git(["status", "--porcelain"], cwd);
  const lines = out.split("\n").filter((l) => l.trim());
  return {
    staged: lines.filter((l) => /^[MARC]/.test(l)),
    unstaged: lines.filter((l) => /^.[MD]/.test(l)),
    untracked: lines.filter((l) => l.startsWith("??")),
    raw: lines,
  };
}

/** 是否有待提交/未跟踪变更 */
function hasChanges(cwd) {
  const s = status(cwd);
  return s.staged.length > 0 || s.unstaged.length > 0 || s.untracked.length > 0;
}

/** git add 全部 */
function addAll(cwd) {
  return git(["add", "-A"], cwd);
}

/** 提交 */
function commit(message, cwd) {
  return git(["commit", "-m", message], cwd);
}

/** 获取当前分支名 */
function currentBranch(cwd) {
  try {
    return git(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
  } catch (_) {
    return "HEAD";
  }
}

/** 是否配置了远端 */
function hasRemote(cwd) {
  try {
    return git(["remote"], cwd).length > 0;
  } catch (_) {
    return false;
  }
}

/** push 到远端 */
function push(cwd) {
  const branch = currentBranch(cwd);
  return git(["push", "origin", branch], cwd);
}

/** 读取或创建配置文件（存于仓库 .git-commit-rules.json 或仓库内 .gcr.config） */
function loadConfig(cwd) {
  const p = path.join(cwd, ".git-commit-rules.json");
  if (fs.existsSync(p)) {
    try {
      return JSON.parse(fs.readFileSync(p, "utf8"));
    } catch (_) {
      return {};
    }
  }
  return {};
}

function saveConfig(cwd, cfg) {
  const p = path.join(cwd, ".git-commit-rules.json");
  fs.writeFileSync(p, JSON.stringify(cfg, null, 2), "utf8");
  return p;
}

module.exports = {
  git,
  isGitRepo,
  init,
  status,
  hasChanges,
  addAll,
  commit,
  currentBranch,
  hasRemote,
  push,
  loadConfig,
  saveConfig,
};
