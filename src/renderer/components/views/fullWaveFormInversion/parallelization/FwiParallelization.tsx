import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Separator } from '@/components/ui/separator';
import { InputColor } from '@/renderer/components/input/InputColor';
import { ThemeForm } from '@/renderer/components/views/settings/appearance/ThemeForm';
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

const FormSchema = z.object({
	numberOfComputingNodes: z.coerce.number(),
	numberOfCoresPerComputingNode: z.coerce.number(),
	numberOfFrequencyGroupToSolveSimultaneously: z.coerce.number(),
	numberOfCoresPerFrequencyGroup: z.coerce.number(),
});

const defaults = {
	numberOfComputingNodes: 1,
	numberOfCoresPerComputingNode: 1,
	numberOfFrequencyGroupToSolveSimultaneously: 1,
	numberOfCoresPerFrequencyGroup: 1,
};

const handleFindFile = async () => {
	return window.electron.findFile().then((result) => result);
};

const handleFindFileDirectroy = async () => {
	return window.electron.findFileDirectory().then((result) => result);
};

const handleReadFile = async (path: string) => {
	return window.electron.readFile(path).then((result) => result);
};

const handleCreateFile = (directory: string, content: any) => {
	window.electron.createFile(directory, content);
};

export function FwiParallelization() {
	const { project } = useGlobalContext();

	const [parallelizationValues, setParallelizationValues] = useState<
		typeof defaults | null
	>(null);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: defaults || defaults,
	});

	const setCurrentValues = async () => {
		const file = await handleReadFile(`${project?.paths[0]?.path}/domain.json`);
		if (file) {
			setParallelizationValues(JSON.parse(file));
		}
		// console.log(form.getValues());
	};

	const onFindFile = async (field: any) => {
		const file = await handleFindFile();
		const isCancelled = file.canceled;

		if (isCancelled) {
			return;
		}

		if (file?.filePaths?.length) {
			const path = file.filePaths[0];
			form.setValue(field, path);
		}
	};

	const onSubmit = (values: z.infer<typeof FormSchema>) => {
		// console.log({ values });
		const path = `${project?.paths[0]?.path}/parallelization.json`;
		const content = JSON.stringify(values);
		handleCreateFile(path, content);
		toast.success('Saved');
	};

	useEffect(() => {
		if (project && !parallelizationValues) setCurrentValues();
		form.reset(parallelizationValues);
	}, [project, parallelizationValues]);

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
