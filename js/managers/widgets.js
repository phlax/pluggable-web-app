
// wtf!
const exactKey = "prop-types-exact: ​";


export default class WidgetManager {

    constructor (app) {
	this.app = app;
        this.widgets = app.widgets;
    }

    get data () {
	const {_getDefaultProps, widgets} = this;
	return Object.entries(widgets).map(([k, w]) => {
            const _propTypes = this._getPropTypes(w);
            const _propTypeKeys = Object.keys(_propTypes);
            const _defaultProps = _getDefaultProps(w);
            const hasProblems = this._hasProblems(_propTypes, _defaultProps).toString();
            return {
	        _id: k,
	        id: k,
	        name: w.name,
		plugin: w[Symbol.for('plugin')],
		type: w[Symbol.for('widget.type')],
		pure: Boolean(this._getTarget(w).prototype.isPureReactComponent),
                broken: hasProblems.toString(),
                defaultProps: _defaultProps.join(', '),
	        propTypesExact: (_propTypeKeys.indexOf(exactKey) !== -1).toString(),
	        propTypes: _propTypeKeys.filter(
                    p => (p !== exactKey)).join(', ')
            };
        });
    }

    loadWidgetsFromConfig = (result, config, name) => {
	const {providers, signals, utils, widgets} = this.app;
	const {fetched, listening, withProps} = utils;

	for (let k of Object.keys(config.widgets)) {
	    let widget = config.widgets[k];
	    let _widget = widget.component;

	    if (typeof _widget === 'string') {
		_widget = widgets[_widget]
	    }

	    if (widget.props) {
		let _props = {};
		for (let prop of widget.props) {
		    if (prop.indexOf(' as ') !== -1) {
			let [v, k] = prop.split(' as ');
			_props[k] = this.app[v];
		    } else {
			_props[prop] = this.app[prop];
		    }
		}
		for (let [k, v] of Object.entries(widget.extra || {})) {
		    _props[k] = v;
		}
		_widget = withProps(_widget, _props);
	    }
	    if (widget.listens) {
		_widget = listening(
		    signals,
		    widget.listens,
		    'widget:' + k,
		    _widget)
	    }
	    if (widget.fetches) {
		_widget = fetched(
		    providers,
		    widget.fetches,
		    _widget)
	    }
	    if (name) {
		_widget[Symbol.for('plugin')] = name;
	    }
	    _widget[Symbol.for('widget.type')] = 'widget';
	    result[k] = _widget;
	}

	// build configured panels, tabs and tables
	const {
	    'button.configured': ConfiguredButton,
	    'field.configured': ConfiguredField,
	    'form.configured': ConfiguredForm,
	    'table.configured': ConfiguredTable,
	    'navs.configured': ConfiguredNavs,
	    'window.configured': ConfiguredWindow,
	    panels: Panels} = widgets;
	const _configured = {
	    buttonid: [config.buttons || {}, ConfiguredButton],
	    fieldid: [config.fields || {}, ConfiguredField],
	    formid: [config.forms || {}, ConfiguredForm],
	    panelid: [config.panels || {}, Panels],
	    navsid: [config.navs || {}, ConfiguredNavs],
	    tableid: [config.tables || {}, ConfiguredTable],
	    windowid: [config.windows || {}, ConfiguredWindow]}	    

	for (let obid of Object.keys(_configured)) {
	    for (let _id of Object.keys(_configured[obid][0])) {
		let configuration = _configured[obid][0][_id];
		let widgetType = obid.substring(0, obid.length - 2);
		let {props: _props} = configuration;
		let props = {};
		for (let _prop of _props || []) {
		    props[_prop] = this.app[_prop];
		}
		props[obid] = _id
		let _widget = withProps(_configured[obid][1], props);
		if (name) {
		    _widget[Symbol.for('plugin')] = name;
		}
		_widget[Symbol.for('widget.type')] = widgetType;
		// console.log('created widget', _id, widgetType, name, props, _widget, _configured[obid][1]); 
		result[_id] = _widget;
	    }
	}
    }

    _getPropTypes (target) {
	return this._getTarget(target).propTypes || {};
    }

    _getTarget (target) {
	const symWrapped = Symbol.for('wrapped')
	return (
	    target[symWrapped]
		? target[symWrapped]
		: target);
    }

    _getDefaultProps (target) {
	const symProps = Symbol.for('default-props')
	return (
	    target[symProps]
		? Object.keys(target[symProps])
		: []);
    }

    _hasProblems(propTypes, defaultProps) {
        if (Object.keys(propTypes).length === 0) {
            return false;
        }
        defaultProps.forEach(prop => {
            if (Object.keys(propTypes).indexOf(prop) === -1) {
                return true;
            }
        });
        return false;
    }
}
