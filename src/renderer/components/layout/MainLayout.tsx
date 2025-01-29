import { Menu } from '@/renderer/components/menu/Menu';

import React from 'react';
import { Outlet } from 'react-router-dom';
import AppVersion from '../footer/AppVersion';
import { Footer } from '../footer/Footer';

// We can't use the ScrollArea here or the scroll will persist between navigations
export function MainLayout({ children }: { children?: React.ReactNode }) {
	return (
		<div className="w-full h-full flex flex-col">
			<Menu className="shrink-0" />
			<div className="border-t border-[#1c1917] grow flex min-h-0">
				<div className="grow min-w-0 overflow-y-auto">
					{children || <Outlet />}
				</div>
			</div>
			<Footer>
				<AppVersion />
			</Footer>
		</div>
	);
}
