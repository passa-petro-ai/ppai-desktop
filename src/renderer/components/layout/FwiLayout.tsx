import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/renderer/components/ui/ScrollPane';
import { SidebarNav } from '@/renderer/components/ui/SidebarNav';
import { fwiNavItems, nav } from '@/renderer/config/nav';
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

interface FwiLayoutProps {
	children?: React.ReactNode;
}

export default function FwiLayout({ children }: FwiLayoutProps) {
	const { pathname: location } = useLocation(); // We use this to reset the scroll position when the location changes

	const [isAutoRestart, setIsAutoRestart] = useState<boolean>(false);
	const [iterations, setIterations] = useState<number>(1);
	const [frequencyGroup, setFrequencyGroup] = useState<number>(1);

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
					<div className="flex items-center space-x-2 w-1/4">
						<Label htmlFor="isAutoRestart">Auto-Restart</Label>
						<Checkbox
							id="isAutoRestart"
							name="isAutoRestart"
							checked={isAutoRestart}
							onCheckedChange={() => setIsAutoRestart(!isAutoRestart)}
						/>
					</div>
					<Separator orientation="vertical" />
					<div className="flex items-center space-x-2">
						<Label htmlFor="iterations">Iterations</Label>
						<Input
							className="w-24"
							id="iterations"
							name="iterations"
							type="number"
							value={iterations}
							onChange={(e) => setIterations(Number(e.target.value))}
						/>
					</div>
					<Separator orientation="vertical" />
					<div className="flex items-center space-x-2">
						<Label htmlFor="iterations">Frequency Group</Label>
						<Input
							className="w-24"
							id="iterations"
							name="iterations"
							type="number"
							value={frequencyGroup}
							onChange={(e) => setFrequencyGroup(Number(e.target.value))}
						/>
					</div>
					<div className="flex flex-row-reverse w-full gap-2">
						<Button variant="secondary">
							<Link to={nav.home.href}>Back</Link>
						</Button>
						<Button variant="outline">Run</Button>
					</div>
				</div>
			</div>
		</>
	);
}
