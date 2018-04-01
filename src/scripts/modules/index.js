import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls'

import MirrorRenderer from './mirror';

const FRAME_PADDING = 0.1;

export default class MirrorsRendering {

	constructor(container){
		
		this._container = container;

		this._renderer = new THREE.WebGLRenderer();
		this._renderer.setSize(window.innerWidth, window.innerHeight);
		this._container.appendChild(this._renderer.domElement);

		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
		this._camera.position.set(10.0, 10.0, 10.0);
		this._camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

		this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement);

		this._mirrorRender = new MirrorRenderer(this._camera, new THREE.Vector2(5.0, 5.0));
		this._mirrorRender.mesh.position.set(0.0, 5.0, -4.0);
		this._scene.add(this._mirrorRender.mesh);
		this.addMirrorFrame(this._mirrorRender, 0xFF0000);
	

		this._mirrorRender2 = new MirrorRenderer(this._camera, new THREE.Vector2(8.0, 8.0));
		this._mirrorRender2.mesh.lookAt(1.0, 0.0, 0.0);
		this._mirrorRender2.mesh.position.set(-5.0, 5.0, 2.0);
		this._scene.add(this._mirrorRender2.mesh);
		this.addMirrorFrame(this._mirrorRender2, 0x00FF00);

		let groundPlaneGeometry = new THREE.PlaneGeometry(20, 20, 20, 20);
		let groundPlaneMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});
		this._groundPlane =  new THREE.Mesh(groundPlaneGeometry, groundPlaneMaterial);
		this._groundPlane.lookAt(new THREE.Vector3(0.0, 1.0, 0.0));
	
		this._scene.add(this._groundPlane.clone());
		this._mirrorRender.addToBufferScene(this._groundPlane);
		this._mirrorRender2.addToBufferScene(this._groundPlane);
	
		let cubeGeometry = new THREE.CubeGeometry(3,3,3);
		let cubeMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
		this._cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		this._cube.position.set(0.0, 5.0, 2.0);
		this._scene.add(this._cube);
		this._mirrorRender.addToBufferScene(this._cube);
		this._mirrorRender2.addToBufferScene(this._cube);

		this._light0 = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
		
		this._scene.add(this._light0.clone());
		this._mirrorRender.addToBufferScene(this._light0);
		this._mirrorRender2.addToBufferScene(this._light0);
		this.start();
	}

	addMirrorFrame(mirrorRenderer, color){
		let mirrorSize = mirrorRenderer.mirrorSize.clone().add(new THREE.Vector2(FRAME_PADDING, FRAME_PADDING));
		let frameGeometry = new THREE.PlaneGeometry(mirrorSize.x, mirrorSize.y, Math.round(Math.max(mirrorSize.x, mirrorSize.y)));
		let frameMaterial = new THREE.MeshPhongMaterial({color: color, side: THREE.DoubleSide});
		let frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
		frameMesh.position.copy(mirrorRenderer.mesh.position);
		frameMesh.quaternion.copy(mirrorRenderer.mesh.quaternion);
		frameMesh.updateMatrix();
		let mirrorDirection = mirrorRenderer.mesh.getWorldDirection();
		mirrorDirection.normalize();
		mirrorDirection.multiplyScalar(0.01);
		frameMesh.position.sub(mirrorDirection);
		this._scene.add(frameMesh);
	}

	start() {
		this._cube.rotation.y += 0.01;
		this._cube.rotation.x += 0.01;
		this.render();
		this._controls.update();
		this._mirrorRender.update();
		this._mirrorRender2.update();
		requestAnimationFrame(this.start.bind(this));		
	}

	render() {
		this._mirrorRender.render(this._renderer);
		this._mirrorRender2.render(this._renderer);
		this._renderer.render(this._scene, this._camera);
	}
}

