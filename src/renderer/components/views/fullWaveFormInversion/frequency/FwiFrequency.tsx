import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Separator } from '@/components/ui/separator';

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
import { getBaseProjectPath } from '@/utils/getBaseProjectPath';
import { useGlobalContext } from '@/renderer/context/global-context';
import { Frequency, Group } from '@/types/fwi/frequency';
import {
	checkFileDirectory,
	createFile,
	findFile,
	findFileDirectory,
	readFile,
} from '@/main/files';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { refinePathValidator } from '@/utils/refinePathValidator';

const GroupFormSchema = z.object({
	start: z.coerce.number().positive(),
	end: z.coerce.number().positive(),
	increment: z.coerce.number().positive(),
});

const FrequencyFormSchema = z.object({
	csgfDirectory: z.string().trim().refine(refinePathValidator, {
		message: 'Invalid Path',
	}),
	frequencies: z.array(GroupFormSchema).optional(),
});

const GROUP_DEFAULTS: Group = {
	start: 0,
	end: 0,
	increment: 1,
};

const FREQUENCY_DEFAULTS: Frequency = {
	csgfDirectory: '',
	frequencies: [],
};

const FILE_NAME = 'frequency.json';

export function FwiFrequency() {
	const { project } = useGlobalContext();

	const [frequencyValues, setFrequencyValues] =
		useState<Frequency>(FREQUENCY_DEFAULTS);

	const [frequencies, setFrequencies] = useState<string[]>([]);

	const groupForm = useForm<z.infer<typeof GroupFormSchema>>({
		resolver: zodResolver(GroupFormSchema),
		defaultValues: GROUP_DEFAULTS,
		mode: 'onBlur',
	});

	const frequencyForm = useForm<z.infer<typeof FrequencyFormSchema>>({
		resolver: zodResolver(FrequencyFormSchema),
		defaultValues: FREQUENCY_DEFAULTS,
		values: frequencyValues,
	});

	const { fields, append, remove } = useFieldArray({
		control: frequencyForm.control, // control props comes from useForm (optional: if you are using FormProvider)
		name: 'frequencies', // unique name for your Field Array
	});

	const saveFrequencyValues = async (values: typeof FREQUENCY_DEFAULTS) => {
		if (project == null || !project.name) {
			toast.error('Project could not be found.');
			return;
		}

		const baseProjectPath = getBaseProjectPath(project?.name);
		const path = `${baseProjectPath}/${FILE_NAME}`;
		const content = JSON.stringify(values);

		createFile(path, content);
	};

	const fetchFrequencyValues = async () => {
		if (project == null || !project.name) {
			toast.error('Project could not be found.');
			return;
		}

		const baseProjectPath = getBaseProjectPath(project?.name);
		const path = `${baseProjectPath}/${FILE_NAME}`;

		const isExisting = await checkFileDirectory(path);
		if (!isExisting) saveFrequencyValues(FREQUENCY_DEFAULTS);

		const content: string = await readFile(path);

		if (!content) {
			toast.error('There was an error loading configuration file.');
		}

		try {
			const values: Frequency = JSON.parse(content);
			return values;
		} catch {
			toast.error('The configuration file is possibly malformed.');
			return null;
		}
	};

	const loadFrequencyValues = async () => {
		const values = await fetchFrequencyValues();
		setFrequencyValues({
			...FREQUENCY_DEFAULTS,
			...values,
		});
	};

	const loadFrequencies = async () => {
		const FREQUENCIES_TXT = 'frequency.txt';
		const csgfDirectory = frequencyForm.getValues('csgfDirectory');
		const frequenciesFilePath = `${csgfDirectory}/${FREQUENCIES_TXT}`;

		const isFrequenciesFileExisting =
			await checkFileDirectory(frequenciesFilePath);

		if (!isFrequenciesFileExisting) {
			toast.error('Could not find frequencies.txt file.');
			setFrequencies([]);
			return;
		}

		try {
			const frequenciesFileContent: string = await readFile(
				frequenciesFilePath,
				'utf8',
			);

			const formatted = frequenciesFileContent.replaceAll(',', ', ');
			const values = formatted.split('\n');
			setFrequencies(values);
			toast.info('Loaded frequency.txt File');
		} catch {
			toast.error('The frequency.txt file is possibly malformed.');
		}
	};

	const onFindFileDirectory = async (field: any) => {
		const directory = await findFileDirectory();
		const isCancelled = directory.canceled;

		if (isCancelled) {
			return;
		}

		if (directory?.filePaths?.length) {
			const path = directory.filePaths[0];
			frequencyForm.setValue(field, path);
			loadFrequencies();
		}
	};

	const onAppend = (values: z.infer<typeof GroupFormSchema>) => {
		append(values);
		toast.info('Added Frequency Group');
	};

	const onSubmit = async (values: z.infer<typeof FrequencyFormSchema>) => {
		const completeValues = {
			...FREQUENCY_DEFAULTS,
			...values,
		};
		await saveFrequencyValues(completeValues);
		toast.success('Saved');
	};

	useEffect(() => {
		if (project) loadFrequencyValues();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [project]);

	useEffect(() => {
		if (frequencyValues.csgfDirectory) loadFrequencies();
	}, [frequencyValues, project])

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Frequency</h3>
				<p className="text-sm text-muted-foreground">Configure FWI Operation</p>
			</div>
			<Separator />
			<Form {...frequencyForm}>
				<form
					className="space-y-5"
					onSubmit={frequencyForm.handleSubmit(onSubmit)}
				>
					<FormField
						control={frequencyForm.control}
						name="csgfDirectory"
						render={({ field }) => (
							<FormItem onBlur={loadFrequencies}>
								<FormLabel className="text-right col-span-1">
									CSGF Directory
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input placeholder="CSGF Directory" {...field} />
									</FormControl>
									<Button
										variant="secondary"
										className="col-span-1"
										type="button"
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
					{frequencies.length > 0 &&
						(<div className="space-y-4">
							<span className="text-sm text-muted-foreground inline mr-2">Number of Frequency:</span>
							<span className="text-sm font-bold">{frequencies.length}</span>

							<ScrollArea className="h-72 w-4/6 rounded-md border px-4 py-2">
								<div className="grid grid-cols-3 gap-2 py-4 font-mono text-xs">
									{frequencies.map((frequency, index) => {
										if (!frequency) return;
										return (
											<div className="grid grid-cols-4 border rounded">
												<div className="col-span-1 border-e text-center p-2">{index}</div>
												<div className="col-span-3 py-2 pl-2">{frequency}</div>
											</div>
										)
									})}
								</div>

							</ScrollArea>
							<ScrollArea className="h-72 w-4/6 rounded-md border px-4 py-2">
								{fields.map((field, index) => {
									return (
										<div key={field.id}>
											<div className="flex w-full max-w-sm items-end space-x-4 mb-4">
												<FormLabel className="w-48 self-center">
													Group {index + 1}
												</FormLabel>
												<FormField
													control={frequencyForm.control}
													name={`frequencies.${index}.start`}
													render={({ field: startField }) => {
														return (
															<FormItem className="mt-2">
																<FormControl>
																	<Input
																		type="number"
																		placeholder="Start"
																		{...startField}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														);
													}}
												/>
												<FormField
													control={frequencyForm.control}
													name={`frequencies.${index}.end`}
													render={({ field: endField }) => {
														return (
															<FormItem className="mt-2">
																<FormControl>
																	<Input
																		type="number"
																		placeholder="End"
																		{...endField}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														);
													}}
												/>
												<FormField
													control={frequencyForm.control}
													name={`frequencies.${index}.increment`}
													render={({ field: incrementField }) => {
														return (
															<FormItem className="mt-2">
																<FormControl>
																	<Input
																		type="number"
																		placeholder="Increment"
																		{...incrementField}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														);
													}}
												/>
												<Button
													type="button"
													size="icon"
													variant="destructive"
													className="p-2"
													onClick={() => {
														remove(index);
													}}
												>
													<Minus />
												</Button>
											</div>
										</div>
									);
								})}
							</ScrollArea>
						</div>)
					}

					<Form {...groupForm}>
						<form className="space-y-5">
							<div className="flex w-full max-w-sm space-x-4 mb-4 items-end">
								<FormField
									control={groupForm.control}
									name="start"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-right col-span-1">
												Start
											</FormLabel>
											<FormMessage />
											<div className="flex w-full max-w-sm items-center space-x-2">
												<FormControl>
													<Input type="number" placeholder="Start" {...field} />
												</FormControl>
											</div>
										</FormItem>
									)}
								/>
								<FormField
									control={groupForm.control}
									name="end"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-right col-span-1">
												End
											</FormLabel>
											<FormMessage />
											<div className="flex w-full max-w-sm items-center space-x-2">
												<FormControl>
													<Input type="number" placeholder="End" {...field} />
												</FormControl>
											</div>
										</FormItem>
									)}
								/>
								<FormField
									control={groupForm.control}
									name="increment"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-right col-span-1">
												Increment
											</FormLabel>
											<FormMessage />
											<div className="flex w-full max-w-sm items-center space-x-2">
												<FormControl>
													<Input
														type="number"
														placeholder="Increment"
														{...field}
													/>
												</FormControl>
											</div>
										</FormItem>
									)}
								/>
								<Button
									size="icon"
									className="p-2"
									type="submit"
									onClick={() => {
										groupForm.handleSubmit(onAppend)();
									}}
								>
									<Plus />
								</Button>
							</div>
						</form>
					</Form>
					<Button type="submit">Save</Button>
				</form>
			</Form>
		</div>
	);
}
