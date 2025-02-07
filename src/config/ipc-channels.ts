// Whitelist channels for IPC
export type Channels = string;

// Main -> Renderer
const APP_UPDATED = 'app-updated';
const APP_NOTIFICATION = 'app-notification'; // to display a notification using the OS notification system

const PRELOAD_SOUNDS = 'preload-sounds';
const PLAY_SOUND = 'play-sound';

// Renderer -> Main
const GET_APP_INFO = 'get-app-info';
const GET_APP_PATHS = 'get-app-paths';
const GET_RENDERER_SYNC = 'get-renderer-sync';
const SET_KEYBIND = 'set-keybind';
const SET_SETTINGS = 'set-settings';
const RENDERER_READY = 'renderer-ready';
const TRIGGER_APP_MENU_ITEM_BY_ID = 'trigger-app-menu-item-by-id';
const OPEN_URL = 'open-url';
const OPEN_MODAL_BY_ID = 'open-modal';
const CLOSE_MODAL_BY_ID = 'close-modal';
const CLOSE_MODALS = 'close-modals';
const CHECK_FILE_DIRECTORY = 'check-file-directory';
const CREATE_FILE_DIRECTORY = 'create-file-directory';
const FIND_FILE_DIRECTORY = 'find-file-directory';
const CREATE_FILE = 'create-file';
const FIND_FILE = 'find-file';
const READ_FILE = 'read-file';
const SET_PROJECT = 'set-project';
const SET_PLOT_DATA = 'set-plot-data';
const OPEN_PLOT_WINDOW = 'open-plot-window';

export const ipcChannels = {
	// main -> renderer
	APP_NOTIFICATION,
	APP_UPDATED,
	PRELOAD_SOUNDS,
	PLAY_SOUND,

	// renderer -> main
	RENDERER_READY,
	GET_RENDERER_SYNC,
	GET_APP_INFO,
	GET_APP_PATHS,
	SET_KEYBIND,
	SET_SETTINGS,
	TRIGGER_APP_MENU_ITEM_BY_ID,
	OPEN_URL,
	OPEN_MODAL_BY_ID,
	CLOSE_MODAL_BY_ID,
	CLOSE_MODALS,
	CHECK_FILE_DIRECTORY,
	CREATE_FILE_DIRECTORY,
	FIND_FILE_DIRECTORY,
	READ_FILE,
	CREATE_FILE,
	FIND_FILE,
	SET_PROJECT,
	SET_PLOT_PATH: SET_PLOT_DATA,
	OPEN_PLOT_WINDOW,
};
