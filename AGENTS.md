# AGENTS.md — 给 AI 的提交规范说明

本仓库使用 **git-commit-rules** 管理 git 提交。所有 AI 助手（豆包 / GPT / Claude / Gemini / Opus / Fable 等）在**完成开发改动后，必须自动提交并推送代码**，无需等用户提醒。

## 你（AI）必须遵守

1. **开发完成后自动提交**：完成一段可工作的改动后，执行提交，不要等用户说「commit / 提交 / push / 推送」。
2. **提交格式**：遵循 **gitmoji + conventional commits** 规范：`<emoji> <type>(<scope>): <subject>`。
   - 例：`✨ feat(auth): 新增登录页`、`🐛 fix(cart): 修复购物车数量错误`、`📝 docs: 更新 README`
   - type：feat / fix / docs / style / refactor / perf / test / build / chore
   - emoji：✨ 🐛 📝 💄 ♻️ ⚡ ✅ 🔧 等（详见仓库 `COMMIT_RULES.md`）
3. **提交并推送**：用下面命令一步完成 `git add -A` + commit + push。

## 提交命令

```bash
# 推荐：自动 add 全部 + 生成规范消息 + 推送远端
gcr commit --push

# 指定提交信息（当你想精确描述时）
gcr commit --type <type> --emoji <emoji> --subject "<描述>" --push
```

如果 `gcr` 命令不可用，先用原生 git 提交（但必须按上述格式写消息）：

```bash
git add -A
git commit -m "✨ feat: <描述>"
git push
```

## 规则细节

- **消息格式**：`<emoji> <type>(<scope>): <subject>`（scope 可选）
- **subject 规范**：祈使语气、≤50 字符、结尾不加句号
- **完整对照表**：见仓库根目录 `COMMIT_RULES.md`

## 遇到情况

- 无变更可提交 → 跳过，不报错
- push 提示无远端 → 提示用户先 `git remote add origin <url>`，可先只 commit
- 提交失败 → 用原生 git 查看错误，修复后重试
