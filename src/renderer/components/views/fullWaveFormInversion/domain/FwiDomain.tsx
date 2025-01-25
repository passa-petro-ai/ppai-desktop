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
import { Card } from '@/components/ui/card';
import { useEffect, useState, useMemo } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const FormSchema = z.object({
	csgfOutDirectory: z.string().url({ message: 'Invalid Path' }).trim(),
	geomDirectory: z.string().url({ message: 'Invalid Path' }).trim(),
	imageDimensionFile: z.string().url({ message: 'Invalid Path' }).trim(),
	initialVpFile: z.string().url({ message: 'Invalid Path' }).trim(),
	initialDensityFile: z.string().url({ message: 'Invalid Path' }).trim(),
	numberOfSources: z.coerce.number().nonnegative().optional(),
	minimumOffset: z.coerce.number().nonnegative().optional(),
	maximumOffset: z.coerce.number().nonnegative().optional(),
	minimumSx: z.coerce.number().nonnegative().optional(),
	minimumSy: z.coerce.number().nonnegative().optional(),
	maximumSx: z.coerce.number().nonnegative().optional(),
	maximumSy: z.coerce.number().nonnegative().optional(),
	numberOfReceivers: z.coerce.number().nonnegative().optional(),
});

const defaults = {
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

const handleFindFile = async () => {
	return window.electron.findFile().then((result) => result);
};

const handleFindFileDirectroy = async () => {
	return window.electron.findFileDirectory().then((result) => result);
};

const handleReadFile = async (path: string) => {
	const exists = await window.electron.checkFileDirectory(path);
	if (!exists) return null;
	return window.electron.readFile(path).then((result) => result);
};

const handleCreateFile = (directory: string, content: any) => {
	window.electron.createFile(directory, content);
};

export function FwiDomain() {
	const { project } = useGlobalContext();

	const [domainValues, setDomainValues] = useState<typeof defaults | null>(
		null,
	);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: domainValues || defaults,
	});

	const setCurrentValues = async () => {
		const file = await handleReadFile(`${project?.paths[0]?.path}/domain.json`);
		if (file) {
			setDomainValues(JSON.parse(file));
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

	const onFindFileDirectory = async (field: any) => {
		const directory = await handleFindFileDirectroy();
		const isCancelled = directory.canceled;

		if (isCancelled) {
			return;
		}

		if (directory?.filePaths?.length) {
			const path = directory.filePaths[0];
			form.setValue(field, path);
		}
	};

	const onSubmit = (values: z.infer<typeof FormSchema>) => {
		// console.log({ values });
		const path = `${project?.paths[0]?.path}/domain.json`;
		const content = JSON.stringify(values);
		handleCreateFile(path, content);
		toast.success('Saved');
	};

	useEffect(() => {
		if (project && !domainValues) setCurrentValues();
		form.reset(domainValues);
	}, [project, domainValues]);

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
										onClick={() => onFindFileDirectory('csgfOutDirectory')}
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
										onClick={() => onFindFileDirectory('geomDirectory')}
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
										onClick={() => onFindFile('imageDimensionFile')}
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
										onClick={() => onFindFile('initialVpFile')}
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
										onClick={() => onFindFile('initialDensityFile')}
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
					{/* <Separator />
					<div className="grid grid-cols-2 items-center gap-4">
						<Card className="w-full h-48" />
						<Card className="w-full h-48" />
						<Card className="w-full h-48" />
						<Card className="w-full h-48" />
					</div> */}
					<Button type="submit">Save</Button>
				</form>
			</Form>
		</div>
	);
}
