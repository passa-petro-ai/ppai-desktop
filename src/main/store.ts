import { CustomAcceleratorsType } from '@/types/keyboard';
import Store from 'electron-store';
import {
	DEFAULT_KEYBINDS,
	DEFAULT_SETTINGS,
	SettingsType,
} from '../config/settings';
import { Project } from '@/types/project';

export type AppMessageType = string;

export type AppMessageLogType = AppMessageType[];

export type OpenModalsType = string;

export type OpenModalsTrackerType = OpenModalsType[];

export interface StoreType {
	settings: SettingsType;
	appMessageLog: AppMessageLogType; // Public-facing console.log()
	keybinds: CustomAcceleratorsType; // Custom keybinds/accelerators/global shortcuts
	modals: OpenModalsTrackerType;
	project: Project;
}

const schema: Store.Schema<StoreType> = {
	appMessageLog: {
		type: 'array',
		default: [],
	},
	keybinds: {
		type: 'object',
		properties: {
			quit: {
				type: 'string',
			},
			reset: {
				type: 'string',
			},
		},
		default: DEFAULT_KEYBINDS,
	},
	settings: {
		type: 'object',
		properties: {
			allowAnalytics: {
				type: 'boolean',
			},
			allowAutoUpdate: {
				type: 'boolean',
			},
			allowSounds: {
				type: 'boolean',
			},
			allowNotifications: {
				type: 'boolean',
			},
			notificationType: {
				type: 'string',
				enum: ['system', 'app', 'all'],
			},
			showDockIcon: {
				type: 'boolean',
			},
			showTrayIcon: {
				type: 'boolean',
			},
			quitOnWindowClose: {
				type: 'boolean',
			},
			theme: {
				type: 'string',
				enum: ['system', 'light', 'dark'],
			},
		},
		default: DEFAULT_SETTINGS,
	},
	project: {
		type: 'object',
		properties: {
			name: {
				type: 'string',
			},
			segyModelFile: {
				type: 'string',
			},
			segyDataFile: {
				type: 'string',
			},
			shotKeyword: {
				type: 'string',
			},
			paths: {
				type: 'array',
				default: [],
			},
		},
	},
	modals: {
		type: 'array',
		default: [],
	},
};

const store = new Store<StoreType>({ schema });

export default store;
