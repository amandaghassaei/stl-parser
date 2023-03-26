/// <reference types="node" />
export type STLData = {
    vertices: Float32Array | number[];
    faceNormals: Float32Array | number[];
    faceColors?: Float32Array;
    faceIndices?: Uint32Array;
};
export declare class STLParser {
    static reader?: FileReader;
    constructor();
    private static _parseBinary;
    private static _parseASCII;
    private static _matchDataViewAt;
    private static _isBinary;
    private static _ensureBinary;
    private static _ensureString;
    private static _parse;
    private static _isURL;
    /**
     * Parse stl file asynchronously (returns Promise).
     */
    static parseAsync(urlOrFile: string | File | ArrayBuffer | Buffer): Promise<STLData>;
    /**
     * Parse the .stl file at the specified file path of File object.
     * Made this compatible with Node and the browser, maybe there is a better way?
     */
    static parse(urlOrFileOrData: string | File | ArrayBuffer | Buffer, callback: (stlData: STLData) => void): void;
    /**
     * Returns a copy of the stl data, with coincident vertices merged.
     */
    static mergeVertices(stlData: STLData): STLData;
    /**
     * Returns the edges in the stl data (without duplicates).
     */
    static calculateEdges(stlData: STLData): number[] | Uint32Array;
    /**
     * Returns the bounding box of the stl data.
     */
    static calculateBoundingBox(stlData: STLData): {
        min: number[];
        max: number[];
    };
    /**
     * Scales vertex positions to unit bounding box and centers around origin.
     */
    static scaleVerticesToUnitBoundingBox(stlData: STLData): Float32Array | number[];
}
