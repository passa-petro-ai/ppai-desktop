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
import {
	checkFileDirectory,
	createFile,
	createFileDirectory,
	findFile,
} from '@/main/files';
import { toast } from 'sonner';
import { PROJECTS_DIRECTORY } from '@/config/config';
import { Project } from '@/types/project';
import { refinePathValidator } from '@/utils/refinePathValidator';

export const NEW_PROJECT_DIALOG_KEY = 'NewProjectDialog';

const getBaseProjectPath = (name: string) => `${PROJECTS_DIRECTORY}/${name}`;

const FormSchema = z.object({
	name: z
		.string()
		.trim()
		.nonempty('Project file name is required.')
		.refine(
			async (data) => {
				const projectPath = getBaseProjectPath(data);
				const isExisting = await checkFileDirectory(projectPath);
				return !isExisting;
			},
			{
				message: 'A project with the same name already exists.',
			},
		),
	segyDataFile: z
		.string()
		.trim()
		.nonempty('SEGY Data File is required.')
		.refine(refinePathValidator, {
			message: 'SEGY Data File could not be found.',
		}),
	segyModelFile: z
		.string()
		.trim()
		.nonempty('SEGY Model File is required.')
		.refine(refinePathValidator, {
			message: 'SEGY Model File could not be found.',
		}),
	shotKeyword: z.string().trim().nonempty('Shot Keyword is required.'),
});

export function NewProjectDialog() {
	const { modals, openModal, closeModal, setProject } = useGlobalContext();

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

	const onFindFile = async (field: any, extensions: string[] = []) => {
		const file = await findFile(extensions);
		const isCancelled = file.canceled;

		if (isCancelled) {
			return;
		}

		if (file?.filePaths?.length) {
			const path = file.filePaths[0];
			form.setValue(field, path);
		}
	};

	const onSubmit = async (data: z.infer<typeof FormSchema>) => {
		const baseProjectPath = getBaseProjectPath(data.name);
		const isProjectExisting = await checkFileDirectory(baseProjectPath);

		if (isProjectExisting) {
			toast.error('A project with the same name already exists.');
			return;
		}

		const projectFilePath = `${baseProjectPath}/${data.name}.ppai.json`;

		type PathType = {
			name: string;
			path: string;
			type: 'folder' | 'file';
			paths?: PathType[];
		};

		const projectStructure: PathType[] = [
			{
				name: 'project',
				path: baseProjectPath,
				type: 'folder',
				paths: [
					{
						name: 'data',
						path: `${baseProjectPath}/data`,
						type: 'folder',
						paths: [
							{
								name: 'geom',
								path: `${baseProjectPath}/data/geom`,
								type: 'folder',
							},
							{
								name: 'csgt',
								path: `${baseProjectPath}/data/csgt`,
								type: 'folder',
							},
						],
					},
					{
						name: 'model',
						path: `${baseProjectPath}/model`,
						type: 'folder',
					},
					{
						name: 'projectFile',
						path: projectFilePath,
						type: 'file',
					},
				],
			},
		];

		const newProject: Project = {
			name: data.name,
			segyDataFile: data.segyDataFile,
			segyModelFile: data.segyModelFile,
			shotKeyword: data.shotKeyword,
			paths: projectStructure,
		};

		const projectData = JSON.stringify(newProject);

		const setupProjectStructure = async (structure: PathType[]) => {
			createFileDirectory(PROJECTS_DIRECTORY);
			// eslint-disable-next-line no-restricted-syntax
			for (const item of structure) {
				switch (item.type) {
					case 'folder':
						// eslint-disable-next-line no-await-in-loop
						await createFileDirectory(item.path);
						break;
					case 'file':
					default:
						// eslint-disable-next-line no-await-in-loop
						await createFile(item.path, projectData);
						break;
				}

				if (item.paths && item.paths.length > 0)
					setupProjectStructure(item.paths);
			}
		};

		setupProjectStructure(projectStructure);
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
										<Button
											variant="secondary"
											onClick={() => onFindFile(field.name, ['segy'])}
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
										<Button
											variant="secondary"
											onClick={() => onFindFile(field.name, ['segy'])}
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
