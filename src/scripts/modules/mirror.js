
import mirrorVertexShader from '../../static/shaders/mirrorVertexShader.glsl';
import mirrorFragmentShader from '../../static/shaders/mirrorFragmentShader.glsl';

export default class MirrorRenderer {

    constructor(mainCamera) {
        this._mainCamera = mainCamera;
        this._reflectedCamera = this._mainCamera.clone();
        this._initializeMesh();
        this._initializeBufferScene();
    }

    _initializeBufferScene(){
        this._bufferScene = new THREE.Scene();
		this._bufferTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.NearestFilter
		});
    }

    _initializeMesh() {
        let mirrorGeometry = new THREE.PlaneGeometry(10, 10, 10);
		this._mirrorMaterial = new THREE.ShaderMaterial({
			vertexShader: mirrorVertexShader,
			fragmentShader: mirrorFragmentShader
		});

		this._mirrorMesh = new THREE.Mesh(mirrorGeometry, this._mirrorMaterial);
    }

    reflectPointOverMirror(somePoint){
		let mirrorNormal = this._mirrorMesh.getWorldDirection();
		let mirrorCenter = this._mirrorMesh.position.clone();
		let mirrorToPointVec = somePoint.clone().sub(mirrorCenter);
		let dot = mirrorToPointVec.clone().dot(mirrorNormal);
		let mirrorToPointShortestVec = mirrorNormal.clone().multiplyScalar(dot /  mirrorNormal.lengthSq());
		let reflectedPoint = somePoint.clone().addScaledVector(mirrorToPointShortestVec, -2.0);
		return reflectedPoint;
    }
    
    syncBackCameraWithMainCameraPosition() {
		let newCameraPosition = this.reflectPointOverMirror(this._mainCamera.position);
		let newLookAtPosition = new THREE.Vector3(0, 0, -1);
		newLookAtPosition.applyMatrix4(this._mainCamera.matrixWorld);
		newLookAtPosition = this.reflectPointOverMirror(newLookAtPosition);

		this._reflectedCamera.position.copy(newCameraPosition);
		this._reflectedCamera.lookAt(newLookAtPosition);
		this._reflectedCamera.updateMatrix();
    }
    
    // PUBLIC INTERFACE

    updateUniforms() {
        this._mirrorMaterial.uniforms['backCameraTexture'] = {
			type: 't',
			value: this._bufferTexture.texture
        }
    }
    get mesh() {
        return this._mirrorMesh;
    }
    
    get bufferScene(){
        return this._bufferScene;
    }

    update() {
        this.syncBackCameraWithMainCameraPosition();
    }

    render(renderer) {
        renderer.render(this._bufferScene, this._reflectedCamera, this._bufferTexture);
    }


}