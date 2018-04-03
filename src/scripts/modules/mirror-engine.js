import MirrorRenderer from './mirror';

const FRAME_PADDING = 0.1;

export default class MirrorEngine {

    constructor(scene, camera){
        this._scene = scene;
        this._camera = camera;

        this._mirrorsWithFrames = [];
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

    addMirrorWithFrame(mirrorSize, frameColorHex, position, lookAt){

        let mirrorRenderer = new MirrorRenderer(this._camera, mirrorSize);
        mirrorRenderer.mesh.lookAt(lookAt);
        mirrorRenderer.mesh.position.copy(position);
       
		this._scene.add(mirrorRenderer.mesh);
		
		let mirrorFrame = this.makeMirrorFrame(mirrorRenderer, frameColorHex);
        this._scene.add(mirrorFrame);

        mirrorRenderer.addBufferTexture();
        mirrorRenderer.addBufferTexture();

        this._mirrorsWithFrames.push({
            mirrorRenderer: mirrorRenderer,
            frame: mirrorFrame
        });


    }

    update() {
        this._mirrorsWithFrames.forEach((mirrorWithFrame) => {
            mirrorWithFrame.mirrorRenderer.update();
        });
    }

    render(renderer) {

        this._mirrorsWithFrames.forEach((mirrorWithFrame, index) => {

            let excludedObjects = [];

            this._mirrorsWithFrames.forEach((m, i) => {
                if (i != index){
                    excludedObjects.push(m.mirrorRenderer.mesh);
                    excludedObjects.push(m.frame);
                }
            });

            excludedObjects.push(mirrorWithFrame.frame);
            mirrorWithFrame.mirrorRenderer.setExcludedObjects(excludedObjects);
            mirrorWithFrame.mirrorRenderer.useBufferTexture(0);
            mirrorWithFrame.mirrorRenderer.render(renderer, this._scene, 0);
        });

        this._mirrorsWithFrames.forEach((mirrorWithFrame, index) => {
            mirrorWithFrame.mirrorRenderer.setExcludedObjects([mirrorWithFrame.frame]);
            mirrorWithFrame.mirrorRenderer.render(renderer, this._scene, 1);
        });

        this._mirrorsWithFrames.forEach((mirrorWithFrame, index) => {
            mirrorWithFrame.mirrorRenderer.useBufferTexture(1);
        });
      
    }


}
