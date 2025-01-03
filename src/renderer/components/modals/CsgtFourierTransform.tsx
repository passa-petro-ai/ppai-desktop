import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';

import { useGlobalContext } from '@/renderer/context/global-context';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export const CSGT_FOURIER_TRANSFORM_DIALOG = 'CsgtFourierTransformDialog';

const FormSchema = z.object({
	csgfOutDirectory: z
		.string()
		.trim()
		.nonempty('CSGF Out Directory is required.'),
	csgtOutDirectory: z
		.string()
		.trim()
		.nonempty('CSGT Out Directory is required.'),
	windowing: z.boolean(),
	geomOutDirectory: z
		.string()
		.trim()
		.nonempty('CSGF Out Directory is required.'),
	firstBreakDirectory: z.string().optional(),
	dipVp: z.coerce.number(),
	timeIntercept: z.coerce.number(),
	increment: z.coerce.number().int().positive(),
	startFrequency: z.coerce.number().positive(),
	numberOfFrequencies: z.coerce.number().positive(),
	endFrequency: z.coerce.number().int().positive(),
});

export function CsgtFourierTransformDialog() {
	const { modals, openModal, closeModal } = useGlobalContext();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			csgfOutDirectory: '',
			csgtOutDirectory: '',
			windowing: true,
			geomOutDirectory: '',
			firstBreakDirectory: '',
			dipVp: 0,
			timeIntercept: 0,
			increment: 0,
			startFrequency: 0,
			numberOfFrequencies: 0,
			endFrequency: 0,
		},
	});

	const isOpen = modals.includes(CSGT_FOURIER_TRANSFORM_DIALOG);

	const toggleModal = (open: boolean) => {
		form.reset();

		if (open) {
			openModal(CSGT_FOURIER_TRANSFORM_DIALOG);
		} else {
			closeModal(CSGT_FOURIER_TRANSFORM_DIALOG);
		}
	};

	const onSubmit = (data: z.infer<typeof FormSchema>) => {};

	return (
		<Dialog open={isOpen} onOpenChange={toggleModal}>
			<DialogContent className="sm:max-w-[800px]">
				<DialogHeader>
					<DialogTitle>Get Range</DialogTitle>
					{/* <DialogDescription>
						Create a new PPAI (.ppai) project.
					</DialogDescription> */}
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-4 py-4"
					>
						<FormField
							control={form.control}
							name="csgfOutDirectory"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right">
											CSGF Out Directory
										</FormLabel>
										<FormControl>
											<Input className="col-span-4" placeholder="" {...field} />
										</FormControl>
										<Button variant="secondary">Find</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Separator />
						<FormField
							control={form.control}
							name="csgtOutDirectory"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right">
											CSGT Out Directory
										</FormLabel>
										<FormControl>
											<Input className="col-span-4" placeholder="" {...field} />
										</FormControl>
										<Button variant="secondary">Find</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Separator />
						<FormField
							control={form.control}
							name="windowing"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right">Windowing</FormLabel>
										<FormControl>
											<Switch
												defaultChecked
												className="col-span-4"
												id="windowing"
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="geomOutDirectory"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right">
											GEOM Out Directory
										</FormLabel>
										<FormControl>
											<Input className="col-span-4" placeholder="" {...field} />
										</FormControl>
										<Button variant="secondary">Find</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="firstBreakDirectory"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right">
											First Break Directory (Optional)
										</FormLabel>
										<FormControl>
											<Input className="col-span-4" placeholder="" {...field} />
										</FormControl>
										<Button variant="secondary">Find</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="dipVp"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right">Dip vp (km/s)</FormLabel>
										<FormControl>
											<Input
												className="col-span-5"
												placeholder="km/s"
												type="number"
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
							name="dipVp"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right">
											Time Intercept (s)
										</FormLabel>
										<FormControl>
											<Input
												className="col-span-5"
												placeholder="s"
												type="number"
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Separator />
						<h4 className="text-md font-medium leading-none">Frequency</h4>
						<div className="grid grid-cols-2 items-center gap-4">
							<FormField
								control={form.control}
								name="increment"
								render={({ field }) => (
									<FormItem>
										<div className="grid grid-cols-6 items-center gap-4">
											<FormLabel className="text-right col-span-2">
												Increment
											</FormLabel>
											<FormControl>
												<Input
													className="col-span-4"
													placeholder="s"
													type="number"
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
								name="numberOfFrequencies"
								render={({ field }) => (
									<FormItem>
										<div className="grid grid-cols-6 items-center gap-4">
											<FormLabel className="text-right col-span-2">
												Number of Frequencies
											</FormLabel>
											<FormControl>
												<Input
													className="col-span-4"
													placeholder="s"
													type="number"
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
								name="startFrequency"
								render={({ field }) => (
									<FormItem>
										<div className="grid grid-cols-6 items-center gap-4">
											<FormLabel className="text-right col-span-2">
												Start Frequency
											</FormLabel>
											<FormControl>
												<Input
													className="col-span-4"
													placeholder="s"
													type="number"
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
								name="endFrequency"
								render={({ field }) => (
									<FormItem>
										<div className="grid grid-cols-6 items-center gap-4">
											<FormLabel className="text-right col-span-2">
												End Frequency
											</FormLabel>
											<FormControl>
												<Input
													className="col-span-4"
													placeholder="s"
													type="number"
													{...field}
												/>
											</FormControl>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</form>
				</Form>
				<DialogFooter>
					<Button type="submit" onClick={() => form.handleSubmit(onSubmit)}>
						Get
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
