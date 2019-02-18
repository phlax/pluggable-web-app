
export default class BaseColumn {
    _onClick = null;
   
    constructor (params) {
	let {props, state, ...options} = params;
	this.props = props || {};
	this.state = state || {};
	this.options = options || {};
    }

    accessor = (data) => {
	if (this.options.accessor) {
	    if (typeof this.options.accessor === 'string') {
		return data[this.options.accessor];
	    }
	    return this.options.accessor(data);
	}
	return data[this._accessor || this.id]
    }

    onClick = (evt) => {
	evt.preventDefault();
	(this.options.onClick || this.props.onClick)(evt); 
    }
    
    Header = () => {
	const {l10n} = this.props;
        return l10n[this.options.label || this.l10n] || '{{ ' + (this.options.label || this.l10n) + ' }}';
    }   
}
