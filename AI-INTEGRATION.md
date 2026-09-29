# git-commit-rules AI 接入指南

本文档说明如何让 **豆包 / GPT / Claude / Gemini / Opus / Fable 等 AI 大模型** 在开发时自动接入 `git-commit-rules`，自动执行 `git add -A` 与 commit 规则，无需开发者反复提醒 AI「commit + push」。

本工具提供 **两种 AI 接入方式**，任选其一：

| 方式 | 适用场景 | 能力 |
|------|----------|------|
| **方式 A：MCP Server**（推荐） | 支持 MCP 的 AI（豆包、Claude、Cursor、GPT 生态、Gemini 等） | AI 直接调用 `gcr_commit_and_push` 等工具，最自然 |
| **方式 B：CLI 命令 + AGENTS.md** | 所有 AI（通过系统提示/仓库说明读取） | AI 通过 `gcr commit --push` 命令行触发，通用性最强 |

> 建议 **两种都配置**：MCP 提供无缝工具调用，AGENTS.md 保证任何 AI 读仓库后都知道该怎么做。

---

## 一、安装（所有方式的前提）

### 全局安装（推荐，本机所有项目可用）

```bash
npm i -g git-commit-rules
```

### 或免安装临时调用

```bash
npx git-commit-rules commit --push
```

### 或离线安装包

```bash
npm i -g git-commit-rules-0.1.0.tgz
```

安装后验证：

```bash
gcr version
```

---

## 方式 A：MCP Server 接入（推荐）

MCP（Model Context Protocol）是 AI 调用外部工具的事实标准。本工具内置 MCP server，暴露 6 个工具供 AI 调用。

### A.0 先测试 MCP server 是否正常

```bash
gcr-mcp        # 或 node <安装路径>/src/mcp-server.js
```

看到输出 `git-commit-rules MCP server 已启动 (stdio)` 即正常。

### A.1 接入 Claude Desktop

编辑配置文件 `claude_desktop_config.json`（路径：`~/Library/Application Support/Claude/` 或 `%APPDATA%\Claude\`）：

```json
{
  "mcpServers": {
    "git-commit-rules": {
      "command": "gcr-mcp",
      "args": []
    }
  }
}
```

保存后重启 Claude Desktop，对话中即可直接说「帮我提交并推送代码」，AI 会自动调用 `gcr_commit_and_push`。

### A.2 接入 Cursor

在项目根目录创建 `.mcp.json`：

```json
{
  "mcpServers": {
    "git-commit-rules": {
      "command": "gcr-mcp",
      "args": []
    }
  }
}
```

重启 Cursor 后，Composer / Chat 会自动加载该 MCP 工具。

### A.3 接入豆包（Doubao）

在豆包的「智能体 / MCP 配置」中添加一个 **stdio MCP Server**：

- **名称**：git-commit-rules
- **命令**：`gcr-mcp`（若豆包需要绝对路径，填 `node` + `<npm全局目录>/node_modules/git-commit-rules/src/mcp-server.js`）
- **类型**：stdio

保存后，豆包即可在对话中调用 git 提交工具。

### A.4 接入其他支持 MCP 的 AI（GPT / Gemini / Opus / Fable 等）

凡是支持 MCP（Model Context Protocol）的客户端或框架，统一使用：

```json
{
  "mcpServers": {
    "git-commit-rules": {
      "command": "gcr-mcp",
      "args": []
    }
  }
}
```

配置项因客户端而异，核心字段固定为 `command: "gcr-mcp"`。若客户端要求绝对路径，用：

```json
{ "command": "node", "args": ["<全局node_modules路径>/git-commit-rules/src/mcp-server.js"] }
```

### A.5 MCP 工具清单

AI 接入后可用以下 6 个工具：

| 工具 | 作用 | AI 触发场景 |
|------|------|-------------|
| `gcr_status` | 查看仓库状态 | AI 先检查有无变更再决定是否提交 |
| `gcr_init` | 初始化 commit 规则 | 新项目 / git init 后 |
| `gcr_add_all` | `git add -A` | 需要手动分批暂存时 |
| `gcr_commit` | 按规范提交（自动推断消息） | 提交但暂不推送 |
| `gcr_push` | 推送当前分支到远端 | 单独推送 |
| `gcr_commit_and_push` | **一站式 add + commit + push** | 开发完成后最常用 |

AI 调用示例（对话中让 AI 执行）：

```
请调用 gcr_commit_and_push 工具，提交我刚刚改的所有代码。
```

AI 会调用工具，自动完成 `git add -A` → 生成 `✨ feat: ...` 规范消息 → commit → push。

---

## 方式 B：CLI 命令 + AGENTS.md（通用兜底）

所有 AI（无论是否支持 MCP）都能通过读仓库根目录的 `AGENTS.md` 学会调用 `gcr` 命令。

### B.1 安装 AGENTS.md

本工具包已附带 `AGENTS.md`。将其复制到你的**项目仓库根目录**：

```bash
cp <git-commit-rules安装路径>/AGENTS.md ./AGENTS.md
```

`AGENTS.md` 内容告诉 AI：

- 项目使用 `git-commit-rules` 管理提交
- 开发完成后应执行 `gcr commit --push`（或经 MCP 调 `gcr_commit_and_push`）
- commit 消息需遵循 gitmoji + conventional commits 规范

### B.2 AI 用法（命令行方式）

AI（GPT / Claude / Gemini / 豆包等）在开发完成后，直接在终端执行：

```bash
# 提交并推送（自动 add 全部 + 生成规范消息 + push）
gcr commit --push

# 仅提交不推送
gcr commit

# 指定提交信息
gcr commit --type fix --emoji 🐛 --subject "修复登录 bug" --push

# 指定工作目录
gcr commit --push --cwd /path/to/project
```

### B.3 各 AI 如何「知道」要调用 gcr

| AI | 让它接入 gcr 的方式 |
|----|---------------------|
| **Claude (Opus/Sonnet等)** | ① 配 MCP（A.1） ② 或把 AGENTS.md 放仓库，Claude 打开仓库即读 |
| **GPT / ChatGPT** | ① 支持 MCP 的环境配 MCP ② 或在系统提示（Custom Instructions）里写明「用 `gcr commit --push` 提交」 |
| **Gemini** | ① 配 MCP ② 或 AGENTS.md |
| **豆包（Doubao）** | ① 配 MCP（A.3） ② 或 AGENTS.md |
| **Cursor / Copilot** | ① 配 MCP（A.2） ② 或 AGENTS.md |
| **Fable 及其他** | ① 支持 MCP 则配 MCP ② 或 AGENTS.md + 系统提示 |

**通用原则**：MCP 是首选；不支持的 AI 用「仓库放 AGENTS.md + 系统提示写明命令」同样有效。

---

## 三、验证接入成功

1. **MCP 方式**：在 AI 对话框里输入「查看当前 git 仓库状态」，若 AI 调用了 `gcr_status` 并返回 JSON，说明接入成功。
2. **CLI 方式**：让 AI 开发一个小改动后执行 `gcr commit --push`，若终端出现 `✨ feat: ...` 且 git log 有记录，说明成功。

---

## 四、常见问题

**Q1：`gcr-mcp` 命令找不到？**
全局安装后应可用。若未全局安装，用 `node <路径>/src/mcp-server.js`，或先 `npm i -g git-commit-rules`。

**Q2：push 时提示「未配置远端」？**
仓库需先配置远端：`git remote add origin <你的仓库URL>`，再执行 `gcr commit --push`。

**Q3：AI 调 MCP 工具报错？**
确认 MCP server 能独立启动（`gcr-mcp` 无报错），再确认客户端配置的 command/args 正确。

**Q4：不想提交全部文件？**
`gcr_commit` / `gcr commit` 默认 `git add -A` 提交全部。如需只提交部分，先用 `git add <文件>` 暂存指定文件，再调用 `gcr_commit`（它会对已暂存+未暂存全部 add，若需严格部分提交请用原生 git）。

---

## 五、快速上手（3 步）

```bash
# 1. 安装
npm i -g git-commit-rules

# 2. 在项目里初始化规则
cd 你的项目
gcr init

# 3. 配置 AI 接入
#    a) 支持 MCP → 按第一节配 MCP（command: gcr-mcp）
#    b) 或复制 AGENTS.md 到项目根目录
#    之后开发完成，直接让 AI「提交并推送」，或 AI 自动执行 gcr commit --push
```
