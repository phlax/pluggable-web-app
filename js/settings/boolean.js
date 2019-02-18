
import React from 'react';

import Setting from './base';


export default class BooleanSetting extends Setting {
    name = "Integer"

    get key () {
        return this.setting.key;
    }

    get _rev () {
        return this.setting._rev;
    }

    get value () {
        return this.setting.value;
    }

    get custom () {
        return this.setting.custom;
    }

    renderDisplay (value) {
	return (
            <div>{value.toString()}</div>
        );
    }

    renderEdit (editValue, onChange, onSubmit) {
	return (
            <form>
              <input
                onChange={onChange}
                type="checkbox"
                value={editValue} />
              <button
                onClick={onSubmit}>
		{this.l10n['buttonUpdateLabel']}
              </button>
            </form>);
    }
}
