# stl-parser
[![stl-parser main image](./main-image.jpg)](https://apps.amandaghassaei.com/stl-parser/demo/)

[![NPM Package](https://img.shields.io/npm/v/stl-parser)](https://www.npmjs.com/package/stl-parser)
[![Build Size](https://img.shields.io/bundlephobia/min/stl-parser)](https://bundlephobia.com/result?p=stl-parser)
[![NPM Downloads](https://img.shields.io/npm/dw/stl-parser)](https://www.npmtrends.com/stl-parser)
[![License](https://img.shields.io/npm/l/stl-parser)](https://github.com/amandaghassaei/stl-parser/blob/main/LICENSE.txt)

STL format parser, based on [Threejs STLLoader](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/STLLoader.js), written in TypeScript.

Live demo: [apps.amandaghassaei.com/stl-parser/demo/](https://apps.amandaghassaei.com/stl-parser/demo/)


## .stl File Format

The .stl file format is used for storing 3D triangulated meshes.  This library does not generate .stl files, but it will allow you to parse them in a browser or nodejs environment.  You can view .stl files by dragging them into the [demo app](https://apps.amandaghassaei.com/stl-parser/demo/).  Example .stl files can be found in [test/stl/](https://github.com/amandaghassaei/stl-parser/tree/main/test/stl).


## Installation

### Install via npm

```sh
npm install stl-parser
```

and import into your project:

```js
import { STLParser } from 'stl-parser';
```

### Import into HTML

Import [stl-parser.js](https://github.com/amandaghassaei/stl-parser/blob/main/dist/stl-parser.js) directly into your html:

```html
<html>
  <head>
    <script src="stl-parser.js"></script>
  </head>
  <body>
  </body>
</html>
```

`STLParserLib` will be accessible globally:

```js
const { STLParser } = STLParserLib;
```


## Use

```js
// Create a new parser instance,
const parser = new STLParser();
// Parse the .stl file using the specified file path.
parser.parse('./teapot.stl', (mesh) => {
  const {
    vertices,
    faceNormals,
    faceColors,
  } = mesh;
});

// Also try:
// const mesh = await parser.parseAsync('./teapot.stl');
// Nodejs only:
// const mesh = parser.parseSync('./teapot.stl');
```

- `vertices` is an array of length 3 * numVertices containing a flat list of vertex positions in the following order `[x0, y0, z0, x1, y1, z1, ...]`.  Each group of three vertices make up a triangle in the .stl mesh.
- `faceNormals` is an array of length 3 * numFaces containing a flat list of face normals in the following order `[nx0, ny0, nz0, nx1, ny1, nz1, ...]`
- If available, `faceColors` is an array of length 3 * numFaces containing a flat list of face colors in the following order `[r0, g0, b0, r1, g1, b1, ...]`.  .stl files without color information will not return a `faceColors` array.


stl-parser also contains helper functions for analyzing the mesh data:


- `STLParser.mergeVertices(mesh)` returns a copy of the .stl mesh data with the coincident vertices merged and `faceIndices` array containing face vertex indices.  faceIndices has length 3 * numFaces is in the form: `[v01, v02, v03, v10, v11, v12, ...]`.  Each group of three vertex indices make up a triangle in the .stl mesh.
- `STLParser.calculateEdges(mesh)` returns an array containing all pairs of edges in the mesh.  Vertex indices are in the form: `[e01, e02, e11, e12, ...]`.
- `STLParser.calculateBoundingBox(mesh)` returns the min and max of the mesh's bounding box.  min and max are in the form: `[x, y, z]`.
- `STLParser.scaleVerticesToUnitBoundingBox(mesh)` returns the a copy of `vertices`, with the values scaled to fit inside a unit box and centered around the origin.


## Limitations

- See limitations listed in [Threejs STLLoader](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/STLLoader.js).  Pull requests welcome.


## Acknowledgements

- This is a TypeScript port of the .stl parser from [Threejs](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/STLLoader.js)


## License

This work is licensed under an [MIT License](https://github.com/amandaghassaei/stl-parser/blob/main/LICENSE.txt).


## Development

I don't have any plans to continue developing this package, but I'm happy to review pull requests if you would like to add a new feature.

To install dev dependencies:

```sh
npm install
```

To compile `src` to `dist`:

```sh
npm run build
```

### Testing

To run tests:

```sh
npm run test
```
