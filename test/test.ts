import { expect } from 'chai';
import { readFileSync } from 'fs';
import { STLData, STLParser } from '../';

const cubeAscii = readFileSync('./test/stl/cubeAscii.stl');
const cubeBinary = readFileSync('./test/stl/cubeBinary.stl');

describe('STLParser', () => {
	describe('parse', () => {
		it('parses cubeAscii data', () => {
			const stlData = STLParser.parse(cubeAscii);
			const {
				vertices,
				faceNormals,
				faceColors,
			} = stlData;
			expect(vertices.length).to.equal(12 * 9);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors).to.equal(undefined);
			expect(vertices.slice(0, 3)).to.deep.equal([10, 0, -10]);
			expect(faceNormals.slice(0, 3)).to.deep.equal([0, 0, -1]);
		});
		it('parses cubeBinary data', () => {
			const stlData = STLParser.parse(cubeBinary);
			const {
				vertices,
				faceNormals,
				faceColors,
			} = stlData;
			expect(vertices.length).to.equal(12 * 9);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors!.length).to.equal(12 * 3);
			expect(vertices.slice(0, 3)).to.deep.equal(new Float32Array([10, 0, -10]));
			expect(faceNormals.slice(0, 3)).to.deep.equal(new Float32Array([0, 0, -1]));
			expect(faceColors!.slice(0, 3)).to.deep.equal(new Float32Array([0.6129032373428345, 0.6129032373428345, 0.6129032373428345]));
		});
	});
	describe('load', () => {
		it('loads cubeAscii.stl', async () => {
			const stlData = await new Promise<STLData>(resolve => {
				STLParser.load('./test/stl/cubeAscii.stl', resolve);
			});
			const {
				vertices,
				faceNormals,
				faceColors,
			} = stlData;
			expect(vertices.length).to.equal(12 * 9);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors).to.equal(undefined);
			expect(vertices.slice(0, 3)).to.deep.equal([10, 0, -10]);
			expect(faceNormals.slice(0, 3)).to.deep.equal([0, 0, -1]);
		});
		it('loads cubeBinary.stl', async () => {
			const stlData = await new Promise<STLData>(resolve => {
				STLParser.load('./test/stl/cubeBinary.stl', resolve);
			});
			const {
				vertices,
				faceNormals,
				faceColors,
			} = stlData;
			expect(vertices.length).to.equal(12 * 9);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors!.length).to.equal(12 * 3);
			expect(vertices.slice(0, 3)).to.deep.equal(new Float32Array([10, 0, -10]));
			expect(faceNormals.slice(0, 3)).to.deep.equal(new Float32Array([0, 0, -1]));
			expect(faceColors!.slice(0, 3)).to.deep.equal(new Float32Array([0.6129032373428345, 0.6129032373428345, 0.6129032373428345]));
		});
	});
	describe('loadAsync', () => {
		it('loads cubeAscii.stl', async () => {
			const stlData = await STLParser.loadAsync('./test/stl/cubeAscii.stl');
			const {
				vertices,
				faceNormals,
				faceColors,
			} = stlData;
			expect(vertices.length).to.equal(12 * 9);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors).to.equal(undefined);
			expect(vertices.slice(0, 3)).to.deep.equal([10, 0, -10]);
			expect(faceNormals.slice(0, 3)).to.deep.equal([0, 0, -1]);
		});
		it('loads cubeBinary.stl', async () => {
			const stlData = await STLParser.loadAsync('./test/stl/cubeBinary.stl');
			const {
				vertices,
				faceNormals,
				faceColors,
			} = stlData;
			expect(vertices.length).to.equal(12 * 9);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors!.length).to.equal(12 * 3);
			expect(vertices.slice(0, 3)).to.deep.equal(new Float32Array([10, 0, -10]));
			expect(faceNormals.slice(0, 3)).to.deep.equal(new Float32Array([0, 0, -1]));
			expect(faceColors!.slice(0, 3)).to.deep.equal(new Float32Array([0.6129032373428345, 0.6129032373428345, 0.6129032373428345]));
		});
	});
	describe('helper functions', () => {
		it('merges vertices and indexed faces', async () => {
			const stlData = await STLParser.loadAsync('./test/stl/cubeAscii.stl');
			const {
				vertices,
				faceNormals,
				faceColors,
				faceIndices,
			} = STLParser.mergeVertices(stlData);
			expect(vertices.length).to.equal(8 * 3);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors).to.equal(undefined);
			expect(faceIndices).to.deep.equal(new Uint32Array([
				0, 1, 2, 2, 1, 3, 4, 0, 5,
				5, 0, 2, 6, 4, 7, 7, 4, 5,
				1, 6, 3, 3, 6, 7, 3, 7, 2,
				2, 7, 5, 1, 0, 6, 6, 0, 4
			]));			
		});
		it('calculates edges', () => {
			{
				const stlData = STLParser.parse(cubeAscii);
				let edges = STLParser.calculateEdges(stlData);
				expect(edges).to.deep.equal(new Uint32Array([
					0,  1,  1,  2,  2,  0,  3,  4,  4,  5,  5,  3,
					6,  7,  7,  8,  8,  6,  9, 10, 10, 11, 11,  9,
					12, 13, 13, 14, 14, 12, 15, 16, 16, 17, 17, 15,
					18, 19, 19, 20, 20, 18, 21, 22, 22, 23, 23, 21,
					24, 25, 25, 26, 26, 24, 27, 28, 28, 29, 29, 27,
					30, 31, 31, 32, 32, 30, 33, 34, 34, 35, 35, 33
				]));
				expect(edges.length).to.equal(stlData.vertices.length / 3 * 2);
				const stlDataMerged = STLParser.mergeVertices(stlData);
				edges = STLParser.calculateEdges(stlDataMerged);
				expect(edges).to.deep.equal([
					0, 1, 1, 2, 2, 0, 1, 3, 3,
					2, 4, 0, 0, 5, 5, 4, 2, 5,
					6, 4, 4, 7, 7, 6, 5, 7, 1,
					6, 6, 3, 7, 3, 7, 2, 0, 6
				]);
				expect(edges.length).to.equal(stlDataMerged.faceIndices!.length);
			}
			{
				const stlData = STLParser.parse(cubeBinary);
				let edges = STLParser.calculateEdges(stlData);
				expect(edges).to.deep.equal(new Uint32Array([
					0,  1,  1,  2,  2,  0,  3,  4,  4,  5,  5,  3,
					6,  7,  7,  8,  8,  6,  9, 10, 10, 11, 11,  9,
					12, 13, 13, 14, 14, 12, 15, 16, 16, 17, 17, 15,
					18, 19, 19, 20, 20, 18, 21, 22, 22, 23, 23, 21,
					24, 25, 25, 26, 26, 24, 27, 28, 28, 29, 29, 27,
					30, 31, 31, 32, 32, 30, 33, 34, 34, 35, 35, 33
				]));
				expect(edges.length).to.equal(stlData.vertices.length / 3 * 2);
				const stlDataMerged = STLParser.mergeVertices(stlData);
				edges = STLParser.calculateEdges(stlDataMerged);
				expect(edges).to.deep.equal([
					0, 1, 1, 2, 2, 0, 1, 3, 3,
					2, 4, 0, 0, 5, 5, 4, 2, 5,
					6, 4, 4, 7, 7, 6, 5, 7, 1,
					6, 6, 3, 7, 3, 7, 2, 0, 6
				]);
				expect(edges.length).to.equal(stlDataMerged.faceIndices!.length);
			}
		});
		it('calculates bounding box', () => {
			{
				const stlData = STLParser.parse(cubeAscii);
				const { min, max } = STLParser.calculateBoundingBox(stlData);
				expect(min).to.deep.equal([0, 0, -10]);
				expect(max).to.deep.equal([10, 10, 0]);
			}
			{
				const stlData = STLParser.parse(cubeBinary);
				const { min, max } = STLParser.calculateBoundingBox(stlData);
				expect(min).to.deep.equal([0, 0, -10]);
				expect(max).to.deep.equal([10, 10, 0]);
			}
		});
		it('scales the vertex positions to unit bounding box', () => {
			{
				const stlData = STLParser.parse(cubeAscii);
				stlData.vertices = STLParser.scaleVerticesToUnitBoundingBox(stlData);
				const { min, max } = STLParser.calculateBoundingBox(stlData);
				expect(min).to.deep.equal([-0.5, -0.5, -0.5]);
				expect(max).to.deep.equal([0.5, 0.5, 0.5]);
			}
			{
				const stlData = STLParser.parse(cubeBinary);
				stlData.vertices = STLParser.scaleVerticesToUnitBoundingBox(stlData);
				const { min, max } = STLParser.calculateBoundingBox(stlData);
				expect(min).to.deep.equal([-0.5, -0.5, -0.5]);
				expect(max).to.deep.equal([0.5, 0.5, 0.5]);
			}
		});
	});
});