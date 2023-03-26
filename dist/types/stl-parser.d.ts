/// <reference types="node" />
export declare function parseSTL(data: Buffer | ArrayBuffer | string): STLMesh;
/**
 * Parse stl file asynchronously (returns Promise).
 */
export declare function loadSTLAsync(urlOrFile: string | File): Promise<STLMesh>;
/**
 * Parse the .stl file at the specified file path of File object.
 * Made this compatible with Node and the browser, maybe there is a better way?
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
