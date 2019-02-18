

export default class LogManager {

    constructor (app) {
	this.app = app;
    }

    of = async (of, params) => {
	const {worker} = this.app;
	return await worker.call({cmd: 'logs.of', params: {of, ...params}});
    }
}
