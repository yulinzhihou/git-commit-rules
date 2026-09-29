"use strict";

const {
  isGitRepo,
  init,
  status,
  addAll,
  commit,
  hasRemote,
  push,
} = require("./git");
const { buildMessage } = require("./message");

/**
 * 自动提交变更（add 全部 → 生成消息 → commit → 可选 push）。
 * @param {object} opts { cwd, push?, type?, emoji?, scope?, subject?, autosInit? }
 */
function commitAll(opts = {}) {
  const cwd = opts.cwd || process.cwd();

  // 确保是 git 仓库（可选自动 init）
  if (!isGitRepo(cwd)) {
    if (opts.autoInit) {
      init(cwd);
    } else {
      throw new Error(`不是 Git 仓库: ${cwd}（可用 --auto-init 自动初始化）`);
    }
  }

  const s = status(cwd);
  const changed =
    s.staged.length > 0 || s.unstaged.length > 0 || s.untracked.length > 0;
  if (!changed) {
    return { ok: true, committed: false, reason: "无变更，跳过提交" };
  }

  // add 全部
  addAll(cwd);

  // 收集变更文件路径（含新增）
  const files = s.raw.map((line) => line.slice(3).trim());

  // 生成消息
  const message = buildMessage(files, {
    type: opts.type,
    emoji: opts.emoji,
    scope: opts.scope,
    subject: opts.subject,
  });

  commit(message, cwd);

  let pushed = false;
  let pushInfo = null;
  if (opts.push) {
    if (!hasRemote(cwd)) {
      pushInfo = "未配置远端（git remote），跳过 push";
    } else {
      push(cwd);
      pushed = true;
    }
  }

  return { ok: true, committed: true, message, pushed, pushInfo, files };
}

module.exports = { commitAll };
