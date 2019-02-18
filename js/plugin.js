
import {Plugin as BasePlugin} from '@pluggable/app';


export default class Plugin extends BasePlugin {

    actions = async (result) => {
	const {actions} = this.appConfig;
	Object.keys(actions || {}).forEach(k => {
	    result[k] = new actions[k](this.app)
	});
    }        

    buttons = async (result) => {
	const {buttons} = this.appConfig;
	for (let button of Object.keys(buttons || {})) {
            result[button] = buttons[button];
	}
	return result
    }

    columns = async (result) => {
	const {l10n, media, utils} = this.app;
	const {columns} = this.appConfig;
	const {withProps} = utils;
	for (let column of Object.keys(columns || {})) {
	    result[column] = withProps(
		columns[column],
		{l10n, media});
	}
	return result
    }

    exporters = async (result) => {
	const {exporters} = this.appConfig;
	return Object.assign(result, exporters || {});
    }

    fields = async (result) => {
	const {fields} = this.appConfig;
	return Object.assign(result, fields || {});
    }

    forms = async (result) => {
	const {forms} = this.appConfig;
	return Object.assign(result, forms || {});
    }

    media = async (result) => {
	const {media} = this.appConfig;
	for (let item of Object.values(media || {})) {
	    item[Symbol.for('plugin')] = this.name;
	}
	return Object.assign(result, media || {});
    }

    oauth = async (result) => {
	const {oauth} = this.appConfig;
	Object.keys(oauth || {}).forEach(k => {
	    result[k] = new oauth[k](this.app)
	});
    }    
    
    panels = async (result) => {
	const {panels} = this.appConfig;
	return Object.assign(result, panels || {});
    }

    themes = async (result) => {
	const {themes} = this.appConfig;
	return Object.assign(result, themes || {});
    }

    navs = async (result) => {
	const {navs} = this.appConfig;
	for (let [tabid, tablist] of Object.entries(navs || {})) {
	    if (Object.keys(result).indexOf(tabid) === -1) {
		result[tabid] = tablist;
	    } else {
		result[tabid].navs = result[tabid].navs.concat(tablist.navs)
	    }
	}
    }

    tables = async (result) => {
	const {tables} = this.appConfig;
	return Object.assign(result, tables || {});
    }

    validators = async (result) => {
	const {validators} = this.appConfig;
	Object.keys(validators || {}).forEach(k => {
	    result[k] = new validators[k](this.app)
	});
    }    

    windows = async (result) => {
	const {windows} = this.appConfig;
	return Object.assign(result, windows || {});
    }
    
    get widgetConfig () {
	const {
	    fields={}, forms={}, buttons={},
	    panels={}, navs={}, tables={},
	    widgets={}, windows={}} = this.appConfig;
	return {
	    buttons, fields, forms,
	    panels, navs, tables, windows, widgets}
    }

    widgets = (result) => {
	const {manager} = this.app;
	const {loadWidgetsFromConfig} = manager['widgets'];
	loadWidgetsFromConfig(result, this.widgetConfig, this.name);
    }
}
