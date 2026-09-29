# Git Commit 规则（Gitmoji + Conventional Commits）

本文件是仓库的 commit 消息规范。所有提交请遵循以下格式，保持团队一致、便于追溯。

## 消息格式

```
<emoji> <type>(<scope>): <subject>

[<body>]

[<footer>]
```

- `<emoji>`：必填，见下方 gitmoji 对照表
- `<type>`：必填，commit 类型（英文固定词）
- `<scope>`：可选，影响范围，如模块名 / 文件路径
- `<subject>`：必填，简短描述（≤50 字符，祈使语气，小写开头，句末不加句号）
- `<body>`：可选，详细说明（第 2 行空行隔开，每条 ≤72 字符）
- `<footer>`：可选，用于关联 issue / breaking change

## 示例

```
✨ feat(auth): 新增登录页

实现账号密码登录，接入验证码接口。

Closes #123
```

```
🐛 fix(cart): 修复购物车数量显示错误
```

## gitmoji 对照表（常用）

| emoji | type | 中文含义 | 英文含义 |
|-------|------|----------|----------|
| ✨ | feat | 新功能 | New feature |
| 🐛 | fix | 修复 Bug | Bug fix |
| 📝 | docs | 文档 | Documentation |
| 💄 | style | 样式/UI | UI/style |
| ♻️ | refactor | 重构 | Refactor |
| ⚡ | perf | 性能优化 | Performance |
| ✅ | test | 测试 | Test |
| 🔧 | chore | 工具/配置 | Chore/config |
| 🚀 | release | 发布 | Release |
| 🏗️ | build | 构建 | Build |
| 🔥 | remove | 移除代码 | Remove |
| 🎨 | polish | 代码美化 | Polish |
| 🚚 | move | 移动/重命名 | Move/rename |
| 📦 | deps | 依赖 | Dependencies |
| 🔒 | security | 安全 | Security |
| ⬆️ | upgrade | 升级依赖 | Upgrade |
| ⬇️ | downgrade | 降级依赖 | Downgrade |
| 💥 | breaking | 破坏性变更 | Breaking change |
| 🧪 | experiment | 实验 | Experiment |
| 🌐 | i18n | 国际化 | i18n |
| 🐳 | docker | Docker 相关 | Docker |
| 🚨 | lint | 修复 lint 警告 | Fix lint warnings |
| 🧹 | cleanup | 清理代码 | Cleanup |
| 🔥 | hotfix | 紧急修复 | Hotfix |
| 💚 | ci | 修复 CI | Fix CI build |
| 📈 | analytics | 分析/埋点 | Analytics |
| 🧑‍💻 | devx | 开发者体验 | Dev experience |
| ⏱️ | revert | 回滚 | Revert |
| 💬 | comment | 添加注释 | Add comments |
| 🧱 | infra | 基础设施 | Infrastructure |
| 🗃️ | data | 数据库/数据 | Database/data |
| 🚦 | workflow | 工作流 | Workflow |
| 📌 | pin | 固定版本 | Pin dependency |

## type 必填规范

| type | 何时使用 |
|------|----------|
| feat | 新功能（非修复） |
| fix | 缺陷修复 |
| docs | 仅文档变更 |
| style | 不影响代码逻辑的格式/样式改动 |
| refactor | 既不修 Bug 也不加功能的代码重构 |
| perf | 性能提升 |
| test | 增改测试 |
| build | 构建系统、CI 配置、外部依赖 |
| chore | 其他维护工作（工具、配置、杂项） |

## subject 书写规范

- 用祈使语气（“add” 而非 “added”）
- 首行 ≤50 字符
- 首字母小写（中文可忽略）
- 结尾不加句号
- 避免模糊词（update、stuff）

## 参考

- Conventional Commits 规范：https://www.conventionalcommits.org/
- Gitmoji 完整列表：https://gitmoji.dev/
