import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/renderer/components/ui/ScrollPane';
import { SidebarNav } from '@/renderer/components/ui/SidebarNav';
import { fwiNavItems, nav } from '@/renderer/config/nav';
import { useGlobalContext } from '@/renderer/context/global-context';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

interface FwiLayoutProps {
	children?: React.ReactNode;
}

export default function FwiLayout({ children }: FwiLayoutProps) {
	const { pathname: location } = useLocation(); // We use this to reset the scroll position when the location changes
	const { isExecuting, setIsExecuting } = useGlobalContext();
	const [isAutoRestart, setIsAutoRestart] = useState<boolean>(false);

	const onExecute = () => {
		if (isExecuting) return;
		window.electron.spawnPtyProcess();
		window.electron.runPtyCommand('ping 192.168.0.1\r');
		setIsExecuting(true);
	};

	const onCancel = () => {
		window.electron.terminatePtyProcess();
		setIsExecuting(false);
	};

	return (
		<>
			<div className="h-full flex flex-col justify-stretch">
				<div className="space-y-0.5 p-4">
					<h2 className="text-xl font-bold tracking-tight">FWI</h2>
					<p className="text-sm text-muted-foreground">
						Full Waveform Inversion
					</p>
				</div>
				<Separator />
				<div className="flex h-full min-h-0">
					<ScrollArea className="bg-secondary min-w-20 md:w-1/5 shadow-inner">
						<SidebarNav
							items={[
								...fwiNavItems,
								// { title: 'Back', href: '/', icon: ResetIcon },
							]}
						/>
					</ScrollArea>
					<Separator orientation="vertical" />
					<ScrollArea className="flex-1" key={location}>
						<div className="px-4 py-4 pb-10">{children || <Outlet />}</div>
					</ScrollArea>
				</div>
				<div className="flex gap-2 space-x-4 p-4 border-t bg-background w-full">
					<div className="flex items-center space-x-2 min-w-32">
						<Label htmlFor="isAutoRestart">Auto-Restart</Label>
						<Checkbox
							id="isAutoRestart"
							name="isAutoRestart"
							checked={isAutoRestart}
							onCheckedChange={() => setIsAutoRestart(!isAutoRestart)}
						/>
					</div>
					<div className="flex flex-row-reverse w-full gap-2">
						<Button variant="secondary">
							<Link to={nav.home.href}>Back</Link>
						</Button>
						{!isExecuting && (
							<Button variant="outline" onClick={onExecute}>
								Execute
							</Button>
						)}
						{isExecuting && (
							<Button variant="destructive" onClick={onCancel}>
								Cancel
							</Button>
						)}
						{isExecuting && (
							<div className="flex items-center space-x-2">
								<Loader2 size={14} className="animate-spin mr-2 inline" />
								Running
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
