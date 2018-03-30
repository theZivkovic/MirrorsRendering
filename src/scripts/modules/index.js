import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls'

import mirrorVertexShader from '../../static/shaders/mirrorVertexShader.glsl';
import mirrorFragmentShader from '../../static/shaders/mirrorFragmentShader.glsl';

export default class MirrorsRendering {

	constructor(container){
		
		this._container = container;

		this._renderer = new THREE.WebGLRenderer();
		this._renderer.setSize(window.innerWidth, window.innerHeight);
		this._container.appendChild(this._renderer.domElement);

		this._scene = new THREE.Scene();

		// this._bufferScene = new THREE.Scene();
		// this._bufferTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
		// 	minFilter: THREE.LinearFilter,
		// 	magFilter: THREE.NearestFilter
		// });
		
		let planeGeometry = new THREE.PlaneGeometry(20, 20, 20, 20);
		let planeMaterial = new THREE.MeshPhongMaterial();
		this._plane =  new THREE.Mesh(planeGeometry, planeMaterial);
		this._plane.lookAt(new THREE.Vector3(0.0, 1.0, 0.0));
		this._scene.add(this._plane);

		let mirrorGeometry = new THREE.PlaneGeometry(10, 10, 10);
		let mirrorMaterial = new THREE.ShaderMaterial({
			vertexShader: mirrorVertexShader,
			fragmentShader: mirrorFragmentShader
		});

		let mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
		this._scene.add(mirror);

		this._camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
		this._camera.position.set(10.0, 10.0, 10.0);
		this._camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

		this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement);

		this._light0 = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
		this._scene.add(this._light0);
		this.start();
	}

	start() {
		this.render();
		this._controls.update();
		requestAnimationFrame(this.start.bind(this));		
	}

	render() {
		// this._renderer.render(this._bufferScene, this._bufferCamera, this._bufferTexture);
		this._renderer.render(this._scene, this._camera);
	}
}

