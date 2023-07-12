# @amandaghassaei/stl-parser
[![stl-parser main image](./main-image.jpg)](https://apps.amandaghassaei.com/stl-parser/demo/)

[![NPM Package](https://img.shields.io/npm/v/@amandaghassaei/stl-parser)](https://www.npmjs.com/package/@amandaghassaei/stl-parser)
[![Build Size](https://img.shields.io/bundlephobia/min/@amandaghassaei/stl-parser)](https://bundlephobia.com/result?p=@amandaghassaei/stl-parser)
[![NPM Downloads](https://img.shields.io/npm/dw/@amandaghassaei/stl-parser)](https://www.npmtrends.com/@amandaghassaei/stl-parser)
[![License](https://img.shields.io/npm/l/@amandaghassaei/stl-parser)](https://github.com/amandaghassaei/stl-parser/blob/main/LICENSE.txt)
![](https://img.shields.io/badge/Coverage-96%25-83A603.svg?prefix=$coverage$)

Standalone module for loading and parsing binary/ASCII STL files – unit tested and written in TypeScript.  Parsing code based on [Threejs STLLoader](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/STLLoader.js).

Live demo: [apps.amandaghassaei.com/stl-parser/demo/](https://apps.amandaghassaei.com/stl-parser/demo/)


## STL File Format

The .stl file format stores geometry (and sometimes color) information for 3D triangulated meshes.  stl-parser does not generate or render .stl files, but it will allow you to parse them in a browser or Nodejs environment.  Example .stl files can be found in [test/stl/](https://github.com/amandaghassaei/stl-parser/tree/main/test/stl).


## Installation

### Install via npm

```sh
npm install @amandaghassaei/stl-parser
```

and import into your project:

```js
import {
  parseSTL,
  loadSTL,
  loadSTLAsync,
} from '@amandaghassaei/stl-parser';
```

### Import into HTML

Import [stl-parser.min.js](https://github.com/amandaghassaei/stl-parser/blob/main/bundle/stl-parser.min.js) directly into your html:

```html
<html>
  <head>
    <script src="stl-parser.min.js"></script>
  </head>
  <body>
  </body>
</html>
```

`STLParserLib` will be accessible globally:

```js
const { parseSTL, loadSTL, loadSTLAsync } = STLParserLib;
```


## Use

Full API documentation in [docs](https://github.com/amandaghassaei/stl-parser/blob/main/docs/).

```js
// Load and parse the .stl file using url or File object.
loadSTL('./teapot.stl', (mesh) => {
  const {
    vertices,
    facesNormals,
    facesColors,
    edgesIndices,
    boundingBox,
  } = mesh;
});
// Also try:
// const mesh = await loadSTLAsync('./teapot.stl');

// Or parse file buffer or string synchronously.
const meshFromBuffer = parseSTL(fs.readFileSync('./teapot.stl'));
const meshFromString = parseSTL(`solid ASCII
  facet normal 0.000000e+00 0.000000e+00 -1.000000e+00
    outer loop
      vertex   1.000000e+01 0.000000e+00 -1.000000e+01
      vertex   0.000000e+00 0.000000e+00 -1.000000e+01
      vertex   1.000000e+01 1.000000e+01 -1.000000e+01
    endloop
  endfacet
  ....
  facet normal 0.000000e+00 -1.000000e+00 0.000000e+00
    outer loop
      vertex   0.000000e+00 0.000000e+00 0.000000e+00
      vertex   1.000000e+01 0.000000e+00 -1.000000e+01
      vertex   1.000000e+01 0.000000e+00 0.000000e+00
    endloop
  endfacet
endsolid`);
```

- `vertices` is a Float32Array of length 3 * numVertices containing a flat list of vertex positions in the following order `[x0, y0, z0, x1, y1, z1, ...]`.  Each group of three vertices make up a triangle in the .stl mesh – by default, vertices are not shared between triangles in the .stl format, see `mergeVertices()` below.
- `facesNormals` is a Float32Array of length 3 * numFaces containing a flat list of face normals in the following order `[nx0, ny0, nz0, nx1, ny1, nz1, ...]`
- If available, `facesColors` is a Float32Array of length 3 * numFaces containing a flat list of face colors in the following order `[r0, g0, b0, r1, g1, b1, ...]`.
- `edgesIndices` is a Uint32Array containing all unique edgesIndices (expressed as pairs of vertex indices) in the mesh in the following order: `[e01, e02, e11, e12, ...]`.  `edgesIndices` is calculated when queried and then cached.
- `boundingBox` returns the min and max of the mesh's bounding box in the form: `{ min: [x, y, z], max: [x, y, z] }`.  `boundingBox` is calculated when queried and then cached.


The mesh object returned by `parseSTL`, `loadSTL`, and `loadSTLAsync` also exposes methods for modifying its geometry:

```js
mesh.mergeVertices().scaleVerticesToUnitBoundingBox();
const { facesIndices } = mesh;
```

- `STLMesh.mergeVertices()` merges coincident vertices and adds a `facesIndices` array to the mesh object.  `facesIndices` has length 3 * numFaces and contains a flat list of triangle face vertex indices in the following order: `[v01, v02, v03, v11, v12, v13, ...]`.
- `STLMesh.scaleVerticesToUnitBoundingBox()` scales the `vertices` values (in place) to fit inside a unit box centered around the origin.


## Build Notes

This library imports `fs` in Nodejs environments to load files from a url string.  This code is never hit in the browser environment (the browser uses a XMLHttpRequest instead), but you may see build warnings due to the `import('fs')` statement in the code.  (I'm wondering if there is a better way to handle this that is compatible for both Nodejs and browser environments, please let me know if you have ideas.)

To fix this warning, you need to set `fs` as an external dependency in your build settings:

```js
// rollup.config.js
export default {
  ...
  external: ['fs'],
};
```

```js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      external: ['fs'],
    },
  }
  ...
}
```


## Limitations

- See limitations listed in [Threejs STLLoader](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/STLLoader.js).  If you have a file that is not being parsed correctly, please upload it in an [Issue](https://github.com/amandaghassaei/stl-parser/issues) so it can be added as a test case.  Pull requests welcome.


## Acknowledgements

- Most of the parsing code in this library is a TypeScript port of the [STLLoader](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/STLLoader.js) class from [Threejs](https://github.com/mrdoob/three.js).


## License

This work is licensed under an [MIT License](https://github.com/amandaghassaei/stl-parser/blob/main/LICENSE.txt).  It depends on the following:

- [@amandaghassaei/3d-mesh-utils](https://www.npmjs.com/package/@amandaghassaei/3d-mesh-utils) - geometry processing utility functions for 3D meshes (MIT license)


## Related Libraries

- [msh-parser](https://www.npmjs.com/package/msh-parser) - finite element .msh format parser


## Development

I don't have any plans to continue developing this package, but I'm happy to review pull requests if you would like to add a new feature / fix a bug.

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
