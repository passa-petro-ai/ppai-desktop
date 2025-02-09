import { FitAddon } from '@xterm/addon-fit';
import { useEffect, useState } from 'react';
import { useXTerm } from 'react-xtermjs';
import { ipcChannels } from '@/config/ipc-channels';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { number } from 'zod';
import { useGlobalContext } from '@/renderer/context/global-context';
import { toast } from 'sonner';

export function FwiExecution() {
	const { setIsExecuting, isExecuting } = useGlobalContext();
	const { instance, ref } = useXTerm();

	const [iterationPercentage, setIterationPercentage] = useState<number>(0);
	const [iterationProgress, setIterationProgress] = useState<string>('');

	const [frequencyGroupPercentage, setFrequencyGroupPercentage] =
		useState<number>(0);
	const [frequencyGroupProgress, setFrequencyGroupProgress] =
		useState<string>('');

	const fitAddon = new FitAddon();

	const processOutput = (data: string) => {
		const iteration = 'Subdomain';
		const frequencyGroup = 'Frequency group';

		const getOutputValue = () => {
			const output = data.split('	');
			const assumedFraction = output.length > 1 ? output[1] : null;
			if (!assumedFraction) return;
			const fraction = assumedFraction?.includes('/');
			if (!fraction) return;

			const split = assumedFraction.split('/');
			const result = parseInt(split[0], 10) / parseInt(split[1], 10);

			if (result > 0) {
				if (data.includes(iteration))
					setIterationProgress(
						`${parseInt(split[0], 10)}/${parseInt(split[1], 10)}`,
					);
				if (data.includes(frequencyGroup))
					setFrequencyGroupProgress(
						`${parseInt(split[0], 10)}/${parseInt(split[1], 10)}`,
					);
			}
			return result;
		};

		const outputValue = getOutputValue();
		if (!outputValue) return;
		if (typeof outputValue !== 'number') return;

		if (data.includes(iteration)) setIterationPercentage(outputValue * 100);
		if (data.includes(frequencyGroup))
			setFrequencyGroupPercentage(outputValue * 100);
	};

	useEffect(() => {
		instance?.loadAddon(fitAddon);
		const handleResize = () => fitAddon.fit();

		window.electron.ipcRenderer.on(ipcChannels.SET_PTY_DATA, (data: string) => {
			instance?.write(data);
			processOutput(data);

			if (data.toLowerCase().includes('finalized')) {
				setIsExecuting(false);
				toast.success('Processing have finalized.');
			}
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
					<span className="font-mono">
						{iterationPercentage.toFixed(2)}% (
						{iterationProgress ? `${iterationProgress.trim()}` : 'Pending'})
					</span>
					<Progress value={iterationPercentage} />
				</div>
				<div className="space-y-2">
					<p className="text-xs text-muted-foreground">Frequency Group</p>
					<span className="font-mono">
						{frequencyGroupPercentage.toFixed(2)}% (
						{frequencyGroupProgress
							? `${frequencyGroupProgress.trim()}`
							: 'Pending'}
						)
					</span>
					<Progress value={frequencyGroupPercentage} />
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
