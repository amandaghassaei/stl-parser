/// <reference types="node" />
/**
 * Synchronously parse an already loaded .stl file buffer or string.
 */
export declare function parseSTL(data: Buffer | ArrayBuffer | string): STLMesh;
/**
 * Load and parse the .stl asynchronously from a specified url or File object (returns Promise).
 */
export declare function loadSTLAsync(urlOrFile: string | File): Promise<STLMesh>;
/**
 * Load and parse the .stl from a specified url or File object.
 */
export declare function loadSTL(urlOrFile: string | File, callback: (mesh: STLMesh) => void): void;
export type STLMesh = {
    readonly vertices: Float32Array;
    readonly facesNormals: Float32Array;
    readonly edgesIndices: Uint32Array;
    readonly facesColors?: Float32Array;
    readonly facesIndices: Uint32Array;
    readonly boundingBox: {
        min: [number, number, number];
        max: [number, number, number];
    };
    mergeVertices: () => STLMesh;
    scaleVerticesToUnitBoundingBox: () => STLMesh;
};
