/* eslint-disable no-plusplus */
import * as plotly from 'plotly.js-dist';
import { DEFAULT_PLOTLY_COLORSCALE } from '@/config/config';
import { createFile, readFile } from './files';

export type ImageDimension = {
	d1: number,
	d2: number,
	n1: number,
	n2: number,
};

export const getTrace = async (inputPath: string, { d1, d2, n1, n2 }: ImageDimension) => {
	try {
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
			colorscale: DEFAULT_PLOTLY_COLORSCALE,
		};

		return trace;
	} catch (e) {
		console.log(e);
	}
};

export const render = async (
	inputPath: string,
	outputPath: string,
	{ d1, d2, n1, n2 }: ImageDimension,
) => {
	try {
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
			colorscale: DEFAULT_PLOTLY_COLORSCALE,
		};

		const layout = {
			xaxis: { title: 'Inline Distance (km)' },
			yaxis: { title: 'Depth (km)', autorange: 'reversed' },
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
