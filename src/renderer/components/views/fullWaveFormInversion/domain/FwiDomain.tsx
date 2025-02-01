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
} from '@/main/files';
import { getBaseProjectPath } from '@/utils/getBaseProjectPath';
import { Domain } from '@/types/fwi/domain';

import { render } from '@/main/plotter';
import { Loader2 } from 'lucide-react';
import { useWorker } from '@koale/useworker';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

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
	const { project } = useGlobalContext();
	const [domainValues, setDomainValues] = useState<Domain>(DEFAULTS);

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

	const loadDomainValues = async () => {
		const values = await fetchDomainValues();
		setDomainValues({
			...DEFAULTS,
			...values,
		});
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
		const directory = await findFile();
		const isCancelled = directory.canceled;

		if (isCancelled) {
			return;
		}

		if (directory?.filePaths?.length) {
			const path = directory.filePaths[0];
			form.setValue(field, path);
		}
	};

	const onSubmit = async (values: z.infer<typeof FormSchema>) => {
		const completeValues = {
			...DEFAULTS,
			...values,
		};
		await saveDomainValues(completeValues);
		toast.success('Saved');
	};

	const [renderWorker] = useWorker(render);

	const renderModel = async (modelInputFilePath: string) => {
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
		renderWorker(modelInputFilePath, modelOutputFilePath);

		return modelOutputFilePath;
	};

	const loadModel = async (modelInputFilePath: string) => {
		const modelOutputFilePath = await renderModel(modelInputFilePath);

		if (!modelOutputFilePath) {
			toast.error('Could not find correct model type.');
			return;
		}

		const content = await readFile(modelOutputFilePath, 'utf8');

		return content;
	};

	const renderVelocityModel = async () => {
		setIsVelocityModelRendering(true);

		const initialVpPathState = form.getFieldState('initialVpFile');
		const modelInputFilePath = form.getValues('initialVpFile');

		if (
			initialVpPathState.invalid ||
			initialVpPathState.isValidating ||
			initialVpPathState.isDirty ||
			!modelInputFilePath
		) {
			setIsVelocityModelRendering(false);
			return;
		}

		setVelocityModelOutput(null);

		const modelOutputBase64 = await loadModel(modelInputFilePath);
		if (modelOutputBase64) setVelocityModelOutput(modelOutputBase64);
		toast.info('Rendered Initial VP Model');
		setIsVelocityModelRendering(false);
	};

	const renderDensityModel = async () => {
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
			return;
		}

		const modelOutputBase64 = await loadModel(modelInputFilePath);
		if (modelOutputBase64) setDencityModelOutput(modelOutputBase64);
		toast.info('Rendered Initial Density Model');
		setIsDensityModelRendering(false);
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
										onClick={() => onFindFileDirectory(field.name)}
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
										onClick={async () => onFindFile(field.name)}
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
											renderVelocityModel();
										}}
									>
										{isVelocityModelRendering ? (
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
					<div className="grid grid-cols-2 items-center gap-4">
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
					<Separator />
					<div className="grid grid-cols-2 items-center gap-4">
						<Dialog>
							<DialogTrigger asChild>
								<figure>
									{velocityModelOutput && (
										<img
											src={velocityModelOutput}
											className="w-full relative max-w-full object-fit max-w-sm max-w-xl rounded-lg shadow-xl dark:shadow-gray-800"
											alt="Velocity"
										/>
									)}

									{!velocityModelOutput && (
										<div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded-sm sm:w-96 dark:bg-gray-700">
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
							</DialogTrigger>
							<DialogContent className="max-w-5xl border-0 flex">
								<div className="relative w-screen  overflow-clip rounded-md bg-transparent">
									<img
										src={velocityModelOutput}
										className="w-full relative max-w-full object-fit max-w-sm max-w-xl rounded-lg shadow-xl dark:shadow-gray-800"
										alt="Velocity"
									/>
								</div>
							</DialogContent>
						</Dialog>

						<figure>
							{densityModelOutput && (
								<img
									src={densityModelOutput}
									className="w-full relative max-w-full object-fit max-w-sm max-w-xl rounded-lg shadow-xl dark:shadow-gray-800"
									alt="Density"
								/>
							)}

							{!densityModelOutput && (
								<div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded-sm sm:w-96 dark:bg-gray-700">
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
