

export default class AuthManager {

    constructor (app) {
	this.app = app;
	this.log = app.debug('app:auth');
    }

    load = async () => {
	const {active, hooks, setting, utils, session} = this.app;
	await hooks.session.promise(session);
	if (!utils.localStorage.session) {
	    // return;
	}
	const {response} = await session['auth.authenticate']({
            session: localStorage.session});
	const {username, settings} = response || {};

	if (username) {
	    active.user = {response};
            for (let [k, v] of Object.entries(settings || {})) {
                setting[k].set(v);
            }
	}
	return this;
    }
}


export class Session {

    constructor(app) {
        this.log = app.debug('app:auth');
	this.app = app;
        this.app.signals.listen('auth.logout', this.logout, 'app.auth');
	this.app.signals.listen('auth.login.success',  this.login, 'app.auth');
	this.app.signals.listen('auth.register.success',  this.login, 'app.auth');

    }

    _call = async (params) => {
	return await this.app.server.call(params)
    }

    _emit = (signal, data) => {
	this.app.signals.emit(signal, data)
    }

    async _logout () {
	const {worker} = this.app;
	return await worker.call({cmd: 'auth.logout'});
    }

    onLogin = async (auth) => {
        this._emit('auth.login.success', auth.data);
    }

    onLogout = (auth) => {
        this._emit('auth.logout.success', auth.data);
    }

    onSignup = async (auth) => {
        this._emit('auth.register.success', auth.data);
    }

    authenticate = async (username, password) => {
	const {active, setting, signals, worker} = this.app;
	let params = {username, password};
        if (!password) {
	    // need to rethink this a bit as it needs the lang (?)
            // auth session - use worker
	    const language = navigator.language.split('-')[0];
            params = {
		language,
		...(username || {})};
	    const {response} = await worker.call({
		cmd: 'auth.login',
		params});
	    const {l10n} = response;
	    if (l10n) {
		signals.emit('l10n.update', l10n);
	    }	    
	    return {response};
        }
        const {response} = await worker.call({
	    cmd: 'auth.login',
	    params});
        const {settings} = response;
        if (response) {
            active.user = response;
	    localStorage.session = response._id;
        }
        if (settings) {
            for (let [k, v] of Object.entries(settings)) {
		setting[k].set(v);
            }
            signals.emit('ui.theme.render', settings['core.ui.theme']);
        }
        return response
    }

    login = async (signal, user) => {
        const {active} = this.app;
        active.user = user;
	localStorage.session = user._id;
    }

    logout = async () => {
        const {
            active, apps, defaultApp,
            manager, setting, signals} = this.app;
        await this._logout();
        delete active.user;
	active.app = apps[defaultApp];
        delete localStorage.session;
	active.page = '';
	this.app.history.push('/');
	
        // reload default settings
        await manager['settings'].load();
        this._emit('auth.logout.success');
        signals.emit('ui.theme.render', setting['core.ui.theme']);
    }

    register = async (username, password, email) => {
	// todo
    }
}
