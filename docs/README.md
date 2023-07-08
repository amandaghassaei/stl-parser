@amandaghassaei/stl-parser

# @amandaghassaei/stl-parser

## Table of contents

### Type Aliases

- [STLMesh](README.md#stlmesh)

### Functions

- [parseSTL](README.md#parsestl)
- [loadSTLAsync](README.md#loadstlasync)
- [loadSTL](README.md#loadstl)

## Type Aliases

### STLMesh

Ƭ **STLMesh**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `vertices` | `Float32Array` |
| `faceNormals` | `Float32Array` |
| `edgeIndices` | `Uint32Array` |
| `faceColors?` | `Float32Array` |
| `faceIndices` | `Uint32Array` |
| `boundingBox` | { `min`: [`number`, `number`, `number`] ; `max`: [`number`, `number`, `number`]  } |
| `boundingBox.min` | [`number`, `number`, `number`] |
| `boundingBox.max` | [`number`, `number`, `number`] |
| `mergeVertices` | () => [`STLMesh`](README.md#stlmesh) |
| `scaleVerticesToUnitBoundingBox` | () => [`STLMesh`](README.md#stlmesh) |

## Functions

### parseSTL

▸ **parseSTL**(`data`): [`STLMesh`](README.md#stlmesh)

Synchronously parse an already loaded .stl file buffer or string.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `string` \| `ArrayBuffer` \| `Buffer` |

#### Returns

[`STLMesh`](README.md#stlmesh)

___

### loadSTLAsync

▸ **loadSTLAsync**(`urlOrFile`): `Promise`<[`STLMesh`](README.md#stlmesh)\>

Load and parse the .stl asynchronously from a specified url or File object (returns Promise).

#### Parameters

| Name | Type |
| :------ | :------ |
| `urlOrFile` | `string` \| `File` |

#### Returns

`Promise`<[`STLMesh`](README.md#stlmesh)\>

___

### loadSTL

▸ **loadSTL**(`urlOrFile`, `callback`): `void`

Load and parse the .stl from a specified url or File object.

#### Parameters

| Name | Type |
| :------ | :------ |
| `urlOrFile` | `string` \| `File` |
| `callback` | (`mesh`: [`STLMesh`](README.md#stlmesh)) => `void` |

#### Returns

`void`
