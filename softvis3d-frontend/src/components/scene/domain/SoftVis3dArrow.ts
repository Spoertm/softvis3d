import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ConeBufferGeometry, CylinderBufferGeometry, MeshBasicMaterial, Vector3 } from 'three';
import { SoftVis3dMesh } from './SoftVis3dMesh';

export class SoftVis3dArrow extends SoftVis3dMesh {
    constructor(key: string, origin: Vector3, target: Vector3, color: number = 0xFF00E6) {
        const arrowLength = origin.distanceTo(target);
        const arrowRadius = 1.5;
        const coneHeight = 15;
        const coneRadius = 4;

        const cylinderGeometry = new CylinderBufferGeometry(arrowRadius, arrowRadius, arrowLength - coneHeight, 32);
        cylinderGeometry.translate(0, (arrowLength - coneHeight) / 2, 0);

        const coneGeometry = new ConeBufferGeometry(coneRadius, coneHeight, 32);
        coneGeometry.translate(0, arrowLength - coneHeight / 2, 0);

        const arrowGeometry = BufferGeometryUtils.mergeBufferGeometries([cylinderGeometry, coneGeometry]);

        const arrowMaterial = new MeshBasicMaterial({
            color: color,
            opacity: 1.0,
        });

        super(key, arrowGeometry, arrowMaterial)

        this.position.set(origin.x, origin.y, origin.z);

        const direction = new Vector3(
            target.x - origin.x,
            target.y - origin.y,
            target.z - origin.z
        ).normalize();

        this.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction);
    }
}
