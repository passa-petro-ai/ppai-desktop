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
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const FormSchema = z.object({
	projectFile: z.string().trim().nonempty('Project file path is required.'),
	csgfOutDirectory: z
		.string()
		.trim()
		.nonempty('CSGF Out Directory is required.'),
	geomDirectory: z.string().trim().nonempty('GEOM Directory is required.'),
	imageDimensionFile: z
		.string()
		.trim()
		.nonempty('Image Dimension File is required.'),
	initialVpFile: z.string().trim().nonempty('Initial Vp File is required.'),
	initialDensityFile: z
		.string()
		.trim()
		.nonempty('Initial Density File is required.'),
	numberOfSources: z
		.number()
		.nonnegative('Number of Sources must be a non-negative number.'),
	minimumOffset: z
		.number()
		.nonnegative('Minimum offset must be a non-negative number.'),
	maximumOffset: z
		.number()
		.nonnegative('Maximum offset must be a non-negative number.'),
	minimumSx: z
		.number()
		.nonnegative('Minimum sx must be a non-negative number.'),
	minimumSy: z
		.number()
		.nonnegative('Minimum sy must be a non-negative number.'),
	maximumSx: z
		.number()
		.nonnegative('Maximum sx must be a non-negative number.'),
	maximumSy: z
		.number()
		.nonnegative('Maximum sy must be a non-negative number.'),
	numberOfReceivers: z
		.number()
		.nonnegative('Number of Receivers must be a non-negative number.'),
});

export function FwiDomain() {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			projectFile: '',
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
		},
	});

	const onSubmit = (data: z.infer<typeof FormSchema>) => {};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Domain</h3>
				<p className="text-sm text-muted-foreground">Configure Data I/O</p>
			</div>
			<Separator />
			<Form {...form}>
				<form className="space-y-5">
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
									<Button variant="secondary" className="col-span-1">
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
									<Button variant="secondary" className="col-span-1">
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
									<Button variant="secondary" className="col-span-1">
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
									<Button variant="secondary" className="col-span-1">
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
									Initial Density File
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input placeholder="Initial Density File" {...field} />
									</FormControl>
									<Button variant="secondary" className="col-span-1">
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
						<Card className="w-full h-48" />
						<Card className="w-full h-48" />
						<Card className="w-full h-48" />
						<Card className="w-full h-48" />
					</div>
				</form>
			</Form>
			<div className="z-10 sticky bottom-0 flex flex-row-reverse shrink-0 border-t bg-background items-center  py-4 justify-between text-muted-foreground select-none">
				<Button onClick={() => form.handleSubmit(onSubmit)} type="button">
					Save
				</Button>
			</div>
		</div>
	);
}
