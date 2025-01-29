import { PROJECTS_DIRECTORY } from '@/config/config';

export const getBaseProjectPath = (name: string) =>
	`${PROJECTS_DIRECTORY}/${name}`;
