'use strict';

var obsidian = require('obsidian');

const DEFAULT_SETTINGS = {
    enabled: false,
    hiddenFolders: [],
};
class SimpleFolderHider extends obsidian.Plugin {
    settings;
    ribbonEl = null;
    async onload() {
        await this.loadSettings();
        // 1) 侧边栏眼睛图标：全局总开关
        const initialIcon = this.settings.enabled ? 'eye' : 'eye-off';
        this.ribbonEl = this.addRibbonIcon(initialIcon, '简易文件夹隐藏：点击切换隐藏总开关', async () => {
            this.settings.enabled = !this.settings.enabled;
            await this.saveSettings();
            this.applyHiding();
            if (this.ribbonEl) {
                obsidian.setIcon(this.ribbonEl, this.settings.enabled ? 'eye' : 'eye-off');
            }
            if (this.settings.enabled) {
                new obsidian.Notice('简易文件夹隐藏：总开关已开启（隐藏生效）');
            }
            else {
                new obsidian.Notice('简易文件夹隐藏：总开关已关闭（全部显示）');
            }
        });
        // 2) 文件树文件夹右键菜单
        this.registerEvent(this.app.workspace.on('file-menu', (menu, file) => {
            if (file instanceof obsidian.TFolder) {
                const path = file.path;
                if (this.settings.hiddenFolders.includes(path)) {
                    menu.addItem((item) => item
                        .setTitle('取消隐藏文件夹')
                        .setIcon('eye')
                        .onClick(() => this.unhideFolder(path)));
                }
                else {
                    menu.addItem((item) => item
                        .setTitle('隐藏文件夹')
                        .setIcon('eye-off')
                        .onClick(() => this.hideFolder(path)));
                }
            }
        }));
        // 3) 文件树重渲染后重新应用隐藏（例如切换 vault、折叠展开触发的重绘）
        this.registerEvent(this.app.workspace.on('layout-change', () => this.applyHiding()));
        // 启动时应用一次
        this.applyHiding();
    }
    onunload() {
        this.removeStyle();
    }
    // 隐藏某个文件夹
    async hideFolder(path) {
        if (!this.settings.hiddenFolders.includes(path)) {
            this.settings.hiddenFolders.push(path);
            await this.saveSettings();
            this.applyHiding();
            new obsidian.Notice('已隐藏文件夹：' + path);
        }
    }
    // 取消隐藏某个文件夹
    async unhideFolder(path) {
        this.settings.hiddenFolders = this.settings.hiddenFolders.filter((p) => p !== path);
        await this.saveSettings();
        this.applyHiding();
        new obsidian.Notice('已取消隐藏：' + path);
    }
    // 根据设置注入或移除隐藏样式
    applyHiding() {
        this.removeStyle();
        if (!this.settings.enabled) {
            return; // 总开关关闭：不注入样式，全部文件夹显示
        }
        const rules = [];
        for (const path of this.settings.hiddenFolders) {
            const safe = this.escapeCss(path);
            rules.push(`.nav-folder:has(.nav-folder-title[data-path="${safe}"]) { display: none; }`);
        }
        if (rules.length === 0) {
            return;
        }
        const style = document.createElement('style');
        style.id = 'simple-folder-hider-style';
        style.textContent = rules.join('\n');
        document.head.appendChild(style);
    }
    removeStyle() {
        const el = document.getElementById('simple-folder-hider-style');
        if (el) {
            el.remove();
        }
    }
    // 转义 CSS 属性选择器里的特殊字符（双引号与反斜杠）
    escapeCss(value) {
        return value.replace(/["\\]/g, '\\$&');
    }
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    async saveSettings() {
        await this.saveData(this.settings);
    }
}

module.exports = SimpleFolderHider;
