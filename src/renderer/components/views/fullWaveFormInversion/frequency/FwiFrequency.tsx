import { useGlobalContext } from '@/renderer/context/global-context';

export function FwiFrequency() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Frequency</h3>
				<p className="text-sm text-muted-foreground">Configure Frequencies</p>
			</div>
		</div>
	);
}
