import { ConeBufferGeometry, CylinderBufferGeometry, MeshBasicMaterial, Vector3 } from "three";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { SoftVis3dArrow } from "./SoftVis3dArrow";
import { ArrowColor } from "../../../constants/ArrowColor";

export class SoftVis3dArrowFactory {
    public static createModuleToModule(
        key: string,
        origin: Vector3,
        target: Vector3,
        relatedDependencies: SoftVis3dArrow[],
        violations = 0,
        color = ArrowColor.blue,
        scale = 1
    ): SoftVis3dArrow {
        return SoftVis3dArrowFactory.createUniversal(
            key,
            origin,
            target,
            relatedDependencies,
            ArrowType.M2M,
            violations,
            color,
            scale
        );
    }

    public static createHouseToHouse(
        key: string,
        origin: Vector3,
        target: Vector3,
        violations = 0,
        scale = 1
    ): SoftVis3dArrow {
        const color = violations > 0 ? ArrowColor.red : ArrowColor.green;
        return SoftVis3dArrowFactory.createUniversal(
            key,
            origin,
            target,
            [],
            ArrowType.C2C,
            violations,
            color,
            scale
        );
    }

    public static createUniversal(
        key: string,
        origin: Vector3,
        target: Vector3,
        relatedDependencyArrows: SoftVis3dArrow[],
        arrowType: ArrowType,
        violations: number,
        color: number,
        scale = 1
    ): SoftVis3dArrow {
        const arrowLength = origin.distanceTo(target);
        const arrowRadius = 1.5 * scale;
        const coneHeight = 15 * scale;
        const coneRadius = 4 * scale;

        const cylinderGeometry = new CylinderBufferGeometry(
            arrowRadius,
            arrowRadius,
            arrowLength - coneHeight,
            32
        );

        cylinderGeometry.translate(0, (arrowLength - coneHeight) / 2, 0);

        const coneGeometry = new ConeBufferGeometry(coneRadius, coneHeight, 32);
        coneGeometry.translate(0, arrowLength - coneHeight / 2, 0);

        const arrowGeometry = BufferGeometryUtils.mergeBufferGeometries([
            cylinderGeometry,
            coneGeometry,
        ]);

        const arrowMaterial = new MeshBasicMaterial({
            color: color,
            opacity: 1.0,
        });

        const arrow = new SoftVis3dArrow(
            key,
            arrowGeometry,
            arrowMaterial,
            relatedDependencyArrows,
            arrowType,
            violations
        );

        arrow.position.set(origin.x, origin.y, origin.z);

        const direction = new Vector3(
            target.x - origin.x,
            target.y - origin.y,
            target.z - origin.z
        ).normalize();

        arrow.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction);

        return arrow;
    }
}

export enum ArrowType {
    C2C,
    M2M,
}
