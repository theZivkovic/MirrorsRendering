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

		this._bufferScene = new THREE.Scene();
		this._bufferTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.NearestFilter
		});
		
		let planeGeometry = new THREE.PlaneGeometry(20, 20, 20, 20);
		let planeMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});
		this._plane =  new THREE.Mesh(planeGeometry, planeMaterial);
		this._plane.lookAt(new THREE.Vector3(0.0, 1.0, 0.0));
		this._bufferScene.add(this._plane.clone());
		this._scene.add(this._plane.clone());

		let cubeGeometry = new THREE.CubeGeometry(1,1,1);
		let cubeMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
		this._cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		this._cube.position.set(0.0, 5.0, 0.0);
		this._bufferScene.add(this._cube.clone());
		this._scene.add(this._cube.clone());

		let mirrorGeometry = new THREE.PlaneGeometry(10, 10, 10);
		this._mirrorMaterial = new THREE.ShaderMaterial({
			vertexShader: mirrorVertexShader,
			fragmentShader: mirrorFragmentShader
		});

		this._mirror = new THREE.Mesh(mirrorGeometry, this._mirrorMaterial);
		this._mirror.position.set(0.0, 5.0, -5.0);
		this._scene.add(this._mirror);

		this._camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
		this._camera.position.set(10.0, 10.0, 10.0);
		this._camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

		this._backCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

		this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement);

		this._light0 = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
		
		this._scene.add(this._light0.clone());
		this._bufferScene.add(this._light0.clone());
		this.start();
	}

	reflectPointOverMirror(somePoint){
		let mirrorNormal = this._mirror.getWorldDirection();
		let mirrorCenter = this._mirror.position.clone();
		let mirrorToPointVec = somePoint.clone().sub(mirrorCenter);
		let dot = mirrorToPointVec.clone().dot(mirrorNormal);
		let mirrorToPointShortestVec = mirrorNormal.clone().multiplyScalar(dot /  mirrorNormal.lengthSq());
		let reflectedPoint = somePoint.clone().addScaledVector(mirrorToPointShortestVec, -2.0);
		return reflectedPoint;
	}

	syncBackCameraWithMainCameraPosition(){
		this._backCamera.position.copy(this._camera.position);
		this._backCamera.rotation.copy(this._camera.rotation);
		this._backCamera.updateMatrix();
	}

	start() {
		this._mirrorMaterial.uniforms['backCameraTexture'] = {
			type: 't',
			value: this._bufferTexture.texture
		}
		this.render();
		this._controls.update();
		
		this.syncBackCameraWithMainCameraPosition();
		requestAnimationFrame(this.start.bind(this));		
	}

	render() {
		this._renderer.render(this._bufferScene, this._backCamera, this._bufferTexture);
		this._renderer.render(this._scene, this._camera);
	}
}

