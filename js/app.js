
import {
    AsyncParallelHook, AsyncSeriesBailHook, SyncHook,
    AsyncSeriesWaterfallHook} from 'tapable';

import {PluggableApp} from '@pluggable/app';
import {strip} from '@pluggable/app/utils';

import {
    HistoryManager, LogManager, ResolverManager,
    ServerManager, WidgetManager, WindowsManager} from './managers';


export default class PluggableWebApp extends PluggableApp {
    actions = {}
    active = {}
    widgets = {};
    columns = {};
    loadedCSS = []
    fields = {};
    forms = {};
    media = {}
    menus = {};
    oauth = {};
    panels = {};
    session = {};
    navs = {}
    tables = {}
    themes = {}
    windows = {}
    buttons = {};
    validators = {};
    _managers = {}
    _loaded = false;
    _failed = false;
    _webHooks = {
        widgets: [SyncHook, ['params']],
	themes: [AsyncParallelHook, ['result']],
        session: [AsyncSeriesWaterfallHook, ['result']],
	media: [AsyncParallelHook, ['media']],
	columns: [AsyncParallelHook, ['columns']],
	oauth: [AsyncParallelHook, ['oauth']],
	fields: [AsyncParallelHook, ['field']],
	forms: [AsyncParallelHook, ['form']],
	menus: [AsyncParallelHook, ['menu']],
	buttons: [AsyncParallelHook, ['toolbar']],
	layout: [AsyncSeriesBailHook, ['state', 'app']],
	navs: [AsyncParallelHook, ['nav']],
	tables: [AsyncParallelHook, ['table']],
	windows: [AsyncParallelHook, ['tab']],
	panels: [AsyncParallelHook, ['panels']],
	validators: [AsyncParallelHook, ['toolbar']],	
    };

    // automatically hooked up from plugin if present in class
    _loadable = [
        'media', 'widgets', 'columns', 'providers', 'fields', 'forms',
        'buttons', 'apps', 'navs', 'tables', 'oauth', 'panels', 'windows',
	'actions', 'validators']

    async load () {
	const {log} = this;
	log('loading');
	// hmmm
	this._history = new HistoryManager(this);
	this.history = this._history.history;
        this.server = new ServerManager(this);
        this.logs = new LogManager(this);
	this.resolver = new ResolverManager(this);
	this.manager['widgets'] = new WidgetManager(this);	
	log('pre-loading');
	try {
	    await this.preLoad();
	} catch (err) {
	    log('failed pre-loading', err);
            this._failed = true;
	    return;
	}
        this._loaded = true;
	for (let plugin of Object.values(this.plugins)) {
	    await plugin.preLoad();
	}
	log('UI and auth in parrallel')
	try {
	    await Promise.all(
		[this.loadAuth(),
		 this.loadUI(),
		]);
	} catch (err) {
	    log('failed loading', err);
            this._failed = true;
	    return;
	}
	for (let plugin of Object.values(this.plugins)) {
	    await plugin.load();
	}
	try {
	    await this.postLoad();
	} catch (err) {
	    log('failed post-loading', err);
            this._failed = true;
	    return;
	}
        this._loaded = true;
    }

    constructor (debugging, onReady) {
	super(debugging, onReady);
	this.getWebHooks();	
    }

    getWebHooks () {
	const {_webHooks} = this;
	Object.entries(_webHooks).forEach(([k, [hook, params]]) => {
	    this.hooks[k] = new hook(params);
	    this.log('hook added', k);
	});
	this.log('hooks added');
    }

    async postLoad () {
	const {log, manager} = this;
	// check path exists and user has permission
	// this can happen earlier if theres no user obj
	log('loading actual theme');
	await manager['theme'].loadTheme();
	log('actual theme loaded');
	if (this.active.app.loadCSS) {
	    await this.active.app.loadCSS(this.active.app);
	}
	// move/cleanup this
	this.manager['windows'] = new WindowsManager(
	    this.utils.uuidv4,
            this.debug('app:ui:window'));
	log('css loaded');
	if (this.onReady) {
	    this.onReady();
	}
	log('app loaded');
    }

    async loadAuth () {
        const {
            _managers,
            log, manager} = this;
	// this has to happen in this order
        const loaders = {
            settings: _managers.settings,
            auth: _managers.auth}
	await Promise.all(Object.keys(loaders).map(async loader => {
            manager[loader] = await new loaders[loader](this).load();
            log(loader + ' loaded', manager[loader]);
        }))
	log('UI and auth in parrallel: Auth complete')
    }

    async preLoad () {
        const {_getManager, hooks, log} = this;
	['signals', 'logger'].forEach(loader => {
	    this[loader] = hooks[loader].call(this);
	    log(loader + ' loaded');
	});
	const loaders = []
	for (let loader of ['worker', '_managers', 'tasks', 'utils']) {
	    loaders.push(hooks[strip(loader, '_')].promise(this[loader]));
        }
	await Promise.all(loaders);
	log('loaded ', ['_managers', 'tasks', 'utils', 'worker'].join(', '));
 	['jobs', 'css'].forEach(loader => {
	    this[loader] = _getManager(loader);
	    log('loaded', loader);
	});
    }

    async loadL10n () {
	const {_getManager, hooks, manager} = this;
	this.i18n = hooks.i18n.call();
	manager['l10n'] = _getManager('l10n');
	this.l10n = await manager['l10n'].load();
    }

    async loadTheme () {
	const {_loadManager, manager} = this;
	await this.css.load();
	manager['theme'] = await _loadManager('themes');
    }

    async loadUI () {
        const {history, log, manager} = this;
	const {pathname} = history.location;
	
	// const {pathname} = history.location;
        await this.loadL10n();
        log('l10n loaded');
        await this._loadHooks(this._loadable);
        await this.loadTheme();
        log('themes loaded', this.themes);
	log('UI and auth in parrallel: UI complete')
	await this.resolver.resolve(pathname);
	if (!localStorage.session) {
	    log('loading actual theme');
	    await manager['theme'].loadTheme();
	    log('actual theme loaded');
	    if (this.active.app.loadCSS) {
		await this.active.app.loadCSS(this.active.app);
	    }
	}
    }
}
