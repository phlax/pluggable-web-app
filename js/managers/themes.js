

export default class ThemeManager {

    constructor (app) {
	const {debug} = app;
	this.app = app;
	this.log = debug('app:ui:theme');
    }

    load = async () => {
	const {app} = this;
	const {hooks, themes} = app;
	await hooks.themes.promise(themes);
	return this;
    }

    loadTheme = async () => {
	const {
	    active, css, setting, l10n, loadedCSS,
	    media, themes, widgets} = this.app;
	let themeName;

	if (active.user) {
	    themeName = setting['core.ui.theme'].value;
	} else {
	    // not sure if we want to allow this
	    themeName = localStorage.theme;
	}

	if (!themeName || typeof themeName !== 'string' || themeName === 'core.default') {
	    return;
	}
	
	const theme = themes[themeName];
	await css.activate(themeName);
	if (loadedCSS.indexOf(themeName) === -1) {
	    loadedCSS.push(themeName);

	    if (theme.mangle) {	    
		await theme.mangle({css, setting, l10n, media, widgets});
	    }
	}
    }
}
