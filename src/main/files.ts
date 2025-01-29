export const findFile = async (extensions: string[] = []) => {
	return window.electron.findFile(extensions).then((result) => result);
};

export const readFile = async (path: string, extensions: string[] = []) => {
	const exists = await window.electron.checkFileDirectory(path);
	if (!exists) return null;
	return window.electron.readFile(path).then((result) => result);
};

export const createFile = (directory: string, content: any) => {
	window.electron.createFile(directory, content);
};

export const checkFileDirectory = async (path: string) =>
	window.electron.checkFileDirectory(path);

export const createFileDirectory = async (directory: string) => {
	const isExisting = await checkFileDirectory(directory);
	if (!isExisting) window.electron.createFileDirectory(directory);
};

export const findFileDirectory = async () => {
	return window.electron.findFileDirectory().then((result) => result);
};

export default {
	findFile,
	readFile,
	createFile,
	checkFileDirectory,
	findFileDirectory,
};
