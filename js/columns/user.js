
import BaseColumn from './base';


export default class UserColumn extends BaseColumn {
    name = 'user';
    id = 'user';
    _accessor = 'username';    
    _onClick = null;
    l10n = 'titleUser';

}
