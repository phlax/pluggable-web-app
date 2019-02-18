
import uuidv4 from 'uuid/v4'

import {
    Batch, Iterator, capitalize, strip,
    syncify, truncate} from '@pluggable/app/utils';
import {L10nManager, SettingsManager} from '@pluggable/app/managers';

import {
    configured, fetched, listening,
    provided, withProps} from './utils';
import {
    NameColumn, UserColumn, AddressColumn, ErrorColumn,
    CreatedColumn, ImageColumn, HashColumn, ModifiedColumn, EmailColumn,
    UsersColumn, ParamsColumn, SizeColumn,
    TitleColumn, TextColumn} from './columns';
import {
    BooleanSetting, IntegerSetting, ListSetting,
    StringSetting} from './settings';
import {
    AuthManager, CSSManager, Jobs,
    ThemesManager} from './managers';


export const appConfig = {};


appConfig.managers = {
    jobs: Jobs,
    css: CSSManager,
    l10n: L10nManager,
    themes: ThemesManager,
    settings: SettingsManager,
    auth: AuthManager}


appConfig.columns = {
    name: NameColumn,
    user: UserColumn,
    users: UsersColumn,
    email: EmailColumn,
    address: AddressColumn,
    created: CreatedColumn,
    image: ImageColumn,
    modified: ModifiedColumn,
    params: ParamsColumn,
    error: ErrorColumn,
    title: TitleColumn,
    size: SizeColumn,
    text: TextColumn,
    hash: HashColumn};


appConfig.settings = {
    'core.worker.simultaneous_requests': {
	type: IntegerSetting,
        'default': 10},
    'core.logger.buffer': {
	type: IntegerSetting,
        'default': 1000},
    'core.data.batch_size': {
	type: IntegerSetting,
        'default': 2000},
    'core.console.max_lines': {
	type: IntegerSetting,
        'default': 1000},
    'core.ui.theme': {
	type: StringSetting,
        'default': 'core.default'},
    'core.ui.compact_pagination': {
	type: BooleanSetting,
	default: false},
    'core.ui.pagination_steps': {
	type: ListSetting,
	children: IntegerSetting,
        'default': [5, 10, 20, 25, 50, 100]},
    'core.ui.compact_pagination_default_size': {
	type: IntegerSetting,
        'default': 5},
    'core.ui.pagination_default_size': {
	type: IntegerSetting,
        'default': 10}};

appConfig.utils = {
    configured,
    listening,
    fetched,
    provided,
    batch: Batch,
    iterator: Iterator,
    capitalize,
    strip,
    truncate,
    syncify,
    uuidv4,
    withProps,
    localStorage: window.localStorage};
