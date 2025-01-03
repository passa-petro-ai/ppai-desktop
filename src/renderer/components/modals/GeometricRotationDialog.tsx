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

export const GEOMETRIC_ROTATION_DIALOG_KEY = 'GeometricRotationDialog';

const FormSchema = z.object({
	rotationalAngle: z.coerce.number(),
});

export function GeometricRotationDialog() {
	const { modals, openModal, closeModal } = useGlobalContext();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			rotationalAngle: 0,
		},
	});

	const isOpen = modals.includes(GEOMETRIC_ROTATION_DIALOG_KEY);

	const toggleModal = (open: boolean) => {
		form.reset();

		if (open) {
			openModal(GEOMETRIC_ROTATION_DIALOG_KEY);
		} else {
			closeModal(GEOMETRIC_ROTATION_DIALOG_KEY);
		}
	};

	const onSubmit = (data: z.infer<typeof FormSchema>) => {};

	return (
		<Dialog open={isOpen} onOpenChange={toggleModal}>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Geometric Rotation</DialogTitle>
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
							name="rotationalAngle"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right col-span-2">
											Rotational Angle (deg)
										</FormLabel>
										<FormControl>
											<Input
												className="col-span-4"
												placeholder="(deg)"
												type="number"
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<DialogFooter>
					<Button type="submit" onClick={() => form.handleSubmit(onSubmit)}>
						Run
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
