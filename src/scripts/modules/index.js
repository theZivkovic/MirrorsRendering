import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls'

export default class MirrorsRendering {

	constructor(container){
		
		this._container = container;

		this._renderer = new THREE.WebGLRenderer();
		this._renderer.setSize(window.innerWidth, window.innerHeight);
		this._container.appendChild(this._renderer.domElement);

		this._scene = new THREE.Scene();

		let cubeGeometry = new THREE.CubeGeometry(1, 1, 1);
		let cubeMaterial = new THREE.MeshPhongMaterial();
		this._cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		this._cube.position.set(0.0, 0.0, 0.0);
		this._scene.add(this._cube);

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
		this._renderer.render(this._scene, this._camera);
	}
}

