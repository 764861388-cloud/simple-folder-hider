import { Plugin, TFolder, TFile, Notice, Menu, setIcon } from 'obsidian';

// 插件持久化数据结构
interface SimpleFolderHiderSettings {
	enabled: boolean; // 全局总开关：关闭时全部显示，开启时按隐藏列表生效
	hiddenFolders: string[]; // 需要隐藏的文件夹路径列表
	hiddenFiles: string[]; // 需要隐藏的笔记（文件）路径列表
}

const DEFAULT_SETTINGS: SimpleFolderHiderSettings = {
	enabled: false,
	hiddenFolders: [],
	hiddenFiles: [],
};

// 用于标记"被隐藏"的 CSS 类名，实际隐藏规则定义在 styles.css 中（不动态注入样式）
const HIDDEN_CLASS = 'simple-folder-hider-hidden';
const TOGGLE_BTN_CLASS = 'sfh-toggle-btn';

export default class SimpleFolderHider extends Plugin {
	settings: SimpleFolderHiderSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		// 1) 文件浏览器工具栏眼睛开关
		this.addToolbarButton();

		// 2) 文件树文件夹 / 笔记 右键菜单
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
				} else if (file instanceof TFile) {
					const path = file.path;
					if (this.settings.hiddenFiles.includes(path)) {
						menu.addItem((item) =>
							item
								.setTitle('取消隐藏笔记')
								.setIcon('eye')
								.onClick(() => this.unhideFile(path))
						);
					} else {
						menu.addItem((item) =>
							item
								.setTitle('隐藏笔记')
								.setIcon('eye-off')
								.onClick(() => this.hideFile(path))
						);
					}
				}
			})
		);

		// 3) 文件树重渲染后重新应用隐藏（例如切换 vault、折叠展开触发的重绘）
		this.registerEvent(
			this.app.workspace.on('layout-change', () => this.applyHiding())
		);

		// 4) 启动时应用隐藏：等文件树渲染完成后再应用，否则 DOM 里还没有 .nav-folder / .nav-file
		this.app.workspace.onLayoutReady(() => this.applyHiding());
		window.setTimeout(() => this.applyHiding(), 600);
		window.setTimeout(() => this.applyHiding(), 1500);
	}

	onunload() {
		this.clearHiddenMarks();
	}

	/** 在文件浏览器工具栏注入眼睛总开关 */
	private addToolbarButton() {
		const tryAdd = () => {
			const leaves = document.querySelectorAll(
				".workspace-leaf-content[data-type='file-explorer']"
			);
			leaves.forEach((leaf) => {
				const header = leaf.querySelector('.nav-header') as HTMLElement | null;
				if (!header) return;
				if (header.querySelector('.' + TOGGLE_BTN_CLASS)) return;

				const btn = document.createElement('div');
				btn.className =
					'clickable-icon nav-action-button ' + TOGGLE_BTN_CLASS;
				btn.setAttribute('aria-label', '简易隐藏：点击切换隐藏总开关');
				setIcon(btn, this.settings.enabled ? 'eye' : 'eye-off');

				btn.addEventListener('click', async () => {
					this.settings.enabled = !this.settings.enabled;
					await this.saveSettings();
					this.applyHiding();
					setIcon(btn, this.settings.enabled ? 'eye' : 'eye-off');
					new Notice(
						this.settings.enabled
							? '简易隐藏：总开关已开启（隐藏生效）'
							: '简易隐藏：总开关已关闭（全部显示）'
					);
				});

				const container = header.querySelector(
					'.nav-buttons-container'
				) as HTMLElement | null;
				if (container) container.appendChild(btn);
				else header.appendChild(btn);
			});
		};

		tryAdd();
		const obs = new MutationObserver(tryAdd);
		obs.observe(document.body, { childList: true, subtree: true });
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

	// 隐藏某条笔记（文件）
	async hideFile(path: string) {
		if (!this.settings.hiddenFiles.includes(path)) {
			this.settings.hiddenFiles.push(path);
			await this.saveSettings();
			this.applyHiding();
			new Notice('已隐藏笔记：' + path);
		}
	}

	// 取消隐藏某条笔记（文件）
	async unhideFile(path: string) {
		this.settings.hiddenFiles = this.settings.hiddenFiles.filter(
			(p) => p !== path
		);
		await this.saveSettings();
		this.applyHiding();
		new Notice('已取消隐藏：' + path);
	}

	// 根据设置给需要隐藏的元素打上 HIDDEN_CLASS，由 styles.css 负责真正隐藏
	applyHiding() {
		this.clearHiddenMarks();
		if (!this.settings.enabled) {
			return; // 总开关关闭：不隐藏任何东西
		}
		if (
			this.settings.hiddenFolders.length === 0 &&
			this.settings.hiddenFiles.length === 0
		) {
			return;
		}

		// 处理文件夹
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

		// 处理笔记（文件）
		const fileEls = document.querySelectorAll('.nav-file');
		fileEls.forEach((file) => {
			const title = file.querySelector(':scope > .nav-file-title');
			if (!title) {
				return;
			}
			const path = title.getAttribute('data-path');
			if (path && this.settings.hiddenFiles.includes(path)) {
				file.classList.add(HIDDEN_CLASS);
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
		// 兼容旧版本：若没有 hiddenFiles 字段则补默认空数组
		if (!Array.isArray(this.settings.hiddenFiles)) {
			this.settings.hiddenFiles = [];
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
