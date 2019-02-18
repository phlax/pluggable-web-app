
import BaseColumn from './base';


export default class ParamsColumn extends BaseColumn {
    name = 'params';
    id = 'params';
    _onClick = null;
    l10n = 'titleColumnParams';

    Cell = (data) => {
	return JSON.stringify(data.original.params);
    }
}
