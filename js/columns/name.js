
import React from 'react';

import BaseColumn from './base';


export default class NameColumn extends BaseColumn {
    name = 'name';
    id = '_id';
    _accessor = '_id';
    _onClick = null;
    l10n = 'titleName';

    Cell = (data) => {
        return (
            <a href="/#"
               onClick={this.onClick}
               name={this.accessor(data.original)}>
	      {this.accessor(data.original)}
            </a>);
    }
}
