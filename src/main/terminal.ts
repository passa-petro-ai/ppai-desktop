// Mappings for sounds in src/renderer/lib/sounds.ts
import * as pty from 'node-pty';
import { ipcMain } from 'electron';
import { getOS } from '../utils/getOS';
import { ipcChannels } from '../config/ipc-channels';
import windows from './windows';

const spawn = () => {
	const shell = getOS() === 'windows' ? 'cmd.exe' : 'bash';
	const ptyProcess = pty.spawn(shell, [], {
		name: 'ppai-desktop',
		cols: 80,
		rows: 30,
		cwd: process.env.HOME,
		env: process.env,
	});

	ipcMain.on(ipcChannels.RUN_PTY_COMMAND, (_event: any, data) => {
		ptyProcess.write(data);
	});

	ptyProcess.onData((data) => {
		windows.mainWindow?.webContents.send(ipcChannels.SET_PTY_DATA, data);
	});

	ipcMain.on(ipcChannels.TERMINATE_PTY_PROCESS, (_event: any) => {
		ptyProcess.kill();
	});

	// ptyProcess.write('ping 192.168.0.1\r');

	return ptyProcess;
};

export default {
	spawn,
};
