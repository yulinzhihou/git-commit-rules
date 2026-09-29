// commitlint 配置（中文注释版）
// 依赖：npm i -D @commitlint/cli @commitlint/config-conventional husky
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // 每个 commit 必须以 gitmoji 开头
    "header-pattern": [2, "always", "^(.+) (feat|fix|docs|style|refactor|perf|test|build|chore)(\\(.+\\))?: .+$"],
    "subject-max-length": [2, "always", 50],
    "type-enum": [2, "always", ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "chore"]],
  },
};
