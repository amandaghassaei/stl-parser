/// <reference types="node" />
/**
 * Synchronously parse an already loaded .stl file buffer or string.
 */
export declare function parseSTL(data: Buffer | ArrayBuffer | string): STLMesh;
/**
 * Load and parse the .stl asynchronously from a specified url or File object (returns Promise).
 */
export declare function loadSTLAsync(urlOrFile: string | File): Promise<STLMesh>;
export type STLMesh = {
    readonly vertices: Float32Array | number[];
    readonly faceNormals: Float32Array | number[];
    readonly edges: Uint32Array | number[];
    readonly faceColors?: Float32Array;
    readonly faceIndices: Uint32Array;
    readonly boundingBox: {
        min: number[];
        max: number[];
    };
    mergeVertices: () => STLMesh;
    scaleVerticesToUnitBoundingBox: () => STLMesh;
};
/**
 * Load and parse the .stl from a specified url or File object.
 */
export declare function loadSTL(urlOrFile: string | File, callback: (mesh: STLMesh) => void): void;
