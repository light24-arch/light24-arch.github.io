# XUJINGYI 作品集

使用 Node 24 LTS。首次运行：`npm ci`，本地预览：`npm run dev`，完整发布检查：`npm run build`。

## 图片和资料

- 图片原稿放在 `assets/images/`；Markdown 中继续使用 `/images/...` 作为图片标识。
- 构建自动将被引用的图片转成多尺寸 WebP，写入忽略跟踪的 `public/media/`，不直接发布原稿。
- `ResponsiveImage` 组件自动输出尺寸、响应式图片和懒加载；首屏图单独优先加载。
- 编辑说明保存在本地 `private-notes/`，该目录不会提交或发布。`public/` 仅放应公开的文件。
- 内容的图文排版通过 `src/content/projects/` 和 `src/content/artwork/` 中 Markdown 的 frontmatter 编辑；已有正文作为编辑参考保留，当前不单独追加渲染，以免内容重复。

## 发布

推送到 `master` 后，GitHub Actions 使用 Node 24 安装锁定依赖，进行安全检查、类型检查、构建和发布范围检查，然后部署 GitHub Pages。PR 只检查，不发布。

`dist/build-info.json` 用于核对已发布的提交和构建版本。需要回滚时，回退对应发布提交后正常推送，不需要强制推送或重写历史。
