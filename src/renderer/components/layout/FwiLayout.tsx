import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { checkFileDirectory, readFile } from '@/main/files';
import { ScrollArea } from '@/renderer/components/ui/ScrollPane';
import { SidebarNav } from '@/renderer/components/ui/SidebarNav';
import { fwiNavItems, nav } from '@/renderer/config/nav';
import { useGlobalContext } from '@/renderer/context/global-context';
import { Parallelization } from '@/types/fwi/parallelization';
import { getBaseProjectPath } from '@/utils/getBaseProjectPath';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface FwiLayoutProps {
	children?: React.ReactNode;
}

export default function FwiLayout({ children }: FwiLayoutProps) {
	const { pathname: location } = useLocation(); // We use this to reset the scroll position when the location changes
	const { project, isExecuting, setIsExecuting } = useGlobalContext();
	const [isAutoRestart, setIsAutoRestart] = useState<boolean>(false);

	const onExecute = async () => {
		console.log('Executing');
		if (isExecuting) return;

		const parallelizationValues = await fetchParallelizationValues();

		if (!parallelizationValues) {
			toast.error('The configuration file is possibly malformed.');
			return;
		}

		window.electron.spawnPtyProcess();
		// window.electron.runPtyCommand('ping 192.168.0.1\r');

		const npValue =
			parallelizationValues?.numberOfComputingNodes *
			parallelizationValues?.numberOfCoresPerComputingNode;

		const ppnValue = parallelizationValues?.numberOfCoresPerComputingNode;
		const command = `mpiexec –np ${npValue} –ppn ${ppnValue} AcousticFWI2D.e\r`;

		window.electron.runPtyCommand(command);
		setIsExecuting(true);
	};

	const onCancel = () => {
		window.electron.terminatePtyProcess();
		setIsExecuting(false);
	};

	const fetchParallelizationValues = async () => {
		const FILE_NAME = 'parallelization.json';

		if (project == null || !project.name) {
			toast.error('Project could not be found.');
			return;
		}

		const baseProjectPath = getBaseProjectPath(project?.name);
		const path = `${baseProjectPath}/${FILE_NAME}`;

		const isExisting = await checkFileDirectory(path);
		if (!isExisting) {
			toast.error("Please configure Parallelization values.");
		}

		const content: string = await readFile(path);

		if (!content) {
			toast.error('There was an error loading configuration file.');
		}

		try {
			const values: Parallelization = JSON.parse(content);
			console.log({ values })
			return values;
		} catch {
			toast.error('The configuration file is possibly malformed.');
			return null;
		}
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
