export type STLData = {
	vertices: Float32Array | number[],
	faceNormals: Float32Array | number[],
	faceColors?: Float32Array,
	faceIndices?: Uint32Array,
};

// Parsing code is based on:
// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/STLLoader.js
export class STLParser {
	// FileReader instance to load the stl file.
	static reader?: FileReader;

	constructor() {
		throw new Error(`All STLLoader methods are static, don't init with 'new', use STLParser.parse() or STLParser.parseAsync() instead.`);
	}

	private static _parseBinary(data: ArrayBuffer) {
		const reader = new DataView(data);
		const numFaces = reader.getUint32(80, true);

		let hasColors = false;
		let faceColors: Float32Array | undefined;
		let defaultR = 0;
		let defaultG = 0;
		let defaultB = 0;
		// let alpha: number;

		// process STL header
		// check for default color in header ("COLOR=rgba" sequence).
		for (let index = 0; index < 80 - 10; index++) {
			if ((reader.getUint32(index, false) == 0x434F4C4F /*COLO*/) &&
				(reader.getUint8(index + 4) == 0x52 /*'R'*/) &&
				(reader.getUint8(index + 5) == 0x3D /*'='*/)) {

				hasColors = true;
				faceColors = new Float32Array(numFaces * 3);

				defaultR = reader.getUint8(index + 6) / 255;
				defaultG = reader.getUint8(index + 7) / 255;
				defaultB = reader.getUint8(index + 8) / 255;
				// alpha = reader.getUint8(index + 9) / 255;
			}
		}

		const dataOffset = 84;
		const faceLength = 12 * 4 + 2;

		const vertices = new Float32Array(numFaces * 3 * 3);
		const faceNormals = new Float32Array(numFaces * 3);

		for (let faceIndex = 0; faceIndex < numFaces; faceIndex++) {
			const start = dataOffset + faceIndex * faceLength;
			const index = 3 * faceIndex;
			faceNormals[index] = reader.getFloat32(start, true);
			faceNormals[index + 1] = reader.getFloat32(start + 4, true);
			faceNormals[index + 2] = reader.getFloat32(start + 8, true);

			if (hasColors) {
				const packedColor = reader.getUint16(start + 48, true);
				if ((packedColor & 0x8000) === 0) {
					// facet has its own unique color
					faceColors![index] = (packedColor & 0x1F) / 31;
					faceColors![index + 1] = ((packedColor >> 5) & 0x1F) / 31;
					faceColors![index + 2] = ((packedColor >> 10) & 0x1F) / 31;
				} else {
					faceColors![index] = defaultR;
					faceColors![index + 1] = defaultG;
					faceColors![index + 2] = defaultB;
				}
			}

			for (let i = 1; i <= 3; i++) {
				const vertexStart = start + i * 12;
				const componentIndex = (faceIndex * 3 * 3) + ((i - 1) * 3);
				vertices[componentIndex] = reader.getFloat32(vertexStart, true);
				vertices[componentIndex + 1] = reader.getFloat32(vertexStart + 4, true);
				vertices[componentIndex + 2] = reader.getFloat32(vertexStart + 8, true);
			}
		}

		return {
			vertices,
			faceNormals,
			faceColors,
		};
	}

	private static _parseASCII(data: string) {
		const patternSolid = /solid([\s\S]*?)endsolid/g;
		const patternFace = /facet([\s\S]*?)endfacet/g;
		let faceCounter = 0;

		const patternFloat = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source;
		const patternVertex = new RegExp('vertex' + patternFloat + patternFloat + patternFloat, 'g');
		const patternNormal = new RegExp('normal' + patternFloat + patternFloat + patternFloat, 'g');

		const vertices: number[] = [];
		const faceNormals: number[] = [];

		let result;

		let startVertex = 0;
		let endVertex = 0;

		while ((result = patternSolid.exec(data)) !== null) {
			startVertex = endVertex;
			const solid = result[0];

			while ((result = patternFace.exec(solid)) !== null ) {
				let vertexCountPerFace = 0;
				let normalCountPerFace = 0;

				const text = result[0];

				while ((result = patternNormal.exec(text)) !== null) {
					// every face have to own ONE valid normal
					if (normalCountPerFace > 0) throw new Error('Problem parsing STL file: something isn\'t right with the normal of face number ' + faceCounter);
					faceNormals.push(
						parseFloat(result[1]),
						parseFloat(result[2]),
						parseFloat(result[3]),
					);
					normalCountPerFace++;
				}

				while ((result = patternVertex.exec(text)) !== null) {
					vertices.push(
						parseFloat(result[1]),
						parseFloat(result[2]),
						parseFloat(result[3]),
					);
					vertexCountPerFace++;
					endVertex++;
				}
				// each face have to own THREE valid vertices
				if ( vertexCountPerFace !== 3 ) {
					throw new Error('Problem parsing STL file: Something isn\'t right with the vertices of face number ' + faceCounter);
				}

				faceCounter++;
			}
		}

		return {
			vertices,
			faceNormals,
		};
	}

	private static _matchDataViewAt(query: number[], reader: DataView, offset: number) {
		// Check if each byte in query matches the corresponding byte from the current offset.
		for (let i = 0, il = query.length; i < il; i++) {
			if (query[i] !== reader.getUint8(offset + i)) return false;
		}
		return true;
	}

	private static _isBinary(data: ArrayBuffer) {
		const reader = new DataView(data);
		const face_size = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8);
		const n_faces = reader.getUint32(80, true);
		const expect = 80 + (32 / 8) + (n_faces * face_size);
		if (expect === reader.byteLength) {
			return true;
		}

		// An ASCII STL data must begin with 'solid ' as the first six bytes.
		// However, ASCII STLs lacking the SPACE after the 'd' are known to be
		// plentiful.  So, check the first 5 bytes for 'solid'.

		// Several encodings, such as UTF-8, precede the text with up to 5 bytes:
		// https://en.wikipedia.org/wiki/Byte_order_mark#Byte_order_marks_by_encoding
		// Search for "solid" to start anywhere after those prefixes.

		// US-ASCII ordinal values for 's', 'o', 'l', 'i', 'd'
		const solid = [115, 111, 108, 105, 100];
		for (let offset = 0; offset < 5; offset++) {
			// If "solid" text is matched to the current offset, declare it to be an ASCII STL.
			if (this._matchDataViewAt(solid, reader, offset)) return false;

		}
		// Couldn't find "solid" text at the beginning; it is binary STL.
		return true;
	}

	private static _ensureBinary(buffer: ArrayBuffer | string) {
		if (typeof buffer === 'string') {
			const array_buffer = new Uint8Array(buffer.length);
			for (let i = 0; i < buffer.length; i++) {
				array_buffer[ i ] = buffer.charCodeAt( i ) & 0xff; // implicitly assumes little-endian
			}
			return array_buffer.buffer || array_buffer;
		} else {
			return buffer;
		}
	}

	private static _ensureString(buffer: ArrayBuffer | string) {
		if (typeof buffer !== 'string') {
			return new TextDecoder().decode(buffer);
		}
		return buffer;
	}
	
	private static _parse(data: ArrayBuffer | string): STLData {
		const binData = this._ensureBinary(data);
		return this._isBinary(binData) ?
			this._parseBinary(binData) :
			this._parseASCII(this._ensureString(data));
	}

	private static _isURL(url: string) {
		// isURL may be a little fragile.
		return url.slice(-3).toLowerCase() === 'stl';
	}

	/**
	 * Parse stl file asynchronously (returns Promise).
	 */
	static parseAsync(urlOrFile: string | File | ArrayBuffer | Buffer) {
		const self = this;
		return new Promise<STLData>((resolve) => {
			self.parse(urlOrFile, (mesh) => {
				resolve(mesh);
			});
		});
	}

	/**
	 * Parse the .stl file at the specified file path of File object.
	 * Made this compatible with Node and the browser, maybe there is a better way?
	 */
	static parse(urlOrFileOrData: string | File | ArrayBuffer | Buffer, callback: (stlData: STLData) => void) {
		const self = this;
		if (typeof urlOrFileOrData === 'string') {
			// Could be url or ASCII string containing STL data.
			if (this._isURL(urlOrFileOrData)) {
				if (typeof window !== 'undefined') {
					// Browser.
					// Load the file with XMLHttpRequest.
					const request = new XMLHttpRequest();
					request.open('GET', urlOrFileOrData, true);
					request.responseType = 'arraybuffer';
					request.onload = () => {
						const stlData = self._parse(request.response as ArrayBuffer);
						// Call the callback function with the parsed mesh data.
						callback(stlData);
					};
					request.send();
				} else {
					// Nodejs.
					// Call the callback function with the parsed mesh data.
					import('fs').then((fs) => {
						const buffer = fs.readFileSync(urlOrFileOrData);
						callback(this._parse(new Uint8Array(buffer).buffer));
					});
				}
			} else {
				const stlData = this._parse(urlOrFileOrData);
				callback(stlData);
			}
		} else if (urlOrFileOrData instanceof Object && typeof (urlOrFileOrData as File).name == 'string') {
			// We only ever hit this in the browser.
			// Load the file with FileReader.
			if (!this.reader) this.reader = new FileReader();
			this.reader.onload = () => {
				const stlData = self._parse(this.reader!.result as ArrayBuffer);
				// Call the callback function with the parsed mesh data.
				callback(stlData);
			}
			this.reader.readAsArrayBuffer(urlOrFileOrData as File);
		} else {
			// Buffer/ArrayBuffer.
			const stlData = this._parse((urlOrFileOrData as Buffer).buffer ? new Uint8Array(urlOrFileOrData as Buffer).buffer : urlOrFileOrData as ArrayBuffer);
			callback(stlData);
		}
	}

	/**
	 * Returns a copy of the stl data, with coincident vertices merged.
	 */
	static mergeVertices(stlData: STLData): STLData {
		const { vertices, faceNormals } = stlData;
		const numFaces = vertices.length / 9;
		const verticesMerged: number[] = [];
		const facesIndexed = new Uint32Array(numFaces * 3);
		// Use hash to merge vertices.
		const vertexHash: { [key: string]: number } = {};
		for (let i = 0; i < numFaces; i++) {
			for (let j = 0; j < 3; j++) {
				const vertexIndex = 9 * i + 3 * j;
				const faceIndex = 3 * i;
				const positionX = vertices[vertexIndex];
				const positionY = vertices[vertexIndex + 1];
				const positionZ = vertices[vertexIndex + 2];
				const key = `${positionX},${positionY},${positionZ}`;
				let mergedVertexIndex = vertexHash[key];
				if (mergedVertexIndex !== undefined) {
					facesIndexed[faceIndex + j] = mergedVertexIndex;
				} else {
					// Add new vertex.
					mergedVertexIndex = verticesMerged.length / 3;
					facesIndexed[faceIndex + j] = mergedVertexIndex;
					vertexHash[key] = mergedVertexIndex;
					verticesMerged.push(positionX, positionY, positionZ);
				}
			}
		}
		return {
			...stlData,
			vertices: verticesMerged,
			faceIndices: facesIndexed,
		};
	}

	/**
	 * Returns the edges in the stl data (without duplicates).
	 */
	static calculateEdges(stlData: STLData) {
		const { vertices, faceIndices } = stlData;
		const numVertices = vertices.length / 3;
		if (faceIndices) {
			const numFaces = faceIndices.length / 3;
			// Use hash to calc edges.
			const edgesHash : { [key: string]: boolean } = {};
			const edges: number[] = [];
			for (let i = 0; i < numFaces; i++) {
				for (let j = 0; j < 3; j++) {
					const index1 = faceIndices[3 * i + j];
					const index2 = faceIndices[3 * i + (j + 1) % 3];
					const key = `${Math.min(index1, index2)},${Math.max(index1, index2)}`;
					// Only add each edge once.
					if (edgesHash[key] === undefined) {
						edgesHash[key] = true;
						edges.push(index1, index2);
					}
				}
			}
			return edges;
		}
		const numFaces = numVertices / 3;
		const edges = new Uint32Array(6 * numFaces);
		for (let i = 0; i < numFaces; i ++) {
			const faceIndex = 3 * i;
			for (let j = 0; j < 3; j++) {
				const edgeIndex = 6 * i + 2 * j;
				edges[edgeIndex] = faceIndex + j;
				edges[edgeIndex + 1] = faceIndex + (j + 1) % 3;
			}
		}
		return edges;
	}

	/**
	 * Returns the bounding box of the stl data.
	 */
	static calculateBoundingBox(stlData: STLData) {
		const { vertices } = stlData;
		const numVertices = vertices.length / 3;
		const min = [Infinity, Infinity, Infinity];
		const max = [-Infinity, -Infinity, -Infinity];
		for (let i = 0; i < numVertices; i++) {
			min[0] = Math.min(min[0], vertices[3 * i]);
			min[1] = Math.min(min[1], vertices[3 * i + 1]);
			min[2] = Math.min(min[2], vertices[3 * i + 2]);
			max[0] = Math.max(max[0], vertices[3 * i]);
			max[1] = Math.max(max[1], vertices[3 * i + 1]);
			max[2] = Math.max(max[2], vertices[3 * i + 2]);
		}
		return {
			min, max,
		};
	}

	/**
	 * Scales vertex positions to unit bounding box and centers around origin.
	 */
	static scaleVerticesToUnitBoundingBox(stlData: STLData) {
		const { vertices } = stlData;
		const { min, max } = this.calculateBoundingBox(stlData);
		const diff = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
		const center = [(max[0] + min[0]) / 2, (max[1] + min[1]) / 2, (max[2] + min[2]) / 2];
		const scale = Math.max(diff[0], diff[1], diff[2]);
		const scaledVerticesArray = vertices.slice();
		const numNodes = vertices.length / 3;
		for (let i = 0; i < numNodes; i++) {
			for (let j = 0; j < 3; j++) {
				// Uniform scale.
				scaledVerticesArray[3 * i + j] = (vertices[3 * i + j] - center[j]) / scale;
			}
		}
		return scaledVerticesArray;
	}
}