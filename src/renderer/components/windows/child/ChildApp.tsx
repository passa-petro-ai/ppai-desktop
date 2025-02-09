import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { DEFAULT_PLOTLY_COLORSCALE } from '@/config/config';
import { readFile } from '@/main/files';
import { getTrace } from '@/main/plotter';
import { useGlobalContext } from '@/renderer/context/global-context';
import '@/renderer/styles/globals.scss';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Plotly from 'react-plotly.js';
import { toast } from 'sonner';

const Colorscale = [
	'Blackbody',
	'Bluered',
	'Blues',
	'Cividis',
	'Earth',
	'Electric',
	'Greens',
	'Greys',
	'Hot',
	'Jet',
	'Picnic',
	'Portland',
	'Rainbow',
	'RdBu',
	'Reds',
	'Viridis',
	'YlGnBu',
	'YlOrRd',
];

function ChildApp() {
	const { plotPath, imageDimensionFilePath } = useGlobalContext();

	const [data, setData] = useState<any>(null);
	const [colorscale, setColorscale] = useState<string>(
		DEFAULT_PLOTLY_COLORSCALE,
	);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const getImageDimension = async (path: string) => {
		const imageDimensionContent: string | null = await readFile(path, 'utf8');

		if (!imageDimensionContent) {
			toast.error('Could not read Image Dimension file.');
			return null;
		}

		try {
			const values = JSON.parse(imageDimensionContent);
			return values;
		} catch {
			toast.error('The Image Dimension File file is possibly malformed.');
			return null;
		}
	};

	const loadVelocityModelTrace = async (
		color: string = DEFAULT_PLOTLY_COLORSCALE,
	) => {
		setIsLoading(true);
		const modelInputFilePath = plotPath;
		const imageDimension = await getImageDimension(imageDimensionFilePath);
		const trace = await getTrace(modelInputFilePath, imageDimension);
		setData({ ...trace, colorscale: color });
		setIsLoading(false);
	};

	useEffect(() => {
		if (plotPath) loadVelocityModelTrace();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [plotPath, imageDimensionFilePath]);

	return (
		<div className="w-[100vw] h-[100vh]">
			{(!plotPath || isLoading) && (
				<div className="w-full h-full fixed top-0 left-0 bg-black opacity-75 z-50">
					<div className="flex justify-center items-center mt-[50vh]">
						<Loader2 className="animate-spin" />
					</div>
				</div>
			)}
			{plotPath && (
				<Plotly
					layout={{
						responsive: true,
						autosize: true,
						yaxis: {
							autorange: 'reversed',
						},
					}}
					data={[{ ...data }]}
					style={{ width: '100%', height: 'calc(100% - (69px))' }}
					useResizeHandler
				/>
			)}
			<div className="flex gap-2 space-x-4 p-4 border-t bg-background w-full">
				<div className="flex items-center space-x-2 min-w-40">
					<Label htmlFor="colorscale">Colorscale</Label>
					<Select
						defaultValue={DEFAULT_PLOTLY_COLORSCALE}
						onValueChange={(value) => {
							setColorscale(value);
							loadVelocityModelTrace(value);
						}}
						value={colorscale}
						name="colorscale"
						disabled={isLoading}
					>
						<SelectTrigger className="col-span-5">
							<SelectValue placeholder="Select a Colorscale" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Colorscale</SelectLabel>
								{Colorscale.map((c) => (
									<SelectItem value={c}>{c}</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}

export default ChildApp;
