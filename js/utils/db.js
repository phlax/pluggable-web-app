
import {Replicant} from './sync';


export class PouchClient {

    constructor (worker) {
	this.log = worker.debug('worker:data');
	this.worker = worker;
	this.data = worker.data;
	this.signals = worker.signals;
	this.listen();
    }

    listen () {
	this.signals.listen(
	    'ws.pouch',
	    this.onPouch);
    }

    async respond (msg, data) {
	if (msg.msg === 'all-dbs') {
	    this.log(msg.msg, 'sent: response');
	} else {
	    this.log(msg.db, 'sent: response', msg.msg, data);
	}
	await this.worker.socket.send({
	    id: msg.id,
	    request: msg.request,
	    command: 'pouch',
	    db: msg.db,
	    data});
    }

    replicant (msg) {
	return new Replicant(this.worker, msg);
    }

    async getData (msg) {
	switch(msg.msg) {
	case 'all-dbs':
            return Object.keys(this.data);
	case 'db.info':
            return this.data[msg.db];
	case 'db.exists':
            return Object.keys(this.data).indexOf(msg.db) !== -1;
	case 'db.all_docs':
            return await this.data[msg.db].allDocs(msg.params);
	case 'db.replicate':
            this.log('replicating local db(' + msg.db + ') to remote');
            return await this.data[msg.db].replicate.to(this.replicant(msg));
	default:
	    throw new Error('Unrecognized db command: ' + msg.msg);
	}
     }
    
    onPouch = async (evt, msg) => {
        let data;
	if (msg.msg === 'db.response') {
            this.signals.emit(msg.request, msg);
            return;
        }
        
	if (msg.msg === 'all-dbs') {
	    this.log(msg.msg, 'recv: request');
	} else {
	    this.log(msg.db, 'recv: request', msg.msg);
	}
        try {
            data = await this.getData(msg);
        } catch (err) {
            console.warn(err);
        }
	if (data) {
	    try {
		await this.respond(msg, data);
	    } catch (err) {
		console.warn(err);
	    }
	}
    }
}
