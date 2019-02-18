
import {strip} from '@pluggable/app/utils';


export default class ResolverManager {

    constructor (app) {
	this.app = app;
    }

    resolve = async (pathname) => {
        const {active, apps, defaultApp} = this.app;
	const resolved = [''];

	// for a given path...

	// resolve the app

	// have the app resolve the page

	// if app or page dont resolve, 404

	// if app + page != given path, add canonical header
	const stripped = strip(pathname, '/') || '';
	const parts = stripped.split('/').filter(p => p !== '');
	if (parts.length > 0) {
	    const appName = parts[0];
	    const _active = apps[appName];
	    active.app = _active;
	    resolved.push(appName);
	    if (parts.length > 1) {
		let page = await active.app.resolve(
		    this.active.app,
		    [''].concat(parts.slice(1)).join('/'));
		if (page) {
		    active.page = page;
		    resolved.push(strip(active.page, '/'));
		}
	    } else {
		active.page = '';
	    }
	} else {
	    active.app = apps[defaultApp];
	    active.page = '';
	}
	if (pathname !== resolved.join('/')) {
	    // console.log('setting canonical header', pathname, resolved.join('/'));
	}
    }
}
