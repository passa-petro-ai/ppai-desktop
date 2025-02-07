/* eslint-disable no-plusplus */
import * as plotly from 'plotly.js-dist';
import { createFile, readFile } from './files';

export const getTrace = async (inputPath: string) => {
	try {
		const d1 = 0.0125;
		const d2 = 0.00625;
		const n1 = 1911;
		const n2 = 5395;

		const file = await readFile(inputPath, '');

		const { buffer } = file;
		const floatArray = new Float32Array(buffer);

		const calculatedN1 = floatArray.length / n2;
		if (!Number.isInteger(calculatedN1) || calculatedN1 !== n1) {
			throw new Error(
				'Invalid dimensions: data length is not a multiple of n2',
			);
		}

		// Reshape the array and transpose
		const reshapedArray: number[][] = [];
		for (let i = 0; i < n1; i++) {
			reshapedArray[i] = [];
			for (let j = 0; j < n2; j++) {
				reshapedArray[i][j] = floatArray[j * n1 + i];
			}
		}

		// Create heatmap using Plotly
		const trace = {
			z: reshapedArray,
			x: Array.from({ length: n2 }, (_, i) => i * d2),
			y: Array.from({ length: n1 }, (_, i) => i * d1),
			type: 'heatmap',
			colorscale: 'Earth',
		};

		return trace;
	} catch (e) {
		console.log(e);
	}
};

export const render = async (inputPath: string, outputPath: string) => {
	try {
		const d1 = 0.0125;
		const d2 = 0.00625;
		const n1 = 1911;
		const n2 = 5395;

		const file = await readFile(inputPath, '');

		const { buffer } = file;
		const floatArray = new Float32Array(buffer);

		const calculatedN1 = floatArray.length / n2;
		if (!Number.isInteger(calculatedN1) || calculatedN1 !== n1) {
			throw new Error(
				'Invalid dimensions: data length is not a multiple of n2',
			);
		}

		// Reshape the array and transpose
		const reshapedArray: number[][] = [];
		for (let i = 0; i < n1; i++) {
			reshapedArray[i] = [];
			for (let j = 0; j < n2; j++) {
				reshapedArray[i][j] = floatArray[j * n1 + i];
			}
		}

		// Create heatmap using Plotly
		const trace = {
			z: reshapedArray,
			x: Array.from({ length: n2 }, (_, i) => i * d2),
			y: Array.from({ length: n1 }, (_, i) => i * d1),
			type: 'heatmap',
			colorscale: 'Earth',
		};

		const layout = {
			title: 'Velocity Model',
			xaxis: { title: 'Inline Distance (km)' },
			yaxis: { title: 'Depth (km)' },
		};

		const graphOptions = { format: 'png', width: 800, height: 600 };

		// const image = await plotly.toImage({ data: [trace], layout }, graphOptions);

		return plotly
			.toImage({ data: [trace], layout }, graphOptions)
			.then((imageData: string) => {
				const finalData = imageData.replace(/^data:image\/png;base64,/, '');
				const finalPath = `${outputPath}.png`;
				createFile(finalPath, finalData, 'base64');
				return finalPath;
			})
			.catch((err: string) => null);
	} catch (error) {
		console.log('Error', error);
	}
};
