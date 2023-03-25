(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.STLParserLib = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    // Parsing code is based on:
    // https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/STLLoader.js
    var STLParser = /** @class */ (function () {
        function STLParser() {
        }
        STLParser._parseBinary = function (data) {
            var reader = new DataView(data);
            var numFaces = reader.getUint32(80, true);
            var hasColors = false;
            var faceColors;
            var defaultR = 0;
            var defaultG = 0;
            var defaultB = 0;
            // let alpha: number;
            // process STL header
            // check for default color in header ("COLOR=rgba" sequence).
            for (var index = 0; index < 80 - 10; index++) {
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
            var dataOffset = 84;
            var faceLength = 12 * 4 + 2;
            var vertices = new Float32Array(numFaces * 3 * 3);
            var faceNormals = new Float32Array(numFaces * 3);
            for (var faceIndex = 0; faceIndex < numFaces; faceIndex++) {
                var start = dataOffset + faceIndex * faceLength;
                var index = 3 * faceIndex;
                faceNormals[index] = reader.getFloat32(start, true);
                faceNormals[index + 1] = reader.getFloat32(start + 4, true);
                faceNormals[index + 2] = reader.getFloat32(start + 8, true);
                if (hasColors) {
                    var packedColor = reader.getUint16(start + 48, true);
                    if ((packedColor & 0x8000) === 0) {
                        // facet has its own unique color
                        faceColors[index] = (packedColor & 0x1F) / 31;
                        faceColors[index + 1] = ((packedColor >> 5) & 0x1F) / 31;
                        faceColors[index + 2] = ((packedColor >> 10) & 0x1F) / 31;
                    }
                    else {
                        faceColors[index] = defaultR;
                        faceColors[index + 1] = defaultG;
                        faceColors[index + 2] = defaultB;
                    }
                }
                for (var i = 1; i <= 3; i++) {
                    var vertexStart = start + i * 12;
                    var componentIndex = (faceIndex * 3 * 3) + ((i - 1) * 3);
                    vertices[componentIndex] = reader.getFloat32(vertexStart, true);
                    vertices[componentIndex + 1] = reader.getFloat32(vertexStart + 4, true);
                    vertices[componentIndex + 2] = reader.getFloat32(vertexStart + 8, true);
                }
            }
            return {
                vertices: vertices,
                faceNormals: faceNormals,
                faceColors: faceColors,
            };
        };
        STLParser._parseASCII = function (data) {
            var patternSolid = /solid([\s\S]*?)endsolid/g;
            var patternFace = /facet([\s\S]*?)endfacet/g;
            var faceCounter = 0;
            var patternFloat = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source;
            var patternVertex = new RegExp('vertex' + patternFloat + patternFloat + patternFloat, 'g');
            var patternNormal = new RegExp('normal' + patternFloat + patternFloat + patternFloat, 'g');
            var vertices = [];
            var faceNormals = [];
            var result;
            while ((result = patternSolid.exec(data)) !== null) {
                var solid = result[0];
                while ((result = patternFace.exec(solid)) !== null) {
                    var vertexCountPerFace = 0;
                    var normalCountPerFace = 0;
                    var text = result[0];
                    while ((result = patternNormal.exec(text)) !== null) {
                        // every face have to own ONE valid normal
                        if (normalCountPerFace > 0)
                            throw new Error('stl-parser: Something isn\'t right with the normal of face number ' + faceCounter);
                        faceNormals.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
                        normalCountPerFace++;
                    }
                    while ((result = patternVertex.exec(text)) !== null) {
                        vertices.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
                        vertexCountPerFace++;
                    }
                    // each face have to own THREE valid vertices
                    if (vertexCountPerFace !== 3) {
                        console.error('stl-parser: Something isn\'t right with the vertices of face number ' + faceCounter);
                    }
                    faceCounter++;
                }
            }
            return {
                vertices: vertices,
                faceNormals: faceNormals,
            };
        };
        STLParser._matchDataViewAt = function (query, reader, offset) {
            // Check if each byte in query matches the corresponding byte from the current offset.
            for (var i = 0, il = query.length; i < il; i++) {
                if (query[i] !== reader.getUint8(offset + i))
                    return false;
            }
            return true;
        };
        STLParser._isBinary = function (data) {
            var reader = new DataView(data);
            var face_size = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8);
            var n_faces = reader.getUint32(80, true);
            var expect = 80 + (32 / 8) + (n_faces * face_size);
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
            var solid = [115, 111, 108, 105, 100];
            for (var offset = 0; offset < 5; offset++) {
                // If "solid" text is matched to the current offset, declare it to be an ASCII STL.
                if (STLParser._matchDataViewAt(solid, reader, offset))
                    return false;
            }
            // Couldn't find "solid" text at the beginning; it is binary STL.
            return true;
        };
        STLParser._ensureBinary = function (buffer) {
            if (typeof buffer === 'string') {
                var array_buffer = new Uint8Array(buffer.length);
                for (var i = 0; i < buffer.length; i++) {
                    array_buffer[i] = buffer.charCodeAt(i) & 0xff; // implicitly assumes little-endian
                }
                return array_buffer.buffer || array_buffer;
            }
            else {
                return buffer;
            }
        };
        STLParser._ensureString = function (buffer) {
            if (typeof buffer !== 'string') {
                return new TextDecoder().decode(buffer);
            }
            return buffer;
        };
        STLParser.prototype._parse = function (data) {
            var binData = STLParser._ensureBinary(data);
            return STLParser._isBinary(binData) ?
                STLParser._parseBinary(binData) :
                STLParser._parseASCII(STLParser._ensureString(data));
        };
        /**
         * Parse stl file synchronously (node only).
         */
        STLParser.prototype.parseSync = function (url) {
            if (typeof window !== 'undefined') {
                throw new Error('Cannot call STLParser.parseSync() from a browser.');
            }
            // Load the file with fs.
            var fs = require('fs');
            var fileBuffer = fs.readFileSync(url);
            return this._parse(Buffer.from(fileBuffer).buffer);
        };
        /**
         * Parse stl file asynchronously (returns Promise).
         */
        STLParser.prototype.parseAsync = function (urlOrFile) {
            var self = this;
            return new Promise(function (resolve) {
                self.parse(urlOrFile, function (mesh) {
                    resolve(mesh);
                });
            });
        };
        /**
         * Parse the .stl file at the specified file path of File object.
         * Made this compatible with Node and the browser, maybe there is a better way?
         */
        STLParser.prototype.parse = function (urlOrFile, callback) {
            var self = this;
            if (typeof urlOrFile === 'string') {
                if (typeof window !== 'undefined') {
                    // Load the file with XMLHttpRequest.
                    var request_1 = new XMLHttpRequest();
                    request_1.open('GET', urlOrFile, true);
                    request_1.responseType = 'arraybuffer';
                    request_1.onload = function () {
                        var stlData = self._parse(request_1.response);
                        // Call the callback function with the parsed mesh data.
                        callback(stlData);
                    };
                    request_1.send();
                }
                else {
                    // Call the callback function with the parsed mesh data.
                    callback(this.parseSync(urlOrFile));
                }
            }
            else {
                // We only ever hit this in the browser.
                // Load the file with FileReader.
                if (!STLParser.reader)
                    STLParser.reader = new FileReader();
                STLParser.reader.onload = function () {
                    var data = self._parse(STLParser.reader.result);
                    // Call the callback function with the parsed mesh data.
                    callback(data);
                };
                STLParser.reader.readAsArrayBuffer(urlOrFile);
            }
        };
        /**
         * Returns a copy of the stl data, with coincident vertices merged.
         */
        STLParser.mergeVertices = function (stlData) {
            var vertices = stlData.vertices; stlData.faceNormals;
            var numFaces = vertices.length / 9;
            var verticesMerged = [];
            var facesIndexed = new Uint32Array(numFaces * 3);
            // Use hash to merge vertices.
            var vertexHash = {};
            for (var i = 0; i < numFaces; i++) {
                for (var j = 0; j < 3; j++) {
                    var vertexIndex = 9 * i + 3 * j;
                    var faceIndex = 3 * i;
                    var positionX = vertices[vertexIndex];
                    var positionY = vertices[vertexIndex + 1];
                    var positionZ = vertices[vertexIndex + 2];
                    var key = "".concat(positionX, ",").concat(positionY, ",").concat(positionZ);
                    var mergedVertexIndex = vertexHash[key];
                    if (mergedVertexIndex !== undefined) {
                        facesIndexed[faceIndex + j] = mergedVertexIndex;
                    }
                    else {
                        // Add new vertex.
                        mergedVertexIndex = verticesMerged.length / 3;
                        facesIndexed[faceIndex + j] = mergedVertexIndex;
                        vertexHash[key] = mergedVertexIndex;
                        verticesMerged.push(positionX, positionY, positionZ);
                    }
                }
            }
            return __assign(__assign({}, stlData), { vertices: verticesMerged, faceIndices: facesIndexed });
        };
        /**
         * Returns the edges in the stl data (without duplicates).
         */
        STLParser.calculateEdges = function (stlData) {
            var vertices = stlData.vertices, faceIndices = stlData.faceIndices;
            var numVertices = vertices.length / 3;
            if (faceIndices) {
                var numFaces_1 = faceIndices.length / 3;
                // Use hash to calc edges.
                var edgesHash = {};
                var edges_1 = [];
                for (var i = 0; i < numFaces_1; i++) {
                    for (var j = 0; j < 3; j++) {
                        var index1 = faceIndices[3 * i + j];
                        var index2 = faceIndices[3 * i + (j + 1) % 3];
                        var key = "".concat(Math.min(index1, index2), ",").concat(Math.max(index1, index2));
                        // Only add each edge once.
                        if (edgesHash[key] === undefined) {
                            edgesHash[key] = true;
                            edges_1.push(index1, index2);
                        }
                    }
                }
                return edges_1;
            }
            var numFaces = numVertices / 3;
            var edges = new Uint32Array(6 * numFaces);
            for (var i = 0; i < numFaces; i++) {
                var faceIndex = 3 * i;
                for (var j = 0; j < 3; j++) {
                    var edgeIndex = 6 * i + 2 * j;
                    edges[edgeIndex] = faceIndex + j;
                    edges[edgeIndex + 1] = faceIndex + (j + 1) % 3;
                }
            }
            return edges;
        };
        /**
         * Returns the bounding box of the stl data.
         */
        STLParser.calculateBoundingBox = function (stlData) {
            var vertices = stlData.vertices;
            var numVertices = vertices.length / 3;
            var min = [Infinity, Infinity, Infinity];
            var max = [-Infinity, -Infinity, -Infinity];
            for (var i = 0; i < numVertices; i++) {
                min[0] = Math.min(min[0], vertices[3 * i]);
                min[1] = Math.min(min[1], vertices[3 * i + 1]);
                min[2] = Math.min(min[2], vertices[3 * i + 2]);
                max[0] = Math.max(max[0], vertices[3 * i]);
                max[1] = Math.max(max[1], vertices[3 * i + 1]);
                max[2] = Math.max(max[2], vertices[3 * i + 2]);
            }
            return {
                min: min,
                max: max,
            };
        };
        /**
         * Scales vertex positions to unit bounding box and centers around origin.
         */
        STLParser.scaleVerticesToUnitBoundingBox = function (stlData) {
            var vertices = stlData.vertices;
            var _a = STLParser.calculateBoundingBox(stlData), min = _a.min, max = _a.max;
            var diff = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
            var center = [(max[0] + min[0]) / 2, (max[1] + min[1]) / 2, (max[2] + min[2]) / 2];
            var scale = Math.max(diff[0], diff[1], diff[2]);
            var scaledVerticesArray = vertices.slice();
            var numNodes = vertices.length / 3;
            for (var i = 0; i < numNodes; i++) {
                for (var j = 0; j < 3; j++) {
                    // Uniform scale.
                    scaledVerticesArray[3 * i + j] = (vertices[3 * i + j] - center[j]) / scale;
                }
            }
            return scaledVerticesArray;
        };
        return STLParser;
    }());

    exports.STLParser = STLParser;

}));
//# sourceMappingURL=stl-parser.js.map
