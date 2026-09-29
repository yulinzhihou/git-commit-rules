---
name: git-commit-rules
description: 一键为 Git 仓库配置「中文 + emoji（gitmoji + conventional commits）」的 commit 规则，并在开发完成后自动执行 commit + push。当用户初始化 Git 仓库、新建项目后想统一 commit 规则、配置 gitmoji 提交模板、或希望开发完成后自动 commit 并推送到远端（无需每次提醒 AI 执行 commit/push）时使用。提供 gcr CLI：init 配置规则、commit 自动提交（自动生成规范消息）、push 推送远端。
---

# git-commit-rules（gcr）

为 Git 仓库一键配置「中文 + emoji」commit 规则，并支持自动 commit + push，供 AI 与开发者本地调用。

## 何时使用

- 用户刚 `git init`，想自动制定 commit 规则
- 用户新建项目，希望统一 commit 消息格式
- 用户要求「配置 commit 模板 / 制定提交规范 / 设置 gitmoji 规则」
- 用户要求「提交并推送 / commit and push / 帮我 commit」—— 开发完成后自动执行
- 用户希望开发过程无需反复提醒 AI 做 commit + push

## 前置条件

- 已安装 `gcr`（`npm i -g git-commit-rules`）或使用 `npx git-commit-rules`
- 需操作仓库为 Git 仓库（可用 `--auto-init` 自动初始化）

## 命令

### 1. init —— 配置 commit 规则

```bash
gcr init [目录]
```

- 自动生成 `COMMIT_RULES.md`（中文 + 34 项 gitmoji 对照表）
- 生成 `.gitmessage` 提交模板并配置 `commit.template`
- Node 项目额外生成 `commitlint.config.js`

### 2. commit —— 自动提交

```bash
gcr commit [选项]
```

- 自动 `git add -A` 全部变更
- 根据变更文件自动推断 gitmoji + type，生成规范消息
- 可选 `--push` 提交后自动推送

常用选项：`--push`、`--type <type>`、`--emoji <emoji>`、`--scope <scope>`、`--subject <描述>`、`--cwd <目录>`、`--auto-init`

### 3. push —— 推送远端

```bash
gcr push [--cwd <目录>]
```

推送到 `origin` 当前分支。

## 触发场景示例

**场景 A：开发完成后自动提交推送（最常用）**
```bash
gcr commit --push
```

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
