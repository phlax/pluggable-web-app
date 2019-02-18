
import React from 'react';

import BaseColumn from './base';


export default class ImageColumn extends BaseColumn {
    name = 'image';
    id = 'image';
    _onClick = null;
    l10n = 'titleColumnImage';

    Cell = (data) => {
	const {widgets} = this.props;
	const {media: Media} = widgets;

	if (!data.original.image.src) {
	    return '';
	}
	
	return (
	    <Media
              className="table-thumbnail"              
              src={data.original.image.src} />);
    }
}
