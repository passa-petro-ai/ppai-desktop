import { FitAddon } from '@xterm/addon-fit';
import { useEffect } from 'react';
import { useXTerm } from 'react-xtermjs';
import { ipcChannels } from '@/config/ipc-channels';

export function FwiExecution() {
	const { instance, ref } = useXTerm();
	const fitAddon = new FitAddon();

	const onData = (data: string) => {
		console.log(`Received Data: ${data}`);
	};

	const onResize = (cols: number, rows: number) => {
		console.log(`Terminal resized to ${cols} columns and ${rows} rows`);
	};

	useEffect(() => {
		instance?.loadAddon(fitAddon);
		const handleResize = () => fitAddon.fit();

		instance?.onData((data) => onData(data));
		instance?.onResize((size) => onResize(size.cols, size.rows));

		window.electron.ipcRenderer.on(ipcChannels.SET_PTY_DATA, (data: string) => {
			instance?.write(data);
		});

		// Handle resize event
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			window.electron.ipcRenderer.removeAllListeners(ipcChannels.SET_PTY_DATA);
		};
	}, [ref, instance]);

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
