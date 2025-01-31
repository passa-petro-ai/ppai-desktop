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
import { Card } from '@/components/ui/card';

import { render } from '@/main/plotter';
import { Download } from 'lucide-react';
import { openDialog } from '@/main/dialog';
// import { useWorker } from '@koale/useworker';

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

enum ModelTypes {
	Velocity,
	Density,
}

export function FwiDomain() {
	const { project } = useGlobalContext();

	const [domainValues, setDomainValues] = useState<Domain>(DEFAULTS);

	// const [renderWorker] = useWorker(render);
	const [velocityModelOutput, setVelocityModelOutput] = useState<string>();
	const [densityModelOutput, setDencityModelOutput] = useState<string>();

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
		// console.log('Start Fetch');
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
			return;
		}

		if (file?.filePaths?.length) {
			const path = file.filePaths[0];
			form.setValue(field, path);
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
		render(modelInputFilePath, modelOutputFilePath);
		return modelOutputFilePath;
	};

	const loadModels = async (modelType: ModelTypes) => {
		if (project == null || !project.name) {
			toast.error('Project could not be found.');
			return;
		}

		let inputFileName = '';

		const INPUT_DENSITY_MODEL_FILE_NAME = 'density_z6.25m_x12.5m_exact.bin';
		const INPUT_VELOCITY_MODEL_FILE_NAME = 'vel_z6.25m_x12.5m_exact.bin';

		switch (modelType) {
			case ModelTypes.Density:
				inputFileName = INPUT_DENSITY_MODEL_FILE_NAME;
				break;
			case ModelTypes.Velocity:
				inputFileName = INPUT_VELOCITY_MODEL_FILE_NAME;
				break;
			default:
				toast.error('Could not find correct model type.');
				return;
		}

		const baseProjectPath = getBaseProjectPath(project?.name);
		const modelInputFilePath = `${baseProjectPath}/${inputFileName}`;

		const isExisting = await checkFileDirectory(modelInputFilePath);
		if (!isExisting) return;

		const modelOutputFilePath = await renderModel(modelInputFilePath);

		if (!modelOutputFilePath) {
			toast.error('Could not find correct model type.');
			return;
		}

		const content = await readFile(modelOutputFilePath, 'utf8');

		switch (modelType) {
			case ModelTypes.Density:
				setDencityModelOutput(content);
				break;
			case ModelTypes.Velocity:
				setVelocityModelOutput(content);
				break;
			default:
				toast.error('Could not find correct model type.');
		}
	};

	useEffect(() => {
		if (project) {
			loadDomainValues();
			loadModels(ModelTypes.Density);
			loadModels(ModelTypes.Velocity);
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
										variant="secondary"
										className="col-span-1"
										onClick={() => onFindFile(field.name)}
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
										variant="secondary"
										className="col-span-1"
										onClick={() => onFindFile(field.name)}
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
										variant="secondary"
										className="col-span-1"
										onClick={() => onFindFile(field.name)}
									>
										Find
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
						<img
							src={velocityModelOutput}
							className="w-full relative max-w-sm h-48 max-w-xl rounded-lg shadow-xl dark:shadow-gray-800"
							alt="Velocity"
						/>
						<img
							src={densityModelOutput}
							className="w-full relative max-w-sm h-48 max-w-xl rounded-lg shadow-xl dark:shadow-gray-800"
							alt="Density"
						/>
					</div>
					<Button type="submit">Save</Button>
				</form>
			</Form>
		</div>
	);
}
