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
import { Parallelization } from '@/types/fwi/parallelization';
import { checkFileDirectory, createFile, readFile } from '@/main/files';
import { getBaseProjectPath } from '@/utils/getBaseProjectPath';

const FormSchema = z.object({
	numberOfComputingNodes: z.coerce.number(),
	numberOfCoresPerComputingNode: z.coerce.number(),
	numberOfFrequencyGroupToSolveSimultaneously: z.coerce.number(),
	numberOfCoresPerFrequencyGroup: z.coerce.number(),
});

const DEFAULTS: Parallelization = {
	numberOfComputingNodes: 1,
	numberOfCoresPerComputingNode: 1,
	numberOfFrequencyGroupToSolveSimultaneously: 1,
	numberOfCoresPerFrequencyGroup: 1,
};

const FILE_NAME = 'parallelization.json';

export function FwiParallelization() {
	const { project } = useGlobalContext();

	const [parallelizationValues, setParallelizationValues] =
		useState<Parallelization>(DEFAULTS);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: DEFAULTS,
		values: parallelizationValues,
	});

	const saveParallelizationValues = (values: Partial<Parallelization>) => {
		if (project == null || !project.name) {
			toast.error('Project could not be found.');
			return;
		}

		const baseProjectPath = getBaseProjectPath(project?.name);
		const path = `${baseProjectPath}/${FILE_NAME}`;
		const content = JSON.stringify(values);

		createFile(path, content);
	};

	const fetchParallelizationValues = async () => {
		if (project == null || !project.name) {
			toast.error('Project could not be found.');
			return;
		}

		const baseProjectPath = getBaseProjectPath(project?.name);
		const path = `${baseProjectPath}/${FILE_NAME}`;

		const isExisting = await checkFileDirectory(path);
		if (!isExisting) saveParallelizationValues(DEFAULTS);

		const content: string = await readFile(path);

		if (!content) {
			toast.error('There was an error loading configuration file.');
		}

		try {
			const values: Parallelization = JSON.parse(content);
			return values;
		} catch {
			toast.error('The configuration file is possibly malformed.');
			return null;
		}
	};

	const loadParallelizationValues = async () => {
		const values = await fetchParallelizationValues();
		setParallelizationValues({
			...DEFAULTS,
			...values,
		});
	};

	const onSubmit = (values: z.infer<typeof FormSchema>) => {
		saveParallelizationValues({
			...DEFAULTS,
			...values,
		});
		toast.success('Saved');
	};

	useEffect(() => {
		if (project) loadParallelizationValues();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [project]);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Operation</h3>
				<p className="text-sm text-muted-foreground">Configure FWI Operation</p>
			</div>
			<Separator />
			<Form {...form}>
				<form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="numberOfComputingNodes"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Number of Computing Nodes
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Number of Computing Nodes"
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
						name="numberOfCoresPerComputingNode"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Number of Cores Per Computing Node
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Number of Cores Per Computing Node"
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
						name="numberOfFrequencyGroupToSolveSimultaneously"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Number of Frequency Group To Solve Simultaneously
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Number of Frequency Group To Solve Simultaneously"
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
						name="numberOfCoresPerFrequencyGroup"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Number of Cores Per Frequency Group
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Number of Cores Per Frequency Group"
											{...field}
										/>
									</FormControl>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Save</Button>
				</form>
			</Form>
		</div>
	);
}
