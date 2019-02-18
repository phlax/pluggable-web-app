
import React from 'react';

import Setting from './base';


export default class ListSetting extends Setting {
    name = "List"

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
        const ListEdit = this.props.widgets['form.field.list'];
        return (
            <ListEdit
              setting={this.setting}
              editValue={editValue}
              onChange={onChange}
              onSubmit={onSubmit} />);
    }
}
