

export default class WindowsManager {
    z = 1000;
    _windows = {};

    constructor(getId, log) {
	this.getId = getId;
        this.log = log;
    }

    create (window) {
	const {window: name} = window;	
        let uuid = window.id || this.getId();
	this.log('creating window', uuid, window);
        const {props, Window} = window;
        this._windows[uuid] = {
            id: uuid,
	    name: name,
	    z: this.z + this.ids.length + 1,
            props, Window};
	return uuid;
    }

    destroy (windowid) {
	delete this._windows[windowid];
    }

    focus (windowid) {
        if (!this.atTopOfStack(windowid)) {
            this.moveToTopOfStack(windowid);
        }
    }

    atTopOfStack (windowid) {
        return this.stack[this.ids.length - 1] === windowid;
    }

    moveToTopOfStack (windowid) {
        this.stack.filter(w => w !== windowid).forEach((w, i) => {
            this._windows[w].z = this.z + i + 1;
        });
        this._windows[windowid].z = this.z + this.ids.length + 1;
    }

    get windows () {
	return Object.values(this._windows);
    }

    get ids () {
	return Object.keys(this._windows);
    }

    get stack () {
	return this.ids
	    .sort((w1, w2) => this.get(w1).z > this.get(w2).z);
    }

    get (window) {
	return this._windows[window];
    }
}
