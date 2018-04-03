
import mirrorVertexShader from '../../static/shaders/mirrorVertexShader.glsl';
import mirrorFragmentShader from '../../static/shaders/mirrorFragmentShader.glsl';

export default class MirrorRenderer {

    constructor(mainCamera, mirrorSize) {
        this._mainCamera = mainCamera;
        this._mirrorSize = mirrorSize;
        this._reflectedCamera = this._mainCamera.clone();
        this._initializeMesh();

        this._excludedObjects = [];
        this._bufferTextures = [];
    }

    _initializeMesh() {
        let mirrorGeometry = new THREE.PlaneGeometry(this._mirrorSize.x, this._mirrorSize.y, Math.round(Math.max(this._mirrorSize.x, this._mirrorSize.y)));
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

    addBufferTexture(){
		this._bufferTextures.push(new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.NearestFilter
		}));
    }

    /* get (width, height) of the mirror */
    get mirrorSize(){
        return this._mirrorSize;
    }

    /* this is used for manipulating the mirror plane (rotate, translate etc.) */
    get mesh() {
        return this._mirrorMesh;
    }
    
    /* Update the internal state before rendering */
    update() {
        this.syncBackCameraWithMainCameraPosition();
    }

    useBufferTexture(index){
        this._mirrorMaterial.uniforms['backCameraTexture'] = {
			type: 't',
			value: this._bufferTextures[index].texture
        }
    }

    /* Render using given render */
    render(renderer, scene, intoBufferTextureIndex) {

        // remember excluded objects visibility and hide them
        this._excludedObjects.forEach((excludedObject) => {
            excludedObject.lastVisible = excludedObject.object.visible;
            excludedObject.object.visible = false;
        });

        // render the scene into the texture
        renderer.render(scene, this._reflectedCamera, this._bufferTextures[intoBufferTextureIndex]);

        // restore the visibility of the excluded objects
        this._excludedObjects.forEach((excludedObject) => {
             excludedObject.object.visible = excludedObject.lastVisible;
        });
        
    }

    /* set objects that are to be excluded from the reflection */
    addExcludedObject(object){
        this._excludedObjects.push({
            object: object,
            lastVisible: object.visible
        });
    }

    setExcludedObjects(objects){
        this._excludedObjects = objects.map((object) => {
            return {
                object,
                lastVisible: object.visible
            }
        });
    }

}