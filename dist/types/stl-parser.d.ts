/// <reference types="node" />
/**
 * Synchronously parse an already loaded .stl file buffer.
 */
export declare function parseSTL(data: Buffer | ArrayBuffer): STLMesh;
/**
 * Parse .stl file asynchronously (returns Promise).
 */
export declare function loadSTLAsync(urlOrFile: string | File): Promise<STLMesh>;
/**
 * Parse the .stl file at the specified file path or File object.
 */
export declare function loadSTL(urlOrFile: string | File, callback: (mesh: STLMesh) => void): void;
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
