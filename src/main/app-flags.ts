import { app } from 'electron';

const initialize = () => {
	// Prevent multiple instances of the app
	if (!app.requestSingleInstanceLock()) {
		app.quit();
	}

	const gpuFeatureStatus = app.getGPUFeatureStatus();
	console.log({ gpuFeatureStatus })
};

export default { initialize };
