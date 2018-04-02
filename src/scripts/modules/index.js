import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls'

import MirrorRenderer from './mirror';
import MirrorEngine from './mirror-engine';



export default class MirrorsRendering {

	constructor(container){
		
		this._container = container;

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor( 0x000000, 1 );
		this._renderer.setSize(window.innerWidth, window.innerHeight);
		this._container.appendChild(this._renderer.domElement);

		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
		this._camera.position.set(10.0, 10.0, 10.0);
		this._camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

		this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement);

		this._mirrorEngine = new MirrorEngine(this._scene, this._camera);

		this._mirrorEngine.addMirrorWithFrame(new THREE.Vector2(10, 10),
											0x618930,
											new THREE.Vector3(-10.0, 5.1, 0.0),
											new THREE.Vector3(1.0, 0.0, 0.0));

		this._mirrorEngine.addMirrorWithFrame(new THREE.Vector2(12, 12),
											  0x618930,
											  new THREE.Vector3(0.0, 6.1, -10.0),
											  new THREE.Vector3(0.0, 0.0, 1.0));

	

		let groundPlaneGeometry = new THREE.PlaneGeometry(20, 20, 20, 20);
		let groundPlaneMaterial = new THREE.MeshPhongMaterial({color: 0x474A4F});
		this._groundPlane =  new THREE.Mesh(groundPlaneGeometry, groundPlaneMaterial);
		this._groundPlane.lookAt(new THREE.Vector3(0.0, 1.0, 0.0));
	
		this._scene.add(this._groundPlane.clone());
		
		let cubeGeometry = new THREE.CubeGeometry(3,3,3);
		let cubeMaterial = new THREE.MeshPhongMaterial({color: 0x87C232});
		this._cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		this._cube.position.set(0.0, 5.0, 2.0);
		this._scene.add(this._cube);
		

		this._light0 = new THREE.PointLight( 0xffffff, 1, 1000 );
		this._light0.position.set(0.0, 40.0, 0.0);
		
		this._scene.add(this._light0.clone());

		this.start();
	}

	

	start() {
		this._cube.rotation.y += 0.01;
		this._cube.rotation.x += 0.01;
		
		this.render();
		this._mirrorEngine.update();
		this._controls.update();
		
		requestAnimationFrame(this.start.bind(this));		
	}

	render() {
		this._mirrorEngine.render(this._renderer);
		this._renderer.render(this._scene, this._camera);
	}
}

