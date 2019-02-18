
import {createBrowserHistory} from 'history';


export default class HistoryManager {

    constructor (app) {
	this.app = app;
	this.history = createBrowserHistory();
	this.history.listen(this.handleHistory);
    }

    handleHistory = (location, action) => {
	const {active, apps, defaultApp, signals, utils} = this.app;
	const {strip} = utils;

	if (action === 'POP') {
	    const parts = (strip(location.pathname, '/') || '').split('/');
	    let app, page;
	    if (parts.length > 0) {
		app = apps[parts[0]];
		page = ['', ...parts.slice(1)].join('/');
	    } else {
		app = apps[defaultApp]
		page = '';
	    }
	    if (active.app !== app) {
		active.app = app;
	    }
	    if (active.page !== page) {
		active.page = page;
	    }
	}
	signals.emit('ui.page.switch')
    }
}
