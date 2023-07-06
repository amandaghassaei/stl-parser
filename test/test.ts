import { expect } from 'chai';
import { readFileSync } from 'fs';
import { parseSTL, loadSTL, loadSTLAsync, STLMesh } from '../src/stl-parser';

import { cubeString } from './stl/cubeString';
const cubeAscii = readFileSync('./test/stl/cubeAscii.stl');
const cubeBinary = readFileSync('./test/stl/cubeBinary.stl');


describe('stl-parser', () => {
	describe('parseSTL', () => {
		it('parses cube ascii data', () => {
			const {
				vertices,
				faceNormals,
				faceColors,
			} = parseSTL(cubeAscii);
			expect(vertices.length).to.equal(12 * 9);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors).to.equal(undefined);
			expect(vertices.slice(0, 3)).to.deep.equal(new Float32Array([10, 0, -10]));
			expect(faceNormals.slice(0, 3)).to.deep.equal(new Float32Array([0, 0, -1]));
		});
		it('parses cube binary data', () => {
			const {
				vertices,
				faceNormals,
				faceColors,
			} = parseSTL(cubeBinary);;
			expect(vertices.length).to.equal(12 * 9);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors!.length).to.equal(12 * 3);
			expect(vertices.slice(0, 3)).to.deep.equal(new Float32Array([10, 0, -10]));
			expect(faceNormals.slice(0, 3)).to.deep.equal(new Float32Array([0, 0, -1]));
			expect(faceColors!.slice(0, 3)).to.deep.equal(new Float32Array([0.6129032373428345, 0.6129032373428345, 0.6129032373428345]));
		});
		it('parses cube string data', () => {
			const {
				vertices,
				faceNormals,
				faceColors,
			} = parseSTL(cubeString);
			expect(vertices.length).to.equal(12 * 9);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors).to.equal(undefined);
			expect(vertices.slice(0, 3)).to.deep.equal(new Float32Array([10, 0, -10]));
			expect(faceNormals.slice(0, 3)).to.deep.equal(new Float32Array([0, 0, -1]));
		});
	});
	describe('loadSTL', () => {
		it('loads cubeAscii.stl', async () => {
			const stlData = await new Promise<STLMesh>(resolve => {
				loadSTL('./test/stl/cubeAscii.stl', resolve);
			});
			const {
				vertices,
				faceNormals,
				faceColors,
			} = stlData;
			expect(vertices.length).to.equal(12 * 9);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors).to.equal(undefined);
			expect(vertices.slice(0, 3)).to.deep.equal(new Float32Array([10, 0, -10]));
			expect(faceNormals.slice(0, 3)).to.deep.equal(new Float32Array([0, 0, -1]));
		});
		it('loads cubeBinary.stl', async () => {
			const stlData = await new Promise<STLMesh>(resolve => {
				loadSTL('./test/stl/cubeBinary.stl', resolve);
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
	describe('loadSTLAsync', () => {
		it('loads cubeAscii.stl', async () => {
			const {
				vertices,
				faceNormals,
				faceColors,
			} = await loadSTLAsync('./test/stl/cubeAscii.stl');
			expect(vertices.length).to.equal(12 * 9);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors).to.equal(undefined);
			expect(vertices.slice(0, 3)).to.deep.equal(new Float32Array([10, 0, -10]));
			expect(faceNormals.slice(0, 3)).to.deep.equal(new Float32Array([0, 0, -1]));
		});
		it('loads cubeBinary.stl', async () => {
			const {
				vertices,
				faceNormals,
				faceColors,
			} = await loadSTLAsync('./test/stl/cubeBinary.stl');
			expect(vertices.length).to.equal(12 * 9);
			expect(faceNormals.length).to.equal(12 * 3);
			expect(faceColors!.length).to.equal(12 * 3);
			expect(vertices.slice(0, 3)).to.deep.equal(new Float32Array([10, 0, -10]));
			expect(faceNormals.slice(0, 3)).to.deep.equal(new Float32Array([0, 0, -1]));
			expect(faceColors!.slice(0, 3)).to.deep.equal(new Float32Array([0.6129032373428345, 0.6129032373428345, 0.6129032373428345]));
		});
	});
	describe('methods', () => {
		it('merges vertices and indexed faces', async () => {
			const {
				vertices,
				faceNormals,
				faceColors,
				faceIndices,
			} = (await loadSTLAsync('./test/stl/cubeAscii.stl')).mergeVertices();
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
				const mesh = parseSTL(cubeAscii);
				expect(mesh.edges).to.deep.equal(new Uint32Array([
					0,  1,  1,  2,  2,  0,  3,  4,  4,  5,  5,  3,
					6,  7,  7,  8,  8,  6,  9, 10, 10, 11, 11,  9,
					12, 13, 13, 14, 14, 12, 15, 16, 16, 17, 17, 15,
					18, 19, 19, 20, 20, 18, 21, 22, 22, 23, 23, 21,
					24, 25, 25, 26, 26, 24, 27, 28, 28, 29, 29, 27,
					30, 31, 31, 32, 32, 30, 33, 34, 34, 35, 35, 33
				]));
				expect(mesh.edges.length).to.equal(mesh.vertices.length / 3 * 2);
				mesh.mergeVertices();
				expect(mesh.edges).to.deep.equal(new Uint32Array([
					0, 1, 1, 2, 2, 0, 1, 3, 3,
					2, 4, 0, 0, 5, 5, 4, 2, 5,
					6, 4, 4, 7, 7, 6, 5, 7, 1,
					6, 6, 3, 7, 3, 7, 2, 0, 6
				]));
				expect(mesh.edges.length).to.equal(mesh.faceIndices.length);
			}
			{
				const mesh = parseSTL(cubeBinary);
				expect(mesh.edges).to.deep.equal(new Uint32Array([
					0,  1,  1,  2,  2,  0,  3,  4,  4,  5,  5,  3,
					6,  7,  7,  8,  8,  6,  9, 10, 10, 11, 11,  9,
					12, 13, 13, 14, 14, 12, 15, 16, 16, 17, 17, 15,
					18, 19, 19, 20, 20, 18, 21, 22, 22, 23, 23, 21,
					24, 25, 25, 26, 26, 24, 27, 28, 28, 29, 29, 27,
					30, 31, 31, 32, 32, 30, 33, 34, 34, 35, 35, 33
				]));
				expect(mesh.edges.length).to.equal(mesh.vertices.length / 3 * 2);
				mesh.mergeVertices();
				expect(mesh.edges).to.deep.equal(new Uint32Array([
					0, 1, 1, 2, 2, 0, 1, 3, 3,
					2, 4, 0, 0, 5, 5, 4, 2, 5,
					6, 4, 4, 7, 7, 6, 5, 7, 1,
					6, 6, 3, 7, 3, 7, 2, 0, 6
				]));
				expect(mesh.edges.length).to.equal(mesh.faceIndices.length);
			}
		});
		it('calculates bounding box', () => {
			{
				const { min, max } = parseSTL(cubeAscii).boundingBox;
				expect(min).to.deep.equal([0, 0, -10]);
				expect(max).to.deep.equal([10, 10, 0]);
			}
			{
				const { min, max } = parseSTL(cubeBinary).boundingBox;
				expect(min).to.deep.equal([0, 0, -10]);
				expect(max).to.deep.equal([10, 10, 0]);
			}
		});
		it('scales the vertex positions to unit bounding box', () => {
			{
				const mesh = parseSTL(cubeAscii);
				{
					const { min, max } = mesh.boundingBox;
					expect(min).to.deep.equal([0, 0, -10]);
					expect(max).to.deep.equal([10, 10, 0]);
				}
				{
					const { min, max } = mesh.scaleVerticesToUnitBoundingBox().boundingBox;
					expect(min).to.deep.equal([-0.5, -0.5, -0.5]);
					expect(max).to.deep.equal([0.5, 0.5, 0.5]);
				}
			}
			{
				const { min, max } = parseSTL(cubeBinary).scaleVerticesToUnitBoundingBox().boundingBox;
				expect(min).to.deep.equal([-0.5, -0.5, -0.5]);
				expect(max).to.deep.equal([0.5, 0.5, 0.5]);
			}
		});
		it('throws errors for invalid setters', () => {
			const mesh = parseSTL(cubeAscii);
			// @ts-ignore
			expect(() => {mesh.vertices = new Float32Array(10)}).to.throw(Error, 'stl-parser: No vertices setter.');
			// @ts-ignore
			expect(() => {mesh.edges = new Uint32Array(10)}).to.throw(Error, 'stl-parser: No edges setter.');
			// @ts-ignore
			expect(() => {mesh.faceIndices = new Uint32Array(10)}).to.throw(Error, 'stl-parser: No faceIndices setter.');
			// @ts-ignore
			expect(() => {mesh.boundingBox = { min: [0, 0, 0], max: [24, 24, 24] }}).to.throw(Error, 'stl-parser: No boundingBox setter.')
		});
	});
});