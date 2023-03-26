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
export declare function loadSTL(urlOrFile: string | File, callback: (stlMesh: STLMesh) => void): void;
export declare class STLMesh {
    private _vertices;
    readonly faceNormals: Float32Array | number[];
    readonly faceColors?: Float32Array;
    private _faceIndices?;
    private _edges?;
    private _boundingBox?;
    constructor(vertices: Float32Array | number[], faceNormals: Float32Array | number[], faceColors?: Float32Array);
    get vertices(): Float32Array | number[];
    set vertices(vertices: Float32Array | number[]);
    get faceIndices(): Uint32Array;
    set faceIndices(faceIndices: Uint32Array);
    /**
     * Merge coincident vertices and index faces.
     */
    mergeVertices(): this;
    /**
     * Returns the edges in the stl data (without duplicates).
     */
    get edges(): Uint32Array | number[];
    set edges(edges: Uint32Array | number[]);
    /**
     * Returns the bounding box of the mesh.
     */
    get boundingBox(): {
        min: number[];
        max: number[];
    };
    set boundingBox(boundingBox: {
        min: number[];
        max: number[];
    });
    /**
     * Scales vertex positions (in place) to unit bounding box and centers around origin.
     */
    scaleVerticesToUnitBoundingBox(): this;
}
