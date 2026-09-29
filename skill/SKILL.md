---
name: git-commit-rules
description: 一键为 Git 仓库配置「中文 + emoji（gitmoji + conventional commits）」的 commit 规则，并在开发完成后自动执行 commit + push。当用户初始化 Git 仓库、新建项目后想统一 commit 规则、配置 gitmoji 提交模板、或希望开发完成后自动 commit 并推送到远端（无需每次提醒 AI 执行 commit/push）时使用。提供 gcr CLI（init/commit/push）与 gcr-mcp（MCP server，供豆包/GPT/Claude/Gemini 等 AI 标准接入调用 6 个 git 工具）。
---

# git-commit-rules（gcr）

为 Git 仓库一键配置「中文 + emoji」commit 规则，并支持自动 commit + push。提供 **两种调用方式**：

- **CLI**：`gcr` 命令（init / commit / push）
- **MCP**：`gcr-mcp` server，供各种 AI 通过 Model Context Protocol 调用 git 工具

## 何时使用

- 用户刚 `git init`，想自动制定 commit 规则
- 用户新建项目，希望统一 commit 消息格式
- 用户要求「配置 commit 模板 / 制定提交规范 / 设置 gitmoji 规则」
- 用户要求「提交并推送 / commit and push / 帮我 commit」—— 开发完成后自动执行
- 用户要求「让 AI 接入 git 工具 / 配置 MCP」—— 用 gcr-mcp

## 前置条件

- 已安装 `gcr`（`npm i -g git-commit-rules`）或使用 `npx git-commit-rules`
- 需操作仓库为 Git 仓库（可用 `--auto-init` 自动初始化）

## 调用方式

### 方式一：CLI 命令

```bash
gcr init [目录]                        # 配置规则
gcr commit [--push][--type][--emoji][--scope][--subject][--cwd]   # 自动提交
gcr push [--cwd]                       # 推送远端
```

- `gcr commit` 自动 `git add -A` 全部变更，按变更文件自动推断 gitmoji + type 生成规范消息
- 常用选项：`--push`、`--type`、`--emoji`、`--scope`、`--subject`、`--cwd`、`--auto-init`

### 方式二：MCP server（AI 接入）

启动：`gcr-mcp`（stdio transport）。暴露 6 个工具：

| 工具 | 作用 |
|------|------|
| `gcr_status` | 查看仓库状态 |
| `gcr_init` | 初始化规则 |
| `gcr_add_all` | git add -A |
| `gcr_commit` | 按规范提交 |
| `gcr_push` | 推送远端 |
| `gcr_commit_and_push` | 一站式 add + commit + push |

各 AI（Claude / Cursor / 豆包 / GPT / Gemini / Fable 等）的 MCP 接入配置见仓库根目录 `AI-INTEGRATION.md`，通用配置：

```json
{ "mcpServers": { "git-commit-rules": { "command": "gcr-mcp", "args": [] } } }
```

让任意 AI 自动接入时，把 `AGENTS.md` 复制到项目根目录，AI 读仓库即知如何提交（自动执行 `gcr commit --push` 或 MCP `gcr_commit_and_push`）。

## 触发场景示例

**场景 A：开发完成后自动提交推送（最常用）**
```bash
gcr commit --push
```
或让 AI 调用 MCP 工具 `gcr_commit_and_push`。

**场景 B：git init 后自动配置规则**
```bash
gcr init .
```

**场景 C：指定提交信息**
```bash
gcr commit --type fix --emoji 🐛 --subject "修复登录 bug" --push
```

**场景 D：指定工作目录**
```bash
gcr commit --push --cwd /path/to/project
```

## 注意

- `gcr commit` 会提交**全部**变更（`git add -A`），如需只提交部分文件，请先手动 `git add` 或改用普通 git 流程
- `--push` 需要仓库已配置远端（`git remote`），否则会跳过 push 并提示
- 中英文策略：说明文字用中文，type / emoji / scope / subject 等专有名词保留英文或 gitmoji
