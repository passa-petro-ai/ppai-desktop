import { getTrace } from '@/main/plotter';
import { useGlobalContext } from '@/renderer/context/global-context';
import '@/renderer/styles/globals.scss';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Plotly from 'react-plotly.js';

function ChildApp() {
	const { plotPath } = useGlobalContext();

	const [data, setData] = useState<any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const loadVelocityModelTrace = async () => {
		setIsLoading(true);
		const modelInputFilePath = plotPath;

		const trace = await getTrace(modelInputFilePath);
		setData(trace);
		console.log({ trace });
		setIsLoading(false);
	};

	useEffect(() => {
		if (plotPath) loadVelocityModelTrace();
	}, [plotPath]);

	return (
		<div className="w-[100vw] h-[100vh]">
			{(!plotPath || isLoading) && <Loader2 className="animate-spin" />}
			{plotPath && (
				<Plotly
					layout={{
						responsive: true,
						autosize: true,
						title: { text: plotPath },
					}}
					data={[{ ...data }]}
					style={{ width: '100%', height: '100%' }}
					useResizeHandler
				/>
			)}
		</div>
	);
}

export default ChildApp;
