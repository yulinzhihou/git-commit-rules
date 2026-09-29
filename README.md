# git-commit-rules

为 Git 仓库一键配置「**中文 + emoji**（gitmoji + conventional commits）」commit 规则，并支持**自动 commit + push**。既给开发者用，也给 AI 本地调用（见 `skill/`）。

## 特性

- **一键初始化规则**：`gcr init` 自动生成 `COMMIT_RULES.md`（中文 + 34 项 gitmoji 对照表）、`.gitmessage` 模板，并配置 `commit.template`
- **Node 项目增强**：自动生成 `commitlint.config.js`，可配合 husky 做提交校验
- **自动 commit**：`gcr commit` 自动 `git add -A`，并按变更文件智能推断 gitmoji + type 生成规范消息
- **自动 push**：`gcr commit --push` 提交后自动推送到远端
- **AI 友好**：提供 `skill/SKILL.md`，AI 可直接按此调用，无需每次手写 commit 指令

## 安装

全局安装（推荐，其他电脑也适用）：

```bash
npm i -g git-commit-rules
# 之后可直接用 gcr
```

免安装临时调用：

```bash
npx git-commit-rules commit --push
```

## 用法

```
gcr init [目录]            初始化 commit 规则
gcr commit [选项]          自动 add + 提交（自动生成 gitmoji 消息）
gcr push [选项]            推送当前分支到远端
gcr help                   帮助
```

`commit` 选项：

| 选项 | 说明 |
|------|------|
| `--push` | 提交后自动 push |
| `--auto-init` | 非 git 仓库自动 `git init` |
| `--type <t>` | 手动指定 type（feat/fix/docs...） |
| `--emoji <e>` | 手动指定 gitmoji（✨ 🐛...） |
| `--scope <s>` | 手动指定 scope |
| `--subject <d>` | 手动指定描述 |
| `--cwd <目录>` | 指定工作目录 |

## 示例

```bash
# 在项目里初始化规则
gcr init

# 自动提交并推送
gcr commit --push

# 手动指定提交信息
gcr commit --type fix --emoji 🐛 --subject "修复登录 bug" --push
```

## AI 调用

将 `skill/SKILL.md` 安装到任意 Agent 的 `.user_skills/` 目录，AI 就能识别 `gcr` 命令，开发者无需反复提醒 AI「commit + push」——AI 在开发完成后直接调用 `gcr commit --push` 即可。

## 开发与发布

```bash
npm link           # 本地链接，调试
npm publish        # 发布到 npm
```

## License

MIT
