import { Plugin, TFolder, Notice, Menu, setIcon } from 'obsidian';

// 插件持久化数据结构
interface SimpleFolderHiderSettings {
	enabled: boolean; // 全局总开关：关闭时全部显示，开启时按隐藏列表生效
	hiddenFolders: string[]; // 需要隐藏的文件夹路径列表
}

const DEFAULT_SETTINGS: SimpleFolderHiderSettings = {
	enabled: false,
	hiddenFolders: [],
};

// 用于标记"被隐藏"的 CSS 类名，实际隐藏规则定义在 styles.css 中（不动态注入样式）
const HIDDEN_CLASS = 'simple-folder-hider-hidden';

export default class SimpleFolderHider extends Plugin {
	settings: SimpleFolderHiderSettings = DEFAULT_SETTINGS;
	private ribbonEl: HTMLElement | null = null;

	async onload() {
		await this.loadSettings();

		// 1) 侧边栏眼睛图标：全局总开关
		const initialIcon = this.settings.enabled ? 'eye' : 'eye-off';
		this.ribbonEl = this.addRibbonIcon(
			initialIcon,
			'简易文件夹隐藏：点击切换隐藏总开关',
			async () => {
				this.settings.enabled = !this.settings.enabled;
				await this.saveSettings();
				this.applyHiding();
				if (this.ribbonEl) {
					setIcon(this.ribbonEl, this.settings.enabled ? 'eye' : 'eye-off');
				}
				if (this.settings.enabled) {
					new Notice('简易文件夹隐藏：总开关已开启（隐藏生效）');
				} else {
					new Notice('简易文件夹隐藏：总开关已关闭（全部显示）');
				}
			}
		);

		// 2) 文件树文件夹右键菜单
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu: Menu, file) => {
				if (file instanceof TFolder) {
					const path = file.path;
					if (this.settings.hiddenFolders.includes(path)) {
						menu.addItem((item) =>
							item
								.setTitle('取消隐藏文件夹')
								.setIcon('eye')
								.onClick(() => this.unhideFolder(path))
						);
					} else {
						menu.addItem((item) =>
							item
								.setTitle('隐藏文件夹')
								.setIcon('eye-off')
								.onClick(() => this.hideFolder(path))
						);
					}
				}
			})
		);

		// 3) 文件树重渲染后重新应用隐藏（例如切换 vault、折叠展开触发的重绘）
		this.registerEvent(
			this.app.workspace.on('layout-change', () => this.applyHiding())
		);

		// 启动时应用一次
		this.applyHiding();
	}

	onunload() {
		this.clearHiddenMarks();
	}

	// 隐藏某个文件夹
	async hideFolder(path: string) {
		if (!this.settings.hiddenFolders.includes(path)) {
			this.settings.hiddenFolders.push(path);
			await this.saveSettings();
			this.applyHiding();
			new Notice('已隐藏文件夹：' + path);
		}
	}

	// 取消隐藏某个文件夹
	async unhideFolder(path: string) {
		this.settings.hiddenFolders = this.settings.hiddenFolders.filter(
			(p) => p !== path
		);
		await this.saveSettings();
		this.applyHiding();
		new Notice('已取消隐藏：' + path);
	}

	// 根据设置给需要隐藏的文件夹元素打上 HIDDEN_CLASS，由 styles.css 负责真正隐藏
	applyHiding() {
		this.clearHiddenMarks();
		if (!this.settings.enabled) {
			return; // 总开关关闭：不隐藏任何文件夹
		}
		if (this.settings.hiddenFolders.length === 0) {
			return;
		}

		const folderEls = document.querySelectorAll('.nav-folder');
		folderEls.forEach((folder) => {
			const title = folder.querySelector(':scope > .nav-folder-title');
			if (!title) {
				return;
			}
			const path = title.getAttribute('data-path');
			if (path && this.settings.hiddenFolders.includes(path)) {
				folder.classList.add(HIDDEN_CLASS);
			}
		});
	}

	// 移除所有已标记的隐藏类，恢复显示
	private clearHiddenMarks() {
		document
			.querySelectorAll('.' + HIDDEN_CLASS)
			.forEach((el) => el.classList.remove(HIDDEN_CLASS));
	}

	async loadSettings() {
		const data = (await this.loadData()) as Partial<SimpleFolderHiderSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
