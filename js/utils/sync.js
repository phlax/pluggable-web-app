
import getArguments from 'argsarray';

import uuidv4 from 'uuid/v4';


export class RemotePouchClient {
    _requests = {}

    constructor (worker) {
	this.worker = worker;
	this.log = worker.debug('worker:pouch');
    }

    _post (msg) {
	this.worker.port.postMessage(JSON.stringify(msg));
    }    
    
    onResponse = (id, response) => {
	this.log('recv.ui', 'response', response);
	this.log('send.ws', 'response', response);
	try {
	    this._post(response);
	} catch (err) {
	    console.warn(err)
	}
    }

    handle (msg) {
	this.log('recv.ws', 'request', msg);
        this.worker.signals.listen(msg.request, this.onResponse);
	let params = {
	    request: msg.request,
	    db: msg.db,
	    params: msg.params,
	    command: 'pouch',
	    action: msg.action};
	this.log('send.ui', 'request', params);
	this.worker.socket.send(params);
    }
}


export class RemoteClient {
    _requests = {}

    constructor (app) {
	this.log = app.debug('app:pouch');
	this.app = app;
    }

    _post (msg) {
	this.app.worker.send(msg);
    }

    onResponse = (id, msg) => {
	this.log('recv', msg);
	//let [resolve, reject] = this._requests[msg.request]
	const resolve = this._requests[msg.request]
	resolve(msg);
    }
    
    async allDbs (params) {
        return new Promise((resolve, reject) => {
	    let uid = uuidv4();	    
            this._requests[uid] = [resolve, reject];
	    this.app.signals.listen(uid, this.onResponse);
	    this._post({
		request: uid,
		params: params,
		command: 'pouch',
		action: 'allDbs'});
	});
    }

    async allDocs (db, params) {
        return new Promise((resolve, reject) => {
	    let uid = uuidv4();	    
            this._requests[uid] = [resolve, reject];
	    this.app.signals.listen(uid, this.onResponse);
	    this._post({
		request: uid,
		command: 'pouch',
		db,
		params,
		action: 'allDocs'});
	});
    }
    
    async __allDbs () {
	let uid = uuidv4();
        return await this.syncify(
	    {request: uid},
            () => {
                return this.app.worker.socket.send({
		    request: uid,
		    command: 'pouch',
		    action: 'allDbs'});
            });
    }

    onSyncResponse = (id, response) => {
	// let [resolve, reject, failsIf, db, command] = this._requests[id];
	let [resolve, reject, failsIf] = this._requests[id];
        let failing = false;
        if (failsIf) {
            failing = failsIf(id, response);
        }
        this.worker.signals.unlisten(id, this.onSyncResponse);
	this.log(this.msg.db, 'recv: response', this.msg.msg);
        if (failing) {
	    reject(response.data);
        } else {
            resolve(response.data.data);
        }
    }

    syncify (msg, f, name, failsIf) {
        return new Promise(async (resolve, reject) => {
            this._requests[msg.request] = [resolve, reject, failsIf, msg.db, msg.msg];
            this.worker.signals.listen(msg.request, this.onSyncResponse);
	    if (name) {
		this.log(msg.db, 'sent: request', name);
	    }
            try {
                await f();
            } catch (err) {
                console.warn(err);
            }
	});
    }
}


export class Replicant {
    _requests = {}

    constructor (worker, msg) {
	this.log = worker.debug('worker:sync');
	this.worker = worker;
	this.msg = msg;
    }

    onSyncResponse = (id, response) => {
	let [resolve, reject, failsIf] = this._requests[id];
        let failing = false;
        if (failsIf) {
            failing = failsIf(id, response);
        }
        this.worker.signals.unlisten(id, this.onSyncResponse);
	this.log(this.msg.db, 'recv: response', this.msg.msg);
        if (failing) {
	    reject(response.data);
        } else {
            resolve(response.data.data);
        }
    }

    syncify (msg, f, name, failsIf) {
        return new Promise(async (resolve, reject) => {
            this._requests[msg.request] = [resolve, reject, failsIf, msg.db, msg.msg];
            this.worker.signals.listen(msg.request, this.onSyncResponse);
	    if (name) {
		this.log(msg.db, 'sent: request', name);
	    }
            try {
                await f();
            } catch (err) {
                console.warn(err);
            }
	});
    }

    async id () {
	return this.msg.name;
    }

    async get (docid) {
        let _get = this.syncify(
	    this.msg,
            () => {
		return this.worker.socket.send({
		    id: this.msg.id,
		    request: this.msg.request,
		    command: 'pouch',
		    db: this.msg.db,
		    action: 'get',
		    data: docid});
            },
	    'get',
            (id, result) => {
                return result.data.status !== 200;
            }
        );
        return await _get;
    }

    async put (item, foo) {
        return await this.syncify(
            this.msg,
            () => {
                let resp = this.worker.socket.send({
		        id: this.msg.id,
		        request: this.msg.request,
		        command: 'pouch',
		        db: this.msg.db,
		        action: 'put',
		        data: item});
                return resp;
            });
    }

    async revsDiff (diff) {
        return await this.syncify(
            this.msg,
            () => {
                return this.worker.socket.send({
		        id: this.msg.id,
		        request: this.msg.request,
		        command: 'pouch',
		        db: this.msg.db,
		        action: 'revsDiff',
		        data: diff});
            });
    }

    async bulkDocs (params, opts) {
	return await this.syncify(
            this.msg,
            () => {
                return this.worker.socket.send({
		    id: this.msg.id,
		    request: this.msg.request,
		    command: 'pouch',
		    db: this.msg.db,
		    action: 'bulkDocs',
		    data: {params, opts}});
            });
    }

    getBatchDocs () {
	// console.log('BATCH!')
    }

    getDiffs () {
	// console.log('DOIFFS!')
    }

    once (fun) {
	let called = false;
	return getArguments(args => {
	    if (called) {
		throw new Error('once called more than once');
	    } else {
		called = true;
		fun.apply(this, args);
	    }
	});
    }
}
