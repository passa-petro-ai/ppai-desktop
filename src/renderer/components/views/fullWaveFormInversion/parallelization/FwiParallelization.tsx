import { useEffect, useRef } from 'react';

export function FwiParalellization() {
	const canvas = useRef<HTMLCanvasElement>(null);

	const width = 800; // Width of the canvas
	const height = 600; // Height of the canvas

	// Example: Load seismic data (float array or binary data)
	// For this demo, we’ll generate some random data as a placeholder
	function generateSeismicData(width: number, height: number): Float32Array {
		const data = new Float32Array(width * height);
		for (let i = 0; i < data.length; i++) {
			data[i] = Math.random(); // Replace with real seismic data loading
		}
		return data;
	}

	// Convert float data to grayscale colors
	function floatDataToGrayscaleImage(
		data: Float32Array,
		width: number,
		height: number,
	): ImageData {
		const ctx = canvas.current.getContext('2d');
		const imageData = ctx.createImageData(width, height);
		const buffer = imageData.data;

		// Find the min and max values in the data for scaling
		const min = Math.min(...data);
		const max = Math.max(...data);

		for (let i = 0; i < data.length; i++) {
			const value = (data[i] - min) / (max - min); // Normalize value between 0 and 1
			const color = Math.floor(value * 255); // Convert to grayscale (0-255)

			// Set pixel color (RGBA format)
			buffer[i * 4] = color; // Red
			buffer[i * 4 + 1] = color; // Green
			buffer[i * 4 + 2] = color; // Blue
			buffer[i * 4 + 3] = 255; // Alpha (fully opaque)
		}

		return imageData;
	}

	// Render the seismic data to the canvas
	function renderSeismicData() {
		canvas.current.width = width;
		canvas.current.height = height;

		const seismicData = generateSeismicData(width, height);
		const imageData = floatDataToGrayscaleImage(seismicData, width, height);

		// Draw the image data on the canvas
		canvas.current.context.putImageData(imageData, 0, 0);
	}

  useEffect(() => {renderSeismicData()},[renderSeismicData])

	return (
		<div>
			<canvas ref={canvas} />
		</div>
	);
}
