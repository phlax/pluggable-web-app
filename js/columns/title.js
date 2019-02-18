
import BaseColumn from './base';


export default class TitleColumn extends BaseColumn {
    name = 'title';
    id = 'title';
    _onClick = null;
    l10n = 'titleColumnTitle';

    Cell = (data) => {
	const {l10n} = this.props;
	return l10n[data.original.title];
    }
}
