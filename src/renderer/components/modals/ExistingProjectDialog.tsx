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
	DialogDescription,
} from '@/components/ui/dialog';

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

import { useGlobalContext } from '@/renderer/context/global-context';

export const EXISTING_PROJECT_DIALOG_KEY = 'ExistingProjectDialog';

const FormSchema = z.object({
	projectFile: z.string().trim().nonempty('Project file path is required.'),
});

export function ExistingProjectDialog() {
	const { modals, openModal, closeModal } = useGlobalContext();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			projectFile: '',
		},
	});

	const isOpen = modals.includes(EXISTING_PROJECT_DIALOG_KEY);

	const toggleModal = (open: boolean) => {
		form.reset();

		if (open) {
			openModal(EXISTING_PROJECT_DIALOG_KEY);
		} else {
			closeModal(EXISTING_PROJECT_DIALOG_KEY);
		}
	};

	const onSubmit = (data: z.infer<typeof FormSchema>) => {};

	return (
		<Dialog open={isOpen} onOpenChange={toggleModal}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Open Project</DialogTitle>
					<DialogDescription>
						Open an existing PPAI (.ppai) project file.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form className="grid gap-4 py-4">
						<FormField
							control={form.control}
							name="projectFile"
							render={({ field }) => (
								<FormItem>
									<div className="flex w-full max-w-sm items-center space-x-2">
										<FormControl>
											<Input placeholder=".ppai" {...field} />
										</FormControl>
										<Button variant="secondary">Find</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<DialogFooter>
					<Button
						type="submit"
						onClick={async () => {
							await form.trigger();
							await form.handleSubmit(onSubmit);
						}}
					>
						Open Project
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
