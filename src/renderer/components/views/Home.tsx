import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useGlobalContext } from '@/renderer/context/global-context';
import { NEW_PROJECT_DIALOG_KEY } from '../modals/NewProjectDialog';
import { EXISTING_PROJECT_DIALOG_KEY } from '../modals/ExistingProjectDialog';
import { nav } from '@/renderer/config/nav';
import { Link } from 'lucide-react';

export function Home() {
	const { openModal, project } = useGlobalContext();

	return (
		<div className="flex h-full content-center">
			{!project && (
				<Card className="m-auto w-96">
					<CardHeader>
						<CardTitle>Get Started</CardTitle>
						<CardDescription>
							A better way for Seismic Data Processing and Imaging by machine
							learning and deep learning.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 grid-cols-2">
							<Button
								onClick={() => openModal(NEW_PROJECT_DIALOG_KEY)}
								className="w-full"
							>
								New Project
							</Button>
							<Button
								onClick={() => openModal(EXISTING_PROJECT_DIALOG_KEY)}
								variant="secondary"
								className="w-full"
							>
								Existing Project
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{project && (
				<Card className="m-auto w-96">
					<CardHeader>
						<CardTitle>{project.name}</CardTitle>
						<CardDescription>
							{project.paths.find((p) => p.directory === 'project')?.path}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 grid-cols-2">
							<Button className="w-full">
								<Link href={nav.fwi.href}>Login</Link>
							</Button>
							<Button
								onClick={() => openModal(EXISTING_PROJECT_DIALOG_KEY)}
								variant="secondary"
								className="w-full"
							>
								Existing Project
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
