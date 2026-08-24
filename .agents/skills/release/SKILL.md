---
name: release
description: 版本发布：bump 版本号 → git tag → push
license: MIT
metadata:
  version: "2.0.0"
  author: Steven-Qiang
  tags: ["git", "release", "tag"]
---
# 发版 Release

发布新版本并推送到 GitHub（私有 monorepo，不发布 npm）。

## 流程

1. 确认当前工作区干净（无未提交变更）
2. 询问版本号类型：patch / minor / major
3. 同步 bump 版本号：
   - 根 `package.json`
   - `packages/worker/package.json`
   - `packages/web/package.json`
4. 执行 `git add -A && git commit -m "chore: release v<版本号>"`
5. 执行 `git tag v<版本号>` 并 `git push && git push --tags`
6. 输出发布摘要：版本号、GitHub tag 地址

## 注意事项

- 项目为私有（`"private": true`），**不做 npm publish**；原上游的 `@qingchencloud/cj2api` npm 包与本 fork 无关
- 发布前先跑 `pnpm run typecheck`，有 TypeScript 编译错误先修复
- 发版前如需重新生成测试页，先执行 `pnpm run build:page`
