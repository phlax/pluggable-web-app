

export default class Setting {

    constructor (setting, l10n) {
	this.setting = setting;
	this.l10n = l10n;
    }

    set (v) {
	this.setting.value = v	
    }
}
