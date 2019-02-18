

export default class PluginWrapper {
    taps = ['widgets'];
    promises = [
        'buttons', 'managers', 'apps', 'columns', 'data',
	'fields', 'forms', 'oauth',
        'media', 'providers', 'session', 'settings', 'navs', 'tables',
        'tasks', 'themes', 'utils', 'panels', 'windows',
	'actions', 'validators']

    constructor(Plugin, app) {
        const {debug} = app;
	this.app = app;
	this.context = new Plugin(app);
        const {name} = this.context;
        this.log = debug('app:' + name);
    }

    configure () {
	const {addDefaultHooks, addHooks, app, context, log} = this;
        const {getPluginHooks, name} = context;
        if (getPluginHooks) {
            context.hooks = getPluginHooks();
        }
	app.plugins[name] = this;
        addDefaultHooks();
        addHooks();
	log('plugin configured');
    }

    addHooks = () => {
        const {app, context} = this;
        const {addHooks} = context;
        const {hooks} = app;
        if (addHooks) {
            addHooks(hooks);
        }
    }

    addDefaultHooks = () => {
	const {app, context, l10n, l10nExtra} = this;
	const {
	    hasL10n, name} = context;
	const {hooks} = app;
	if (hasL10n) {
            hooks.l10n.tapPromise(
		name + '.l10n',
		l10n);
	    hooks.l10nExtra.tapPromise(
		name + '.l10nExtra',
		l10nExtra);
	}
        this.taps.forEach(hookup => {
	    if (context[hookup]) {
		hooks[hookup].tap(name + "." + hookup, context[hookup]);
	    }
	});
	this.promises.forEach(hookup => {
	    if (context[hookup]) {
		hooks[hookup].tapPromise(name + "." + hookup, context[hookup]);
	    }
	});
    }

    addPluginHooks () {
        const {addPluginHooks} = this.context;
        if (addPluginHooks) {
            addPluginHooks();
        }
    }

    get hooks () {
	return this.context.hooks;
    }

    get name () {
        return this.context.name;
    }

    get languages () {
        return this.context.languages;
    }    

    load = async () => {
	if (this.context.load) {
	    return await this.context.load();
	}
    }

    loadL10n = async (language, filetype) => {
	if (this.context.loadL10n) {
	    return await this.context.loadL10n(language, filetype);
	}
    }
    
    preLoad = async () => {
	if (this.context.preLoad) {
	    return await this.context.preLoad();
	}
    }

    _l10n = async (strings, filetype) => {
        const {app, loadL10n, name} = this;
        const {debug} = app;
	const log = debug('app:' + name + ':l10n');
	const locales = {en: await loadL10n(name, 'en', filetype)};
	log('en', 'load', 'essential', locales['en']);
	if (navigator.language) {
	    const language = navigator.language.split('-')[0];
	    try {
		locales[language] = await loadL10n(name, language, filetype);
		log(language, 'load', 'essential', locales[language]);
	    } catch (err) {
		//
	    }
	}
	strings.setContent(locales);
	return strings;
    }
    
    l10n = async (strings) => {
        return await this._l10n(strings, 'essential');
    }

    l10nExtra = async (strings, app) => {
	if (app && app.name !== this.name) {
	    return;
	}
        return await this._l10n(strings, 'manifest');        
    }
}
