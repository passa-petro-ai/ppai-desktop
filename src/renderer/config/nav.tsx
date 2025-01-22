import { SettingsJson } from '@/renderer/components/views/settings/SettingsJson';
import { SettingsAbout } from '@/renderer/components/views/settings/about/SettingsAbout';
import { SettingsAppearance } from '@/renderer/components/views/settings/appearance/SettingsAppearance';
import {
	BellIcon,
	BlendingModeIcon,
	GearIcon,
	IdCardIcon,
	ImageIcon,
	KeyboardIcon,
	ViewGridIcon,
	TargetIcon,
	BarChartIcon,
	MixerHorizontalIcon,
} from '@radix-ui/react-icons';

import { SettingsApplication } from '@/renderer/components/views/settings/general/SettingsApplication';
import { SettingsKeyboard } from '@/renderer/components/views/settings/keyboard/SettingsKeyboard';
import { SettingsNotifications } from '@/renderer/components/views/settings/notifications/SettingsNotifications';
import { FwiDomain } from '@/renderer/components/views/fullWaveFormInversion/domain/FwiDomain';
import { FwiOperation } from '@/renderer/components/views/fullWaveFormInversion/operation/FwiOperation';
import { FwiFrequency } from '@/renderer/components/views/fullWaveFormInversion/frequency/FwiFrequency';
import { FwiParalellization } from '../components/views/fullWaveFormInversion/parallelization/FwiParallelization';

export const nav = {
	home: {
		title: 'Home',
		href: '/',
	},
	settings: {
		title: 'Settings',
		href: '/settings',
	},
	fwi: {
		title: 'FWI',
		href: '/fwi',
	},
};

export const settingsNavItems = [
	{
		title: 'General',
		href: 'general',
		element: <SettingsApplication />,
		icon: GearIcon,
		index: true,
	},
	{
		title: 'Appearance',
		href: 'appearance',
		element: <SettingsAppearance />,
		icon: BlendingModeIcon,
	},

	{
		title: 'Notifications',
		href: 'notifications',
		element: <SettingsNotifications />,
		icon: BellIcon,
	},
	{
		title: 'Display',
		href: 'display',
		element: <SettingsJson />,
		icon: ImageIcon,
	},
	{
		title: 'Keyboard',
		href: 'keyboard',
		element: <SettingsKeyboard />,
		icon: KeyboardIcon,
	},
	{
		title: 'About',
		href: 'about',
		element: <SettingsAbout />,
		icon: IdCardIcon,
	},
];

export const fwiNavItems = [
	{
		title: 'Domain',
		href: 'domain',
		element: <FwiDomain />,
		icon: ViewGridIcon,
		index: true,
	},
	{
		title: 'Operation',
		href: 'operation',
		element: <FwiOperation />,
		icon: TargetIcon,
	},

	{
		title: 'Frequency',
		href: 'frequency',
		element: <FwiFrequency />,
		icon: BarChartIcon,
	},
	{
		title: 'Parallelization',
		href: 'parallelization',
		element: <FwiParalellization />,
		icon: MixerHorizontalIcon,
	},
];
