import { FitAddon } from '@xterm/addon-fit';
import { useEffect } from 'react';
import { useXTerm } from 'react-xtermjs';
import { ipcChannels } from '@/config/ipc-channels';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export function FwiExecution() {
	const { instance, ref } = useXTerm();
	const fitAddon = new FitAddon();

	useEffect(() => {
		instance?.loadAddon(fitAddon);
		const handleResize = () => fitAddon.fit();

		window.electron.ipcRenderer.on(ipcChannels.SET_PTY_DATA, (data: string) => {
			instance?.write(data);
		});

		// Handle resize event
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			window.electron.ipcRenderer.removeAllListeners(ipcChannels.SET_PTY_DATA);
		};
	}, [ref, instance, fitAddon]);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Full Wave Inversion</h3>
			</div>
			<div className="grid grid-cols-2 gap-6">
				<div className="space-y-2">
					<p className="text-xs text-muted-foreground">Iteration</p>
					<span className="font-mono">20% (20/100)</span>
					<Progress value={20} />
				</div>
				<div className="space-y-2">
					<p className="text-xs text-muted-foreground">Frequency Group</p>
					<span className="font-mono">20% (2/10)</span>
					<Progress value={20} />
				</div>
			</div>
			<Separator />
			<div>
				<h3 className="text-lg font-medium">Logs</h3>
			</div>
			<div ref={ref} style={{ height: '100%', width: '100%' }} />
		</div>
	);
}
