import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Separator } from '@/components/ui/separator';
import { InputColor } from '@/renderer/components/input/InputColor';
import { ThemeForm } from '@/renderer/components/views/settings/appearance/ThemeForm';
import { useGlobalContext } from '@/renderer/context/global-context';

import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	Table,
	TableCaption,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from '@/components/ui/table';

const FormSchema = z.object({
	csgfOutDirectory: z.string().url({ message: 'Invalid Path' }).trim(),
	groups: z
		.object({
			start: z.number(),
			end: z.number(),
			increment: z.number(),
		})
		.array(),
});

const defaults = {
	csgfOutDirectory: '',
	groups: [],
};

const handleFindFileDirectroy = async () => {
	return window.electron.findFileDirectory().then((result) => result);
};

export function FwiFrequency() {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: defaults,
	});

	const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
		{
			control: form.control, // control props comes from useForm (optional: if you are using FormProvider)
			name: 'test', // unique name for your Field Array
		},
	);

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
		console.log(values);
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Frequency</h3>
				<p className="text-sm text-muted-foreground">Configure FWI Operation</p>
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
										<Input placeholder="CSGF Out Directory" {...field} />
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
					{fields.map((field, index) => {
						return (
							<FormField
								control={form.control}
								name="groups"
								render={({ field }) => {
									return (
										<FormItem>
											<FormLabel className="text-right col-span-1">
												Group {index + 1}
											</FormLabel>
											<div className="flex w-full max-w-sm items-center space-x-2">
												<FormControl>
													<Input type="number" placeholder="Start" />
												</FormControl>
												<FormControl>
													<Input type="number" placeholder="End" />
												</FormControl>
												<FormControl>
													<Input type="number" placeholder="Increment" />
												</FormControl>
												<Button variant="destructive">Remove</Button>
											</div>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						);
					})}
					<FormField
						control={form.control}
						name="groups"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">Group</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input type="number" placeholder="Start" />
									</FormControl>
									<FormControl>
										<Input type="number" placeholder="End" />
									</FormControl>
									<FormControl>
										<Input type="number" placeholder="Increment" />
									</FormControl>
									<Button
										onClick={() =>
											append({
												start: 0,
												end: 0,
												increment: 0,
											})
										}
									>
										Add
									</Button>
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
