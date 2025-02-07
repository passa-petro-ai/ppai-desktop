import { Menu } from '@/renderer/components/menu/Menu';

import React from 'react';
import { Outlet } from 'react-router-dom';
import AppVersion from '../footer/AppVersion';
import { Footer } from '../footer/Footer';
import { useGlobalContext } from '@/renderer/context/global-context';
import { Loader2 } from 'lucide-react';

// We can't use the ScrollArea here or the scroll will persist between navigations
export function MainLayout({ children }: { children?: React.ReactNode }) {
	const { isLoading, setIsLoading } = useGlobalContext();
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
			{isLoading && (
				<div className="w-full h-full fixed top-0 left-0 bg-black opacity-75 z-50">
					<div className="flex justify-center items-center mt-[50vh]">
						<Loader2 className="animate-spin" />
					</div>
				</div>
			)}
		</div>
	);
}
