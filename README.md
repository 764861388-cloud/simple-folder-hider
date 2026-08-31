# Simple Folder Hider

A lightweight Obsidian plugin to hide folders **and notes** in the file explorer, with a one-click toolbar toggle and a right-click menu.

## Features

- **Global toggle**: a ribbon (sidebar) eye icon to enable / disable hiding with one click.
  - Toggle **off**: everything is shown.
  - Toggle **on**: items in the hidden list are hidden.
- **Hide folders**: right-click any folder in the file tree → **Hide folder** / **Unhide folder**.
- **Hide notes (NEW in 1.1.0)**: right-click any note / file in the file tree → **Hide note** / **Unhide note**.
- **Persistent settings**: the hidden folder list, hidden note list and the toggle state are stored in the plugin's `data.json`.
- **Pure CSS hiding**: hidden items are marked with a CSS class; the actual hiding rule lives in `styles.css` (no runtime style injection).

## Installation

### Option 1: Community plugins (after approval)

1. Open Obsidian Settings → Third-party plugins.
2. Turn off Safe mode.
3. Browse community plugins, search for "Simple Folder Hider" and enable it.

### Option 2: Manual install

1. Download `main.js`, `manifest.json`, `styles.css`, `versions.json` from Releases.
2. Put them into `<your-vault>/.obsidian/plugins/simple-folder-hider/`.
3. Settings → Third-party plugins → Enable.

## Usage

1. Click the **eye icon** in the left ribbon to toggle hiding.
2. **Right-click** a folder → **Hide folder** / **Unhide folder**.
3. **Right-click** a note / file → **Hide note** / **Unhide note** (new in 1.1.0).
4. Turn the toggle off to show everything again.

## Development

```bash
npm install      # install dependencies
npm run build    # compile to dist/ (main.js / manifest.json / versions.json / styles.css)
```

Copy the artifacts from `dist/` to the plugin root before publishing (Obsidian only reads the plugin root).

## Directory structure

```
simple-folder-hider/
├─ main.js          # built output (required at runtime)
├─ manifest.json    # plugin manifest
├─ styles.css       # hiding rules
├─ versions.json    # version compatibility map
├─ src/main.ts      # TypeScript source
├─ package.json
├─ rollup.config.js
├─ tsconfig.json
├─ README.md
└─ LICENSE
```

## License

[MIT](./LICENSE)

---

# 简易隐藏（Simple Folder Hider）

一个轻量的 Obsidian 插件，用于在文件浏览器（侧边栏文件树）中隐藏**文件夹和笔记**，支持工具栏一键开关与右键菜单。

## 功能特性

- **全局总开关**：侧边栏眼睛图标按钮，一键开启 / 关闭整个隐藏功能。
  - 总开关**关闭**时：所有文件夹与笔记正常显示。
  - 总开关**开启**时：隐藏列表内的文件夹与笔记被隐藏。
- **隐藏文件夹**：在文件树中右键任意文件夹，出现【隐藏文件夹】/【取消隐藏文件夹】。
- **隐藏笔记（1.1.0 新增）**：在文件树中右键任意笔记 / 文件，出现【隐藏笔记】/【取消隐藏笔记】。
- **数据持久化**：被隐藏的文件夹路径、笔记路径与总开关状态保存在插件自带的 `data.json` 中。
- **纯 CSS 隐藏**：被隐藏的项目打上 CSS 类标记，隐藏规则放在 `styles.css` 中（不动态注入样式，符合社区审核要求）。

## 安装

### 方式一：社区插件市场（审核通过后）

1. 打开 Obsidian 设置 → 第三方插件；
2. 关闭「安全模式」；
3. 浏览社区插件，搜索「Simple Folder Hider」并安装启用。

### 方式二：手动安装

1. 从 Releases 下载 `main.js`、`manifest.json`、`styles.css`、`versions.json`；
2. 放入 `<你的仓库>/.obsidian/plugins/simple-folder-hider/` 目录；
3. 设置 → 第三方插件 → 启用。

## 使用方法

1. 点击左侧栏的**眼睛图标**切换隐藏总开关；
2. 在文件树中对目标文件夹**右键**，选择【隐藏文件夹】或【取消隐藏文件夹】；
3. 在文件树中对目标笔记 / 文件**右键**，选择【隐藏笔记】或【取消隐藏笔记】（1.1.0 新增）；
4. 关闭总开关即可让所有项目恢复显示。

## 构建与开发

```bash
npm install      # 安装依赖
npm run build    # 编译到 dist/，产物为 main.js / manifest.json / versions.json / styles.css
```

发布时请将 `dist/` 内产物复制到插件根目录（Obsidian 只读取插件根目录），并提交到公开仓库。

## 许可证

[MIT](./LICENSE)
