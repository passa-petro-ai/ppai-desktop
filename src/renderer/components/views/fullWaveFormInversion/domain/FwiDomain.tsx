import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Separator } from '@/components/ui/separator';
import { useGlobalContext } from '@/renderer/context/global-context';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { refinePathValidator } from '@/utils/refinePathValidator';
import {
	createFile,
	readFile,
	findFile,
	checkFileDirectory,
	createFileDirectory,
	findFileDirectory,
} from '@/main/files';
import { getBaseProjectPath } from '@/utils/getBaseProjectPath';
import { Domain } from '@/types/fwi/domain';

import { ImageDimension, render } from '@/main/plotter';
import { Loader2 } from 'lucide-react';
import { PROJECT_PROTOCOL } from '@/config/config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

const FormSchema = z.object({
	csgfOutDirectory: z.string().trim().refine(refinePathValidator, {
		message: 'Invalid Path',
	}),
	geomDirectory: z.string().trim().refine(refinePathValidator, {
		message: 'Invalid Path',
	}),
	imageDimensionFile: z.string().trim().refine(refinePathValidator, {
		message: 'Invalid Path',
	}),
	initialVpFile: z.string().trim().refine(refinePathValidator, {
		message: 'Invalid Path',
	}),
	initialDensityFile: z.string().trim().refine(refinePathValidator, {
		message: 'Invalid Path',
	}),
	numberOfSources: z.coerce.number().nonnegative().optional(),
	minimumOffset: z.coerce.number().nonnegative().optional(),
	maximumOffset: z.coerce.number().nonnegative().optional(),
	minimumSx: z.coerce.number().nonnegative().optional(),
	minimumSy: z.coerce.number().nonnegative().optional(),
	maximumSx: z.coerce.number().nonnegative().optional(),
	maximumSy: z.coerce.number().nonnegative().optional(),
	numberOfReceivers: z.coerce.number().nonnegative().optional(),
});

const DEFAULTS: Domain = {
	csgfOutDirectory: '',
	geomDirectory: '',
	imageDimensionFile: '',
	initialVpFile: '',
	initialDensityFile: '',
	numberOfSources: 0,
	minimumOffset: 0,
	maximumOffset: 0,
	minimumSx: 0,
	minimumSy: 0,
	maximumSx: 0,
	maximumSy: 0,
	numberOfReceivers: 0,
};

const FILE_NAME = 'domain.json';
export function FwiDomain() {
	const {
		project,
		setIsLoading,
		setPlotPath,
		setImageDimensionFilePath,
		imageDimensionFilePath,
	} = useGlobalContext();

	const [domainValues, setDomainValues] = useState<Domain>(DEFAULTS);

	const [sourceValues, setSourceValues] = useState<string[]>([]);
	const [receiverValues, setReceiverValues] = useState<string[]>([]);

	const [velocityModelOutput, setVelocityModelOutput] = useState<string | null>(
		null,
	);
	const [densityModelOutput, setDencityModelOutput] = useState<string | null>(
		null,
	);

	const [isVelocityModelRendering, setIsVelocityModelRendering] =
		useState<boolean>(false);
	const [isDensityModelRendering, setIsDensityModelRendering] =
		useState<boolean>(false);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: DEFAULTS,
		values: domainValues,
	});

	const saveDomainValues = async (values: typeof DEFAULTS) => {
		if (project == null || !project.name) {
			toast.error('Project could not be found.');
			return;
		}

		const baseProjectPath = getBaseProjectPath(project?.name);
		const path = `${baseProjectPath}/${FILE_NAME}`;
		const content = JSON.stringify(values);

		createFile(path, content);
	};

	const fetchDomainValues = async () => {
		if (project == null || !project.name) {
			toast.error('Project could not be found.');
			return;
		}

		const baseProjectPath = getBaseProjectPath(project?.name);
		const path = `${baseProjectPath}/${FILE_NAME}`;

		const isExisting = await checkFileDirectory(path);
		if (!isExisting) saveDomainValues(DEFAULTS);

		const content: string = await readFile(path);

		if (!content) {
			toast.error('There was an error loading configuration file.');
		}

		try {
			const values: Domain = JSON.parse(content);
			return values;
		} catch {
			toast.error('The configuration file is possibly malformed.');
			return null;
		}
	};

	const onFindFile = async (field: any) => {
		const file = await findFile();
		const isCancelled = file.canceled;

		if (isCancelled) {
			return null;
		}

		if (file?.filePaths?.length) {
			form.clearErrors(field.name);
			const path = file.filePaths[0];
			form.setValue(field, path);
			return path;
		}
	};

	const onFindFileDirectory = async (field: any) => {
		const directory = await findFileDirectory();
		const isCancelled = directory.canceled;

		if (isCancelled) {
			return null;
		}

		if (directory?.filePaths?.length) {
			const path = directory.filePaths[0];
			form.setValue(field, path);
			return path;
		}

		return null;
	};

	const onSubmit = async (values: z.infer<typeof FormSchema>) => {
		const completeValues = {
			...DEFAULTS,
			...values,
		};
		await saveDomainValues(completeValues);
		toast.success('Saved');
	};

	const renderModel = async (
		modelInputFilePath: string,
		imageDimension: ImageDimension,
	) => {
		if (project == null || !project.name) {
			toast.error('Project could not be found.');
			return;
		}

		const RENDERED_MODELS_FOLDER = 'rendered_models';
		const baseProjectPath = getBaseProjectPath(project?.name);
		const renderedModelsOutputPath = `${baseProjectPath}/${RENDERED_MODELS_FOLDER}`;

		await createFileDirectory(renderedModelsOutputPath);

		const renderedModelOutputFileName = modelInputFilePath
			?.split('\\')
			?.pop()
			?.split('/')
			?.pop()
			?.split('.')
			?.slice(0, -1)
			?.join('.');

		const modelOutputFilePath = `${renderedModelsOutputPath}/${renderedModelOutputFileName}`;
		const outputPath = await render(
			modelInputFilePath,
			modelOutputFilePath,
			imageDimension,
		);
		return outputPath;
	};

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

	const loadModel = async (
		modelInputFilePath: string,
		imageDimension: ImageDimension,
	) => {
		const modelOutputFilePath = await renderModel(
			modelInputFilePath,
			imageDimension,
		);

		if (!modelOutputFilePath) {
			toast.error('Could not find correct model type.');
			return;
		}

		return modelOutputFilePath;
	};

	const loadSources = async (path: string) => {
		const SOURCE_TXT = 'source.txt';

		const geomDirectory = form.getValues('geomDirectory');
		const sourceFilePath = `${geomDirectory}/${SOURCE_TXT}`;

		const isSourceFileExisting = await checkFileDirectory(sourceFilePath);

		if (!isSourceFileExisting) {
			toast.error(`Could not find ${SOURCE_TXT} file.`);
			return null;
		}

		try {
			const sourceFileContent: string = await readFile(sourceFilePath, 'utf8');

			const lines = sourceFileContent.split('\n');

			const result: string[] = []; // Initialize an empty array to store the first column values

			// Skip the first line (header) and process the rest
			lines.slice(1).forEach((line) => {
				const columns = line.trim().split(/\s+/); // Split the line by whitespace
				if (columns.length > 0) {
					result.push(columns[0]); // Add the first column value to the result array
				}
			});

			return result;
		} catch {
			toast.error(`The ${SOURCE_TXT} file is possibly malformed.`);
			return null;
		}
	};

	const loadSummary = async (path: string) => {
		setIsLoading(true);
		const GEOM_TXT = 'geometry.txt';

		const geomDirectory = form.getValues('geomDirectory');
		const geomFilePath = `${geomDirectory}/${GEOM_TXT}`;

		const isFrequenciesFileExisting = await checkFileDirectory(geomFilePath);

		if (!isFrequenciesFileExisting) {
			toast.error(`Could not find ${GEOM_TXT} file.`);
			setIsLoading(false);
			return null;
		}

		const properties = {
			minimumSx: 'sx min',
			maximumSx: 'sx max',
			minimumSy: 'sy min',
			maximumSy: 'sy max',
			minimumGx: 'gx min',
			maximumGx: 'gx max',
			minimumGy: 'gy min',
			maximumGy: 'gy max',
			minimumOffset: 'offset min',
			maximumOffset: 'offset max',
		};

		try {
			const geomFileContent: string = await readFile(geomFilePath, 'utf8');

			const lines = geomFileContent.split('\n');

			const result: Record<string, number> = {}; // Initialize an empty object

			// Iterate through each line
			lines.forEach((line) => {
				const [key, value] = line.split(' : ').map((item) => item.trim()); // Split by ' : ' and trim whitespace

				// Check if the key exists in properties and map to the new key
				if (key && value) {
					// Reverse lookup: find the new key corresponding to the current key
					const newKey = Object.keys(properties).find(
						(prop) => properties[prop] === key,
					);

					// If a new key is found, assign the value to the result object
					if (newKey) {
						result[newKey] = Number(value); // Map the new key to the value
					}
				}
			});

			toast.info(`Loaded ${GEOM_TXT} File`);
			setIsLoading(false);
			return result;
		} catch {
			toast.error(`The ${GEOM_TXT} file is possibly malformed.`);
			setIsLoading(false);
			return null;
		}
	};

	const renderVelocityModel = async () => {
		setIsLoading(true);
		setIsVelocityModelRendering(true);

		const initialVpPathState = form.getFieldState('initialVpFile');
		const modelInputFilePath = form.getValues('initialVpFile');

		const imageDimensionFilePathState =
			form.getFieldState('imageDimensionFile');
		const imageDimensionPath = form.getValues('imageDimensionFile');

		if (
			initialVpPathState.invalid ||
			initialVpPathState.isValidating ||
			initialVpPathState.isDirty ||
			!modelInputFilePath ||
			imageDimensionFilePathState.invalid ||
			imageDimensionFilePathState.isValidating ||
			imageDimensionFilePathState.isDirty ||
			!imageDimensionPath
		) {
			setIsVelocityModelRendering(false);
			setIsLoading(false);
			return;
		}

		setVelocityModelOutput(null);
		const imageDimension = await getImageDimension(imageDimensionPath);

		const outputPath = await loadModel(modelInputFilePath, imageDimension);
		if (outputPath) {
			const velocityModelOutputPath = `${PROJECT_PROTOCOL}://${outputPath.replace('Projects/', '')}`;
			setVelocityModelOutput(velocityModelOutputPath);
			setImageDimensionFilePath(imageDimensionPath);
			toast.info('Rendered Initial VP Model');
		}
		setIsVelocityModelRendering(false);
		setIsLoading(false);
	};

	const renderDensityModel = async () => {
		setIsLoading(true);
		setIsDensityModelRendering(true);

		const initialVpPathState = form.getFieldState('initialDensityFile');
		const modelInputFilePath = form.getValues('initialDensityFile');

		if (
			initialVpPathState.invalid ||
			initialVpPathState.isValidating ||
			initialVpPathState.isDirty ||
			!modelInputFilePath
		) {
			setIsDensityModelRendering(false);
			setIsLoading(false);
			return;
		}

		setDencityModelOutput(null);
		const outputPath = await loadModel(modelInputFilePath);
		if (outputPath) {
			const densityModelOutputPath = `${PROJECT_PROTOCOL}://${outputPath.replace('Projects/', '')}`;
			setDencityModelOutput(densityModelOutputPath);
			toast.info('Rendered Initial Density Model');
		}

		setIsDensityModelRendering(false);
		setIsLoading(false);
	};

	const loadDomainValues = async () => {
		const values = await fetchDomainValues();
		setDomainValues({
			...DEFAULTS,
			...values,
		});
	};

	useEffect(() => {
		if (project) {
			loadDomainValues();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [project]);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Domain</h3>
				<p className="text-sm text-muted-foreground">Configure Data I/O</p>
			</div>
			<Separator />
			<Form {...form}>
				<form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="csgfOutDirectory"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									CSGF Out Directory
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="text"
											placeholder="CSGF Out Directory"
											{...field}
										/>
									</FormControl>
									<Button
										type="button"
										variant="secondary"
										className="col-span-1"
										onClick={() => onFindFileDirectory(field.name)}
									>
										Find
									</Button>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Separator className="my-6" />
					<FormField
						control={form.control}
						name="geomDirectory"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									GEOM Directory
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input placeholder="GEOM Directory" {...field} />
									</FormControl>
									<Button
										type="button"
										variant="secondary"
										className="col-span-1"
										onClick={async () => {
											const path = await onFindFileDirectory(field.name);
											if (!path) return;

											const summary = await loadSummary(path);
											if (!summary) return;
											Object.keys(summary).forEach((p) => {
												form.setValue(p, summary[p]);
											});

											const sources = await loadSources(path);
											if (!sources || sources.length === 0) return;
											setSourceValues(sources);
										}}
									>
										Find
									</Button>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="imageDimensionFile"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Image Dimension File
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input placeholder="Image Dimension File" {...field} />
									</FormControl>
									<Button
										type="button"
										variant="secondary"
										className="col-span-1"
										onClick={async () => {
											const path = await onFindFile(field.name);
											if (!path) return;
											const values = await getImageDimension(path);
											if (!values) return;
											setImageDimensionFilePath(path);
										}}
									>
										Find
									</Button>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="initialVpFile"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Initial VP File
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input placeholder="Initial VP File" {...field} />
									</FormControl>
									<Button
										type="button"
										disabled={isVelocityModelRendering}
										variant="secondary"
										className="col-span-1"
										onClick={async () => {
											await onFindFile(field.name);
											await renderVelocityModel();
										}}
									>
										Find
									</Button>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="initialDensityFile"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Initial Density File
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input placeholder="Initial Density File" {...field} />
									</FormControl>
									<Button
										type="button"
										disabled={isDensityModelRendering}
										variant="secondary"
										className="col-span-1"
										onClick={async () => {
											await onFindFile(field.name);
											renderDensityModel();
										}}
									>
										{isDensityModelRendering ? (
											<Loader2 className="animate-spin" />
										) : (
											'Find'
										)}
									</Button>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Separator />
					<h4 className="text-md font-medium leading-none">Summary</h4>
					<div className="grid grid-cols-2 min-w-[384px] max-w-[768px] gap-4">
						<FormField
							control={form.control}
							name="numberOfSources"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-right col-span-1">
										Number of Sources
									</FormLabel>
									<div className="flex w-full max-w-sm items-center space-x-2">
										<FormControl>
											<Input
												type="number"
												placeholder="Number of Sources"
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="numberOfReceivers"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-right col-span-1">
										Number of Receivers
									</FormLabel>
									<div className="flex w-full max-w-sm items-center space-x-2">
										<FormControl>
											<Input
												type="number"
												placeholder="Number of Receivers"
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="minimumSx"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-right col-span-1">
										Minimum sx (m)
									</FormLabel>
									<div className="flex w-full max-w-sm items-center space-x-2">
										<FormControl>
											<Input
												type="number"
												placeholder="Minimum sx (m)"
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="minimumSy"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-right col-span-1">
										Minimum sy (m)
									</FormLabel>
									<div className="flex w-full max-w-sm items-center space-x-2">
										<FormControl>
											<Input
												type="number"
												placeholder="Minimum sy (m)"
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="maximumSx"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-right col-span-1">
										Maximum sx (m)
									</FormLabel>
									<div className="flex w-full max-w-sm items-center space-x-2">
										<FormControl>
											<Input
												type="number"
												placeholder="Minimum sx (m)"
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="maximumSy"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-right col-span-1">
										Maximum sy (m)
									</FormLabel>
									<div className="flex w-full max-w-sm items-center space-x-2">
										<FormControl>
											<Input
												type="number"
												placeholder="Maximum sy (m)"
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="minimumOffset"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-right col-span-1">
										Minimum offset (m)
									</FormLabel>
									<div className="flex w-full max-w-sm items-center space-x-2">
										<FormControl>
											<Input
												type="number"
												placeholder="Minimum offset (m)"
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="maximumOffset"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-right col-span-1">
										Maximum sy (m)
									</FormLabel>
									<div className="flex w-full max-w-sm items-center space-x-2">
										<FormControl>
											<Input
												type="number"
												placeholder="Maximum offset (m)"
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<ScrollArea className="h-72 rounded-md border px-4 py-2 ">
						<div className="grid grid-cols-2 gap-4  min-w-[384px] max-w-[768px] h-auto font-mono text-sm">
							<div className="space-y-2">
								{sourceValues.map((source) => {
									if (!source) return;
									return (
										<div
											key={`source-${source}`}
											className="grid grid-cols-4 border rounded"
										>
											<div className="col-span-1 border-e text-center p-2">
												<Checkbox />
											</div>
											<div className="col-span-3 py-2 pl-2">
												source {source}
											</div>
										</div>
									);
								})}
							</div>
							<div className="space-y-2">
								{sourceValues.map((receiver) => {
									if (!receiver) return;
									return (
										<div
											key={`receiver-${receiver}`}
											className="grid grid-cols-4 border rounded"
										>
											<div className="col-span-1 border-e text-center p-2">
												<Checkbox />
											</div>
											<div className="col-span-3 py-2 pl-2">
												receiver {receiver}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</ScrollArea>

					<div className="grid grid-cols-2 gap-4  min-w-[384px] max-w-[768px] h-auto">
						<figure>
							{velocityModelOutput && (
								<div className="relative">
									<img
										src={velocityModelOutput}
										className="w-full relative object-contain max-w-full bg-white max-w-sm max-w-xl h-64 rounded-lg shadow-xl dark:shadow-gray-800"
										alt="Velocity"
									/>
									<Button
										className="absolute bottom-4 mx-4"
										variant="secondary"
										type="button"
										onClick={() => {
											const plotPath = form.getValues('initialVpFile');
											setPlotPath(plotPath);
											window.electron.openPlotWindow();
										}}
									>
										Open Viewer
									</Button>
								</div>
							)}

							{!velocityModelOutput && (
								<div className="flex items-center justify-center h-64 bg-gray-300 rounded-sm w-full dark:bg-gray-700">
									<svg
										className="w-10 h-10 text-gray-200 dark:text-gray-600"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="currentColor"
										viewBox="0 0 20 18"
									>
										<path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
									</svg>
								</div>
							)}
							<figcaption className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
								v<sub>ρ</sub> model
							</figcaption>
						</figure>

						<figure>
							{densityModelOutput && (
								<div className="relative">
									<img
										src={densityModelOutput}
										className="w-full relative object-contain max-w-full bg-white max-w-sm max-w-xl h-64 rounded-lg shadow-xl dark:shadow-gray-800"
										alt="Density"
									/>
									<Button
										className="absolute bottom-4 mx-4"
										variant="secondary"
										type="button"
										onClick={() => {
											const plotPath = form.getValues('initialDensityFile');
											setPlotPath(plotPath);
											window.electron.openPlotWindow();
										}}
									>
										Open Viewer
									</Button>
								</div>
							)}

							{!densityModelOutput && (
								<div className="flex items-center justify-center h-64 bg-gray-300 rounded-sm w-full dark:bg-gray-700">
									<svg
										className="w-10 h-10 text-gray-200 dark:text-gray-600"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="currentColor"
										viewBox="0 0 20 18"
									>
										<path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
									</svg>
								</div>
							)}
							<figcaption className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
								ρ model
							</figcaption>
						</figure>
					</div>
					<Button type="submit">Save</Button>
				</form>
			</Form>
		</div>
	);
}
