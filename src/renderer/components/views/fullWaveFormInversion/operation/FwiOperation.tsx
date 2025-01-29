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
import { Operation } from '@/types/fwi/operation';
import { checkFileDirectory, createFile, readFile } from '@/main/files';
import { getBaseProjectPath } from '@/utils/getBaseProjectPath';

const FormSchema = z.object({
	numberOfIterations: z.coerce.number(),
	numberOfIterationsPerFrequencyGroup: z.coerce.number(),
	numberOfShotStride: z.coerce.number(),
	maxVp: z.coerce.number(),
	minVp: z.coerce.number(),
	maxOffsetForSourceEstimation: z.coerce.number(),
	minOffsetForSourceEstimation: z.coerce.number(),
	maxOffsetForVpUpdate: z.coerce.number(),
	minOffsetForVpUpdate: z.coerce.number(),
	updateStepLength: z.coerce.number(),
	hessianWhiteningCoefficient: z.coerce.number(),
	tikhonovRegularizationCoefficient: z.coerce.number(),
	incrementOfGaussianSmoothingFilterSizeInZ: z.coerce.number(),
	minGaussianSmoothingFilterSizeInZ: z.coerce.number(),
	maxGaussianSmoothingFilterSizeInZ: z.coerce.number(),
	incrementOfGaussianSmoothingFilterSizeInX: z.coerce.number(),
	minGaussianSmoothingFilterSizeInX: z.coerce.number(),
	maxGaussianSmoothingFilterSizeInX: z.coerce.number(),
});

const DEFAULTS: Operation = {
	numberOfIterations: 0,
	numberOfIterationsPerFrequencyGroup: 0,
	numberOfShotStride: 0,
	maxVp: 0,
	minVp: 0,
	maxOffsetForSourceEstimation: 0,
	minOffsetForSourceEstimation: 0,
	maxOffsetForVpUpdate: 0,
	minOffsetForVpUpdate: 0,
	updateStepLength: 0,
	hessianWhiteningCoefficient: 0,
	tikhonovRegularizationCoefficient: 0,
	incrementOfGaussianSmoothingFilterSizeInZ: 0,
	minGaussianSmoothingFilterSizeInZ: 0,
	maxGaussianSmoothingFilterSizeInZ: 0,
	incrementOfGaussianSmoothingFilterSizeInX: 0,
	minGaussianSmoothingFilterSizeInX: 0,
	maxGaussianSmoothingFilterSizeInX: 0,
};

const FILE_NAME = 'operation.json';

export function FwiOperation() {
	const { project } = useGlobalContext();

	const [operationValues, setOperationValues] = useState<Operation>(DEFAULTS);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: DEFAULTS,
		values: operationValues,
	});

	const saveOperationValues = async (values: typeof DEFAULTS) => {
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
		if (!isExisting) saveOperationValues(DEFAULTS);

		const content: string = await readFile(path);

		if (!content) {
			toast.error('There was an error loading configuration file.');
		}

		try {
			const values: Operation = JSON.parse(content);
			return values;
		} catch {
			toast.error('The configuration file is possibly malformed.');
			return null;
		}
	};

	const loadOperationValues = async () => {
		const values = await fetchDomainValues();
		setOperationValues({
			...DEFAULTS,
			...values,
		});
	};

	const onSubmit = async (values: z.infer<typeof FormSchema>) => {
		const completeValues = {
			...DEFAULTS,
			...values,
		};
		await saveOperationValues(completeValues);
		toast.success('Saved');
	};

	useEffect(() => {
		if (project) loadOperationValues();
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
						name="numberOfIterations"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Number of Iterations
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Number of Iterations"
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
						name="numberOfIterationsPerFrequencyGroup"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Number of Iterations per Frequency Group
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Number of Iterations per Frequency Group"
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
						name="numberOfShotStride"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Number of Shot Stride
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Number of Shot Stride"
											{...field}
										/>
									</FormControl>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Separator />

					<FormField
						control={form.control}
						name="maxVp"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Max Vp (km/s)
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Max Vp (km/s)"
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
						name="minVp"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Min Vp (km/s)
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Min Vp (km/s)"
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
						name="maxOffsetForSourceEstimation"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Max Offset for Source Estimation (km)
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Max Offset for Source Estimation (km)"
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
						name="minOffsetForSourceEstimation"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Min Offset for Source Estimation (km)
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Min Offset for Source Estimation (km)"
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
						name="maxOffsetForVpUpdate"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Max Offset for Vp Update (km)
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Max Offset for Vp Update (km)"
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
						name="minOffsetForVpUpdate"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Min Offset for Vp Update (km)
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Min Offset for Vp Update (km)"
											{...field}
										/>
									</FormControl>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Separator className="my-6" />

					<FormField
						control={form.control}
						name="updateStepLength"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Update Step Length (km/s)
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Update Step Length (km/s)"
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
						name="hessianWhiteningCoefficient"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Hessian Whitening Coefficient
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Hessian Whitening Coefficient"
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
						name="tikhonovRegularizationCoefficient"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Tikhonov Regularization Coefficient
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Tikhonov Regularization Coefficient"
											{...field}
										/>
									</FormControl>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Separator />

					<FormField
						control={form.control}
						name="incrementOfGaussianSmoothingFilterSizeInZ"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Increment of Gaussian Smoothing Filter Size in z-dir w.r.t.
									depth
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Increment of Gaussian Smoothing Filter Size in z-dir w.r.t. depth"
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
						name="minGaussianSmoothingFilterSizeInZ"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Min Gaussian Smoothing Fiolter Size in Z
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Min Gaussian Smoothing Fiolter Size in Z"
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
						name="maxGaussianSmoothingFilterSizeInZ"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Max Gaussian Smoothing Fiolter Size in Z
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Max Gaussian Smoothing Fiolter Size in Z"
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
						name="incrementOfGaussianSmoothingFilterSizeInX"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Increment of Gaussian Smoothing Filter Size in x-dir w.r.t.
									depth
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Increment of Gaussian Smoothing Filter Size in x-dir w.r.t. depth"
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
						name="minGaussianSmoothingFilterSizeInX"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Min Gaussian Smoothing Fiolter Size in X
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Min Gaussian Smoothing Fiolter Size in X"
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
						name="maxGaussianSmoothingFilterSizeInX"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-right col-span-1">
									Max Gaussian Smoothing Fiolter Size in X
								</FormLabel>
								<div className="flex w-full max-w-sm items-center space-x-2">
									<FormControl>
										<Input
											type="number"
											placeholder="Max Gaussian Smoothing Fiolter Size in X"
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
