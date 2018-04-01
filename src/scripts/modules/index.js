import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls'

import MirrorRenderer from './mirror';

const FRAME_PADDING = 0.1;

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

		this._mirrorRenderer = new MirrorRenderer(this._camera, new THREE.Vector2(5.0, 5.0));
		this._mirrorRenderer.mesh.position.set(0.0, 5.0, -10.0);
		this._scene.add(this._mirrorRenderer.mesh);
		
		this._mirrorFrame = this.makeMirrorFrame(this._mirrorRenderer, 0x618930);
		this._scene.add(this._mirrorFrame);
	
		this._mirrorRenderer2 = new MirrorRenderer(this._camera, new THREE.Vector2(20.0, 20.0));
		this._mirrorRenderer2.mesh.lookAt(1.0, 0.0, 0.0);
		this._mirrorRenderer2.mesh.position.set(-10.0, 10.1, 0.0);
		this._scene.add(this._mirrorRenderer2.mesh);
		
		this._mirrorFrame2 = this.makeMirrorFrame(this._mirrorRenderer2, 0x618930);
		this._scene.add(this._mirrorFrame2);
	

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

		this._mirrorRenderer.addExcludedObject(this._mirrorRenderer2.mesh);
		this._mirrorRenderer.addExcludedObject(this._mirrorFrame);
		this._mirrorRenderer.addExcludedObject(this._mirrorFrame2);
		this._mirrorRenderer2.addExcludedObject(this._mirrorRenderer.mesh);
		this._mirrorRenderer2.addExcludedObject(this._mirrorFrame2);
		this._mirrorRenderer2.addExcludedObject(this._mirrorFrame);

		this.start();
	}

	makeMirrorFrame(mirrorRenderer, color){
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
		return frameMesh;

	}

	start() {
		this._cube.rotation.y += 0.01;
		this._cube.rotation.x += 0.01;

		this.render();
		this._controls.update();
		this._mirrorRenderer.update();
		this._mirrorRenderer2.update();
		requestAnimationFrame(this.start.bind(this));		
	}

	render() {
		this._mirrorRenderer.render(this._renderer, this._scene);
		this._mirrorRenderer2.render(this._renderer, this._scene);
		this._renderer.render(this._scene, this._camera);
	}
}

