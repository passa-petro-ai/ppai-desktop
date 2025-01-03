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

export const GET_RANGE_DIALOG_KEY = 'GetRangeDialog';

const FormSchema = z.object({
	shotCoordinateX: z.coerce.number(),
	shotCoordinateY: z.coerce.number(),
	receiverCoordinateX: z.coerce.number(),
	receiverCoordinateY: z.coerce.number(),
});

export function GetRangeDialog() {
	const { modals, openModal, closeModal } = useGlobalContext();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			shotCoordinateX: 0,
			shotCoordinateY: 0,
			receiverCoordinateX: 0,
			receiverCoordinateY: 0,
		},
	});

	const isOpen = modals.includes(GET_RANGE_DIALOG_KEY);

	const toggleModal = (open: boolean) => {
		form.reset();

		if (open) {
			openModal(GET_RANGE_DIALOG_KEY);
		} else {
			closeModal(GET_RANGE_DIALOG_KEY);
		}
	};

	const onSubmit = (data: z.infer<typeof FormSchema>) => {};

	return (
		<Dialog open={isOpen} onOpenChange={toggleModal}>
			<DialogContent className="sm:max-w-[525px]">
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
							name="shotCoordinateX"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right col-span-2">
											Shot Coordinate X
										</FormLabel>
										<FormControl>
											<Input
												className="col-span-4"
												placeholder="Shot Coordinate x"
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
							name="shotCoordinateY"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right col-span-2">
											Shot Coordinate Y
										</FormLabel>
										<FormControl>
											<Input
												className="col-span-4"
												placeholder="Shot Coordinate y"
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
							name="receiverCoordinateX"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right col-span-2">
											Receiver Coordinate X
										</FormLabel>
										<FormControl>
											<Input
												className="col-span-4"
												placeholder="Receiver Coordinate x"
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
							name="receiverCoordinateY"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right col-span-2">
											Receiver Coordinate Y
										</FormLabel>
										<FormControl>
											<Input
												className="col-span-4"
												placeholder="Receiver Coordinate y"
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
						Get
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
