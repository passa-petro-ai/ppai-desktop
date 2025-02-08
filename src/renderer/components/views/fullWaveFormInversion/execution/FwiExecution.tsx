import { FitAddon } from '@xterm/addon-fit';
import { useEffect } from 'react';
import { useXTerm } from 'react-xtermjs';
import { ipcChannels } from '@/config/ipc-channels';

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
				<h3 className="text-lg font-medium">Execution</h3>
				<p className="text-sm text-muted-foreground">Terminal View</p>
			</div>
			<div ref={ref} style={{ height: '100%', width: '100%' }} />
		</div>
	);
}
