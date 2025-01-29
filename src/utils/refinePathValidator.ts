import { checkFileDirectory } from '@/main/files';

export const refinePathValidator = async (path: string) => {
	const isExistingDirectory = await checkFileDirectory(path);
	return isExistingDirectory;
};
