// DATA SHOULD ONLY FLOW DOWNWARDS
// We pass data from the main process to the renderer process using IPC
// We also use IPC to update data

// todo: add os here

import { ipcChannels } from '@/config/ipc-channels';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import {
	DEFAULT_KEYBINDS,
	DEFAULT_SETTINGS,
	SettingsType,
} from '@/config/settings';
import { play, preload } from '@/renderer/lib/sounds';
import { AppInfoType } from '@/types/app';
import { CustomAcceleratorsType } from '@/types/keyboard';
import { MenuItemConstructorOptions } from 'electron/renderer';
import { toast } from 'sonner';
import { OpenModalsTrackerType } from '@/main/store';
import { Project } from '@/types/project';

interface GlobalContextType {
	app: Partial<AppInfoType>;
	appMenu: MenuItemConstructorOptions[];
	keybinds: CustomAcceleratorsType;
	message: string;
	messages: string[];
	settings: SettingsType;
	setSettings: (newSettings: Partial<SettingsType>) => void;
	modals: OpenModalsTrackerType;
	openModal: (key: string) => void;
	closeModal: (key: string) => void;
	project: Project | null;
	setProject: (newProject: Partial<Project>) => void;
	setIsLoading: (isLoading: boolean) => void;
	isLoading: boolean;
	plotPath: string;
	setPlotPath: (plotPath: string) => void;
	setIsExecuting: (isExecuting: boolean) => void;
	isExecuting: boolean;
	setIsDomainValid: (isDomainValid: boolean) => void;
	isDomainValid: boolean;
	setIsOperationValid: (isOperationValid: boolean) => void;
	isOperationValid: boolean;
	setIsFrequencyValid: (isFrequencyValid: boolean) => void;
	isFrequencyValid: boolean;
	setIsParallelizationValid: (isParallelizationValid: boolean) => void;
	isParallelizationValid: boolean;
	imageDimensionFilePath: string;
	setImageDimensionFilePath: (imageDimensionPath: string) => void;
}

export const GlobalContext = React.createContext<GlobalContextType>({
	app: {},
	appMenu: [],
	keybinds: DEFAULT_KEYBINDS,
	message: '',
	messages: [],
	settings: DEFAULT_SETTINGS,
	setSettings: () => { },
	modals: [],
	openModal: () => { },
	closeModal: () => { },
	project: null,
	setProject: () => { },
	setIsLoading: () => { },
	isLoading: false,
	plotPath: '',
	setPlotPath: () => { },
	setIsExecuting: () => { },
	isExecuting: false,
	setIsDomainValid: () => { },
	isDomainValid: false,
	setIsOperationValid: () => { },
	isOperationValid: false,
	setIsFrequencyValid: () => { },
	isFrequencyValid: false,
	setIsParallelizationValid: () => { },
	isParallelizationValid: false,
	imageDimensionFilePath: '',
	setImageDimensionFilePath: () => { },
});

export function GlobalContextProvider({
	children,
}: {
	children?: React.ReactNode;
}) {
	const [appInfo, setAppInfo] = React.useState<Partial<AppInfoType>>({});
	const [appMenu, setAppMenu] = React.useState<MenuItemConstructorOptions[]>(
		[],
	);
	const [messages, setMessages] = React.useState<string[]>([]);
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const [isExecuting, setIsExecuting] = React.useState<boolean>(false);

	const [settings, setCurrentSettings] =
		React.useState<SettingsType>(DEFAULT_SETTINGS);

	const [keybinds, setCurrentKeybinds] =
		React.useState<CustomAcceleratorsType>(DEFAULT_KEYBINDS);

	const [modals, setCurrentModals] = React.useState<OpenModalsTrackerType>([]);
	const [project, setCurrentProject] = React.useState<Project | null>(null);
	const [plotPath, setCurrentPlotPath] = React.useState<any>(null);
	const [imageDimensionFilePath, setCurrentImageDimensionFilePath] =
		React.useState<string>('');

	const [isDomainValid, setIsDomainValid] = React.useState<boolean>(false);
	const [isOperationValid, setIsOperationValid] =
		React.useState<boolean>(false);
	const [isFrequencyValid, setIsFrequencyValid] =
		React.useState<boolean>(false);
	const [isParallelizationValid, setIsParallelizationValid] =
		React.useState<boolean>(false);

	useEffect(() => {
		// Create handler for receiving asynchronous messages from the main process
		const synchronizeAppState = async () => {
			window.electron.ipcRenderer
				.invoke(ipcChannels.GET_RENDERER_SYNC)
				.then((res) => {
					const {
						settings: s,
						keybinds: k,
						messages: m,
						appMenu: menu,
						modals: d,
						project: p,
						plotPath: pd,
						imageDimensionFilePath: df,
					} = res;

					setCurrentSettings(s);
					setCurrentKeybinds(k);
					setMessages(m);
					setAppMenu(menu);
					setCurrentModals(d);
					setCurrentProject(p);
					setCurrentPlotPath(pd);
					setCurrentImageDimensionFilePath(df);

					console.log({ res });
				})
				.catch(console.error);
		};

		// Listen for messages from the main process
		window.electron.ipcRenderer.on(ipcChannels.APP_UPDATED, async (data) => {
			await synchronizeAppState();
		});

		// Create notifications using the renderer
		window.electron.ipcRenderer.on(
			ipcChannels.APP_NOTIFICATION,
			({ title, body, action }: any) => {
				toast(title, {
					...(body ? { description: body } : {}),
					...(action ? { action } : {}),
					// action: {
					// 	label: 'Ok',
					// 	onClick: () => {},
					// },
				});

				// Renderer Web Notifications
				// new Notification(title, {
				// 	body,
				// });
			},
		);

		// Get app info: name, version, paths, os - DOES NOT CHANGE
		window.electron.ipcRenderer
			.invoke(ipcChannels.GET_APP_INFO)
			.then((info) => {
				setAppInfo(info);
				return info;
			})
			.then(() => {
				// SOUNDS
				preload();

				// Setup listener to play sounds
				window.electron.ipcRenderer.on(ipcChannels.PLAY_SOUND, (sound: any) => {
					play({ name: sound });
				});
			})
			.catch(console.error);

		// Request initial data when the app loads
		synchronizeAppState();

		// Let the main process know that the renderer is ready
		window.electron.ipcRenderer.send(ipcChannels.RENDERER_READY);

		return () => {
			// Clean up listeners when the component unmounts
			window.electron.ipcRenderer.removeAllListeners(ipcChannels.APP_UPDATED);
			window.electron.ipcRenderer.removeAllListeners(ipcChannels.PLAY_SOUND);
			window.electron.ipcRenderer.removeAllListeners(
				ipcChannels.APP_NOTIFICATION,
			);
			window.electron.ipcRenderer.removeAllListeners(ipcChannels.SET_PTY_DATA);
		};
	}, []);

	// Electron API functions
	const setSettings = useCallback((newSettings: Partial<SettingsType>) => {
		window.electron.setSettings(newSettings);
	}, []);

	const openModal = useCallback((key: string) => {
		window.electron.openModal(key);
	}, []);

	const closeModal = useCallback((key: string) => {
		window.electron.closeModal(key);
	}, []);

	const setProject = useCallback((newProject: Partial<Project>) => {
		window.electron.setProject(newProject);
	}, []);

	const setPlotPath = useCallback((path: any) => {
		window.electron.setPlotPath(path);
	}, []);

	const setImageDimensionFilePath = useCallback((path: string) => {
		window.electron.setImageDimensionFilePath(path);
	}, []);

	const value = useMemo(() => {
		return {
			app: appInfo,
			appMenu,
			keybinds,
			settings,
			setSettings,
			messages,
			message: messages[0] ?? '',
			modals,
			openModal,
			closeModal,
			project,
			setProject,
			setIsLoading,
			isLoading,
			plotPath,
			setPlotPath,
			setIsExecuting,
			isExecuting,
			setIsDomainValid,
			isDomainValid,
			setIsOperationValid,
			isOperationValid,
			setIsFrequencyValid,
			isFrequencyValid,
			setIsParallelizationValid,
			isParallelizationValid,
			imageDimensionFilePath,
			setImageDimensionFilePath,
		};
	}, [
		appInfo,
		appMenu,
		keybinds,
		settings,
		setSettings,
		messages,
		modals,
		openModal,
		closeModal,
		project,
		setProject,
		setIsLoading,
		isLoading,
		plotPath,
		setPlotPath,
		setIsExecuting,
		isExecuting,
		setIsDomainValid,
		isDomainValid,
		setIsOperationValid,
		isOperationValid,
		setIsFrequencyValid,
		isFrequencyValid,
		setIsParallelizationValid,
		isParallelizationValid,
		imageDimensionFilePath,
		setImageDimensionFilePath,
	]);

	return (
		<GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
	);
}

export const useGlobalContext = () => {
	const context = useContext(GlobalContext);

	if (context === undefined)
		throw new Error('useGlobalContext must be used within a GlobalContext');

	return context;
};
