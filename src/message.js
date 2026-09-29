"use strict";

/**
 * 根据文件变更自动推断 gitmoji + type + subject，生成规范 commit 消息。
 * 规则基于 gitmoji + conventional commits，说明文字为中文。
 */

/** 文件扩展名 → type / gitmoji 的启发式映射 */
const FILE_RULES = [
  { match: /\.(md|txt|rst|adoc|docs\/)/i, type: "docs", emoji: "📝" },
  { match: /\.(css|scss|less|styl)/i, type: "style", emoji: "💄" },
  { match: /\.(test|spec)\./i, type: "test", emoji: "✅" },
  { match: /\.(py|js|ts|java|go|rb|php|c|cc|cpp|cs|swift|kt|rs)/i, type: "feat", emoji: "✨" },
  { match: /\.(json|ya?ml|toml|ini|conf|cfg|lock)/i, type: "chore", emoji: "🔧" },
  { match: /(Dockerfile|docker-compose)/i, type: "build", emoji: "🐳" },
  { match: /\.(svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf)/i, type: "style", emoji: "🎨" },
  { match: /\.(sql)/i, type: "chore", emoji: "🗃️" },
  { match: /\.(sh|bat|ps1|cmd)/i, type: "chore", emoji: "🔧" },
  { match: /\.(yml|yaml)/i, type: "ci", emoji: "💚" },
];

const DEFAULT_TYPE = "feat";
const DEFAULT_EMOJI = "✨";

/** 从文件名推断 type 与 emoji */
function inferTypeAndEmoji(filename) {
  for (const r of FILE_RULES) {
    if (r.match.test(filename)) {
      return { type: r.type, emoji: r.emoji };
    }
  }
  return { type: DEFAULT_TYPE, emoji: DEFAULT_EMOJI };
}

/** 取文件基名，去掉常见前后缀，做成 subject 片段 */
function describeFile(filename) {
  const base = filename.split(/[\\/]/).pop().replace(/\.[^.]+$/, "");
  return base;
}

/**
 * 从变更列表生成一条 commit 消息。
 * @param {string[]} files 变更文件路径列表
 * @param {object} options { type?, emoji?, scope?, subject? } 可手动覆盖
 * @returns {string}
 */
function buildMessage(files, options = {}) {
  if (!files || files.length === 0) {
    throw new Error("没有可提交的变更文件");
  }

  const first = files[0];
  const inferred = inferTypeAndEmoji(first);
  const type = options.type || inferred.type;
  const emoji = options.emoji || inferred.emoji;

  // 多个文件时 subject 描述文件数量，单文件用文件名
  let subject = options.subject;
  if (!subject) {
    if (files.length === 1) {
      subject = `更新 ${describeFile(first)}`;
    } else {
      subject = `更新 ${files.length} 个文件`;
    }
  }

  const scope = options.scope ? `(${options.scope})` : "";
  return `${emoji} ${type}${scope}: ${subject}`;
}

module.exports = { buildMessage, inferTypeAndEmoji, describeFile };
