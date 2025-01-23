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
import { Project } from '@/types/project';

export const NEW_PROJECT_DIALOG_KEY = 'NewProjectDialog';

const FormSchema = z.object({
	name: z.string().trim().nonempty('Project file name is required.'),
	segyDataFile: z.string().trim().nonempty('SEGY Data File is required.'),
	segyModelFile: z.string().trim().nonempty('SEGY Model File is required.'),
	shotKeyword: z.string().trim().nonempty('Shot Keyword is required.'),
});

export function NewProjectDialog() {
	const { modals, openModal, closeModal, setProject } = useGlobalContext();

	const handleCreateFileDirectory = (directory: string) => {
		window.electron.createFileDirectory(directory);
	};

	const handleFindFileDirectory = async (directory: string) => {
		const isExisting: boolean = await window.electron
			.findFileDirectory(directory)
			.then((result) => result)
			.catch(() => false);
		return isExisting;
	};

	const handleCreateFile = (directory: string, content: any) => {
		window.electron.createFile(directory, content);
	};

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

	const onSubmit = async (data: z.infer<typeof FormSchema>) => {
		const isProjectExisting = await handleFindFileDirectory(data.name);

		if (isProjectExisting) {
			alert('Project with the same name already exists.');
			return;
		}

		const paths = [
			{
				directory: 'project',
				path: data.name,
				paths: [
					{
						directory: 'data',
						path: `${data.name}/data`,
						paths: [
							{
								directory: 'geom',
								path: `${data.name}/data/geom`,
							},
							{
								directory: 'csgt',
								path: `${data.name}/data/csgt`,
							},
						],
					},
					{
						directory: 'model',
						path: `${data.name}/model`,
						paths: [],
					},
				],
			},
		];

		handleCreateFileDirectory(data.name);
		handleCreateFileDirectory(`${data.name}/data`);
		handleCreateFileDirectory(`${data.name}/data/geom`);
		handleCreateFileDirectory(`${data.name}/data/csgt`);
		handleCreateFileDirectory(`${data.name}/model`);

		const newProject = {
			name: data.name,
			segyDataFile: data.segyDataFile,
			segyModelFile: data.segyModelFile,
			shotKeyword: data.shotKeyword,
			paths,
		};

		handleCreateFile(
			`${data.name}/${data.name}.ppai.json`,
			JSON.stringify(newProject),
		);

		setProject(newProject);

		toggleModal(false);
	};

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
										<FormLabel className="text-right">
											SEGY Model File
										</FormLabel>
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
							const onInvalid = () => console.error('error');
							form.handleSubmit(onSubmit, onInvalid)();
						}}
					>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
