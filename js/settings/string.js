
import React from 'react';

import Setting from './base';


export default class StringSetting extends Setting {
    name = "String"

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
        const StringEdit = this.props.widgets['form.field.string'];
        return (
            <StringEdit
              setting={this.setting}
              editValue={editValue}
              onChange={onChange}
              onSubmit={onSubmit} />);
    }
}
