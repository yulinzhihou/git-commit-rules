"use strict";

const fs = require("fs");
const path = require("path");
const { isGitRepo, init, git } = require("./git");

/** 从工程 templates/ 目录读取模板内容 */
function loadTemplate(name) {
  const p = path.join(__dirname, "..", "templates", name);
  return fs.readFileSync(p, "utf8");
}

/**
 * 为指定仓库配置 commit 规则。
 * @param {object} opts { cwd, force? }
 * @returns {object} 生成的路径列表
 */
function initRules(opts = {}) {
  const cwd = opts.cwd || process.cwd();
  if (!fs.existsSync(cwd)) throw new Error(`目录不存在: ${cwd}`);

  const created = [];
  let initialized = false;

  // 1. 确保是 git 仓库
  if (!isGitRepo(cwd)) {
    init(cwd);
    initialized = true;
  }

  // 2. 生成规则文档
  const rulesPath = path.join(cwd, "COMMIT_RULES.md");
  fs.writeFileSync(rulesPath, loadTemplate("COMMIT_RULES.md"), "utf8");
  created.push(rulesPath);

  // 3. 生成 commit 模板
  const templatePath = path.join(cwd, ".gitmessage");
  fs.writeFileSync(templatePath, loadTemplate("gitmessage.txt"), "utf8");
  created.push(templatePath);

  // 4. 配置 commit.template
  git(["config", "commit.template", ".gitmessage"], cwd);

  // 5. Node 项目生成 commitlint 配置
  const nodeProject = fs.existsSync(path.join(cwd, "package.json"));
  let commitlintPath = null;
  if (nodeProject) {
    commitlintPath = path.join(cwd, "commitlint.config.js");
    fs.writeFileSync(commitlintPath, loadTemplate("commitlint.config.js"), "utf8");
    created.push(commitlintPath);
  }

  return { created, initialized, isNodeProject: nodeProject, cwd };
}

module.exports = { initRules, loadTemplate };
