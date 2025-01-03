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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export const NEW_PROJECT_DIALOG_KEY = 'NewProjectDialog';

const FormSchema = z.object({
	name: z.string().trim().nonempty('Project file name is required.'),
	segyDataFile: z.string().trim().nonempty('SEGY Data File is required.'),
	segyModelFile: z.string().trim().nonempty('SEGY Model File is required.'),
	shotKeyword: z.string().trim().nonempty('Shot Keyword is required.'),
});

export function NewProjectDialog() {
	const { modals, openModal, closeModal } = useGlobalContext();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: '',
			segyDataFile: '',
			segyModelFile: '',
			shotKeyword: 'fldr',
		},
	});

	const isOpen = modals.includes(NEW_PROJECT_DIALOG_KEY);

	const toggleModal = (open: boolean) => {
		form.reset();

		if (open) {
			openModal(NEW_PROJECT_DIALOG_KEY);
		} else {
			closeModal(NEW_PROJECT_DIALOG_KEY);
		}
	};

	const onSubmit = (data: z.infer<typeof FormSchema>) => {};

	return (
		<Dialog open={isOpen} onOpenChange={toggleModal}>
			<DialogContent className="sm:max-w-[725px]">
				<DialogHeader>
					<DialogTitle>New Project</DialogTitle>
					<DialogDescription>
						Create a new PPAI (.ppai) project.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form className="grid gap-4 py-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right">Project Name</FormLabel>
										<FormControl>
											<Input
												className="col-span-5"
												placeholder="New Project"
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
							name="segyModelFile"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right">SEGY Data File</FormLabel>
										<FormControl>
											<Input
												className="col-span-4"
												placeholder=".segy"
												{...field}
											/>
										</FormControl>
										<Button variant="secondary">Find</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="segyDataFile"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right">SEGY Data File</FormLabel>
										<FormControl>
											<Input
												className="col-span-4"
												placeholder=".segy"
												{...field}
											/>
										</FormControl>
										<Button variant="secondary">Find</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="shotKeyword"
							render={({ field }) => (
								<FormItem>
									<div className="grid grid-cols-6 items-center gap-4">
										<FormLabel className="text-right col-span-1">
											Shot Keyword
										</FormLabel>
										<FormControl>
											<Select {...field} defaultValue="fldr">
												<SelectTrigger className="col-span-5">
													<SelectValue placeholder="Select a shot keyword" />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														<SelectLabel>Shot Keyword</SelectLabel>
														<SelectItem value="fldr">fldr</SelectItem>
													</SelectGroup>
												</SelectContent>
											</Select>
										</FormControl>
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
							form.handleSubmit(onSubmit);
						}}
					>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
