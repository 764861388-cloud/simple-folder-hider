# 简易文件夹隐藏工具 Simple Folder Hider

一个轻量的 Obsidian 插件，用于隐藏文件浏览器（侧边栏文件树）中指定的文件夹。

## 功能特性

- **全局总开关**：侧边栏眼睛图标按钮，一键开启 / 关闭整个隐藏功能。
  - 总开关**关闭**时：所有文件夹正常显示。
  - 总开关**开启**时：隐藏列表内的文件夹被隐藏。
- **右键菜单**：在文件树中右键任意文件夹，出现【隐藏文件夹】/【取消隐藏文件夹】。
- **数据持久化**：被隐藏的文件夹路径列表与总开关状态保存在插件自带的 `data.json` 中。
- **CSS 隐藏**：通过 `.nav-folder:has(.nav-folder-title[data-path="xxx"]) { display: none; }` 实现隐藏，无侵入、性能好。

## 安装

### 方式一：社区插件市场（审核通过后）
1. 打开 Obsidian 设置 → 第三方插件；
2. 关闭「安全模式」；
3. 浏览社区插件，搜索「简易文件夹隐藏工具 Simple Folder Hider」并安装启用。

### 方式二：手动安装
1. 从 Releases 下载 `main.js`、`manifest.json`、`versions.json`；
2. 放入 `<你的仓库>/.obsidian/plugins/simple-folder-hider/` 目录；
3. 设置 → 第三方插件 → 启用。

## 使用方法

1. 点击左侧栏的**眼睛图标**切换隐藏总开关；
2. 在文件树中对目标文件夹**右键**，选择【隐藏文件夹】或【取消隐藏文件夹】；
3. 关闭总开关即可让所有文件夹恢复显示。

## 构建与开发

```bash
npm install      # 安装依赖
npm run build    # 编译到 dist/，产物为 main.js / manifest.json / versions.json
```

发布时请将 `dist/` 内产物复制到插件根目录（Obsidian 只读取插件根目录），并提交到公开仓库。

## 目录结构

```
simple-folder-hider/
├─ main.js          # 编译产物（插件运行所需）
├─ manifest.json    # 插件清单
├─ versions.json    # 版本兼容映射
├─ src/main.ts      # TypeScript 源码
├─ package.json
├─ rollup.config.js
├─ tsconfig.json
├─ README.md
└─ LICENSE
```

## 许可证

[MIT](./LICENSE)
