const { loadSTL } = STLParserLib;

const TEAPOT_URL = '../test/stl/teapot.stl';
const CHAIR_URL = '../test/stl/chair.stl';
const WRENCH_URL = '../test/stl/wrench.stl';
const SKULL_URL = '../test/stl/skull.stl';
const CUBE_URL = '../test/stl/cubeBinary.stl';

const PARAMS = {
	title: 'hello',
	color: '#8bc0f0',
	background: '#eeeeee',
	wireframe: '#000000',
	mergeVertices: true,
	highlightedVertex: -1,
	url: TEAPOT_URL,
};

let mesh, wireframe, fileOrURL;

// Parse the .stl file using the specified file path.
fileOrURL = PARAMS.url;
loadSTL(PARAMS.url, initThreeJSGeometry);

// UI
const pane = new Tweakpane.Pane({
	title: PARAMS.url.split('/').pop(),
});
pane.registerPlugin(TweakpaneInfodumpPlugin);
const info = pane.addBlade({
	view: "infodump",
	content: "",
	border: false,
	markdown: false,
});
function setInfo(html) {
	info.controller_.view.element.children[0].innerHTML = html;
}
pane.addInput(PARAMS, 'color', { label: 'Mesh Color' }).on('change', () => {
	mesh.material.color = new THREE.Color(PARAMS.color);
	render();
});
pane.addInput(PARAMS, 'background', { label: 'Background' }).on('change', () => {
	scene.background = new THREE.Color(PARAMS.background);
	render();
});
pane.addInput(PARAMS, 'wireframe', { label: 'Wireframe' }).on('change', () => {
	wireframe.material.color = new THREE.Color(PARAMS.wireframe);
	render();
});

pane.addInput(PARAMS, 'url', {
	label: 'File',
	options: {
	  Teapot: TEAPOT_URL,
	  Chair: CHAIR_URL,
	  Wrench: WRENCH_URL,
	  Skull: SKULL_URL,
	  Cube: CUBE_URL,
	},
}).on('change', () => {
	pane.title = PARAMS.url.split('/').pop();
	fileOrURL = PARAMS.url;
	loadSTL(PARAMS.url, initThreeJSGeometry);
});
pane.addButton({
	title: 'Upload .stl (or Drop/Paste)',
}).on('click', () => {
	fileInput.click();
});
pane.addInput(PARAMS, 'mergeVertices', {
	label: 'Merge Vertices',
}).on('change', () => {
	if (fileOrURL) loadSTL(fileOrURL, initThreeJSGeometry);
});
pane.addButton({
	title: 'View Code on GitHub',
}).on('click', () => {
	document.getElementById('githubLink').click();
});
let highlightedVertexSlider;
function makeHighlightedVertexSlider(max) {
	if (highlightedVertexSlider) pane.remove(highlightedVertexSlider);
	return pane.addInput(PARAMS, 'highlightedVertex', { label: 'Highlighted Vertex', min: -1, max, step: 1 }).on('change', () => {
		const index = PARAMS.highlightedVertex;
		vertexHighlighter.visible = index >= 0;
		if (index < 0 || !mesh) {
			render();
			return;
		}
		const array = mesh.geometry.getAttribute('position').array;
		vertexHighlighter.position.set(array[3 * index], array[3 * index + 1], array[3 * index + 2]);
		render();
	});
}


// Init threejs geometry.

function removeThreeObject(object) {
	scene.remove(object);
	object.material.dispose();
	object.geometry.dispose();
}

function initMesh(positionsAttribute, stlMesh) {
	// Remove previous mesh.
	if (mesh) removeThreeObject(mesh);

	// Create a buffer geometry from the position and index arrays.
	const geometry = new THREE.BufferGeometry();
	if (PARAMS.mergeVertices) geometry.setIndex(new THREE.BufferAttribute(stlMesh.facesIndices, 1));
	geometry.setAttribute('position', positionsAttribute);
	geometry.computeVertexNormals();

	// Create a material and mesh and add the geometry to the scene.
	const material = new THREE.MeshLambertMaterial({
		color: new THREE.Color(PARAMS.color),
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
		flatShading: true,
	});
	const threeMesh = new THREE.Mesh(geometry, material);
	scene.add(threeMesh);

	return threeMesh;
}

function initWireframe(positionsAttribute, edgesIndices) {
	// Remove previous wireframe.
	if (wireframe) removeThreeObject(wireframe);

	// Add wireframe.
	const geometry = new THREE.BufferGeometry();
	geometry.setIndex(new THREE.BufferAttribute(edgesIndices, 1));
	geometry.setAttribute('position', positionsAttribute);
	const material = new THREE.LineBasicMaterial({ color: new THREE.Color(PARAMS.wireframe) });
	const lines = new THREE.LineSegments(geometry, material);
	scene.add(lines);
	return lines;
}

function initThreeJSGeometry(stlMesh) {
	if (PARAMS.mergeVertices) stlMesh.mergeVertices();
	const {
		vertices,
		edgesIndices,
	} = stlMesh;

	setInfo(`${(vertices.length / 3).toLocaleString()} vertices<br/>
		${(PARAMS.mergeVertices ? stlMesh.facesIndices.length / 3 : vertices.length / 9).toLocaleString()} faces<br/>
		${(edgesIndices.length / 2).toLocaleString()} edges`);

	// Share positions attribute between meshes.
	const positionsAttribute = new THREE.BufferAttribute(vertices, 3);

	mesh = initMesh(positionsAttribute, stlMesh);
	wireframe = initWireframe(positionsAttribute, edgesIndices);

	// Center and scale the positions attribute.
	// Do this on one mesh and it will apply to all.
	// Compute the bounding sphere of the geometry.
	mesh.geometry.rotateX(-Math.PI / 2); // Rotate so z is up.
	mesh.geometry.computeBoundingSphere();
	mesh.geometry.center();
	const scale = 1 / mesh.geometry.boundingSphere.radius;
	mesh.geometry.scale(scale, scale, scale);

	// Update ui.
	PARAMS.highlightedVertex = -1;
	vertexHighlighter.visible = false;
	highlightedVertexSlider = makeHighlightedVertexSlider(vertices.length / 3 - 1);

	controls.reset();

	// Render.
	render();
}

// Create a new Three.js scene and set the background color.
const scene = new THREE.Scene();
scene.background = new THREE.Color(PARAMS.background);

// Create a camera and add it to the scene.
const aspectRatio = window.innerWidth / window.innerHeight;
const viewSize = 2;
const camera = new THREE.OrthographicCamera(
	aspectRatio * viewSize / -2, aspectRatio * viewSize / 2,
	viewSize / 2, viewSize / -2,
	0.01, 10,
);
camera.position.set(2, 2, 2);
scene.add(camera);

// Set up lighting.
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
camera.add(directionalLight);

// Init an object to highlight a vertex.
const vertexHighlighter = new THREE.Mesh(new THREE.SphereGeometry(0.02), new THREE.MeshBasicMaterial({
	depthTest: false,
	depthWrite: false,
	color: 0xff0000,
}));
vertexHighlighter.visible = false;
vertexHighlighter.renderOrder = 1;
scene.add(vertexHighlighter);

// Update on resize.
window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	const aspectRatio = window.innerWidth / window.innerHeight;
	camera.left = aspectRatio * viewSize / -2;
	camera.right = aspectRatio * viewSize / 2;
	camera.top = viewSize / 2;
	camera.bottom = viewSize / -2;
	camera.updateProjectionMatrix();
	render();
});

// Create a renderer and add it to the page.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls.
const controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.enablePan = false;
controls.maxZoom = 100;
controls.minZoom = 0.5;
controls.addEventListener('change', () => {
	const scale = 1 / camera.zoom;
	vertexHighlighter.scale.set(scale, scale, scale);
	render();
});

// Render the scene.
function render() {
	renderer.render(scene, camera);
}
render();


// File import.
const fileInput = document.getElementById('file-input');

function getExtension(filename) {
	const components = filename.split('.');
	return components[components.length - 1].toLowerCase();
}

function loadFile(file) {
	const extension = getExtension(file.name);
	if (extension !== 'stl') return;
	pane.title = file.name;
	fileOrURL = file;
	loadSTL(file, initThreeJSGeometry);
	return true;
}

const badFileAlert = (error = 'Unsupported file') => {
	alert(`${error}: Please upload an .stl file.`);
}

// Paste event.
window.addEventListener('paste', (e) => {
	e.preventDefault();
	// @ts-ignore
	const files = (e.clipboardData || e.originalEvent.clipboardData).items;
	if (!files || files.length === 0) return;
	for (let index in files) {
		const item = files[index];
		if (item.kind === 'file') {
			const file = item.getAsFile();
			if (!file) continue;
			if (loadFile(file)) return;
		}
	}
	badFileAlert();
});

// Drop event.
window.addEventListener("dragover", (e) => {
	e.preventDefault();
}, false);
window.addEventListener('drop', (e) => {
	e.stopPropagation();
	e.preventDefault();
	const files = e.dataTransfer?.files; // Array of all files
	if (!files || files.length === 0) return;
	for (let index in files) {
		const file = files[index];
		if (loadFile(file)) return;
	}
	badFileAlert();
}, false);

// File input.
function fileInputOnChange(e) {
	const { files } = e.target;
	if (!files || files.length === 0) return;
	const file = files[0];
	if(!loadFile(file)) badFileAlert();
}
fileInput.onchange = fileInputOnChange;
