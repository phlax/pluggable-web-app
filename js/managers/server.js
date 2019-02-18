

export default class ServerManager {

    constructor (app) {
	this.app = app;
    }

    call = async (args) => {
	const {worker} = this.app;
	args.cmd = 'server.' + args.cmd;
	return await worker.call(args);
    };
}
