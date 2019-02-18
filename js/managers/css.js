

export default class CSSManager {
    _overrides = {};
    _loaded = {}
    _theme = null;

    constructor (app) {
	const {debug} = app;
	this.app = app;
	this.log = debug('app:ui:css');
    }

    load () {
	const {app, importCSS} = this;
	const {signals} = app;
	signals.listen('ui.import.css', importCSS, 'ui.css');
    }

    addOverride (path, override) {
	this.log('Added override for ' + path)
	this._overrides[path] = override;
    }

    hasOverride = (path) => {
	return Object.keys(this._overrides).indexOf(path) === -1;
    }

    overrideCSS = async (path) => {
	await this._overrides[path](path);
    }

    importCSS = async (path, importer) => {
	const {
	    hasOverride, log, markNode,
	    overrideCSS, _overrides} = this
	log('Dynamically importing ' + path, _overrides, hasOverride(path))
	if (!hasOverride(path)) {
	    await overrideCSS(path);
	} else {
	    await importer(path);
	}
	markNode();
    }

    markNode = () => {
	const styles = document.querySelectorAll("head style");
	const node = styles[styles.length - 1];
	// node.setAttribute('rel', 'stylesheet alternate');
        node.setAttribute('data-theme', this.theme);
    }

    importThemeCSS = async (path, importer) => {
	await importer(path);
	this.markNode();
    }

    reset = async () => {
	const styles = document.querySelectorAll("head style[data-theme]");
        return await Promise.all(
            [...styles].map(node => {
                return node.setAttribute('type', 'text/disabled');
            }));
    }

    get theme () {
	return this._theme;
    }

    activate = async (name) => {
        this._theme = name;
	await this.reset();
	const styles = document.querySelectorAll("head style[data-theme='" + name + "']");
	[...styles].forEach(node => {
            node.setAttribute('type', 'text/css');
        });
    }
}
