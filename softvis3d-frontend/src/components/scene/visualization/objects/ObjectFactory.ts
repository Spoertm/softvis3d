///
/// softvis3d-frontend
/// Copyright (C) 2020 Stefan Rinderle and Yvo Niedrich
/// stefan@rinderle.info / yvo.niedrich@gmail.com
///
/// This program is free software; you can redistribute it and/or
/// modify it under the terms of the GNU Lesser General Public
/// License as published by the Free Software Foundation; either
/// version 3 of the License, or (at your option) any later version.
///
/// This program is distributed in the hope that it will be useful,
/// but WITHOUT ANY WARRANTY; without even the implied warranty of
/// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
/// Lesser General Public License for more details.
///
/// You should have received a copy of the GNU Lesser General Public
/// License along with this program; if not, write to the Free Software
/// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02
///

import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshLambertMaterial, BoxGeometry, Vector3, ConeBufferGeometry, CylinderBufferGeometry, MeshBasicMaterial } from "three";
import { SoftVis3dMesh } from "../../domain/SoftVis3dMesh";
import { SoftVis3dShape } from "../../domain/SoftVis3dShape";

export class ObjectFactory {
    public static getSceneObjects(shapes: SoftVis3dShape[]): SoftVis3dMesh[] {
        const result: SoftVis3dMesh[] = [];

        for (const shape of shapes) {
            result.push(this._getShape(shape));
        }

        const embedHelperPos = shapes.find((shape) => shape.key.includes("EmbedHelper.cs")) as SoftVis3dShape;
        const ddstatsPos = shapes.find((shape) => shape.key.includes("site.css")) as SoftVis3dShape;

        const vec = new Vector3(embedHelperPos.position._x, embedHelperPos.position._z, embedHelperPos.position._y);
        const vec2 = new Vector3(ddstatsPos.position._x, ddstatsPos.position._z, ddstatsPos.position._y);

        console.log("vec", vec, "\nvec2", vec2);

        const arrow = this.getArrow(vec, vec2);
        result.push(arrow);

        return result;
    }

    private static _getShape(element: SoftVis3dShape): SoftVis3dMesh {
        element.opacity = 1;

        const z = element.position._z + Math.floor(element.dimensions.height / 2);

        const geometry = new BoxGeometry(
            element.dimensions.length,
            element.dimensions.height,
            element.dimensions.width
        );

        const material = new MeshLambertMaterial({
            color: element.color,
            transparent: false,
            opacity: element.opacity,
        });

        const cube: SoftVis3dMesh = new SoftVis3dMesh(element.key, geometry, material);
        cube.position.setX(element.position._x);
        cube.position.setY(z);
        cube.position.setZ(element.position._y);

        return cube;
    }

    private static getArrow(origin: Vector3, target: Vector3): SoftVis3dMesh {
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
            color: 0xFF00E6, // pink
            opacity: 1.0,
        });

        const arrowMesh = new SoftVis3dMesh("arrow-" + origin + "-" + target, arrowGeometry, arrowMaterial);

        arrowMesh.position.set(origin.x, origin.y, origin.z);
        const direction = new Vector3(
            target.x - origin.x,
            target.y - origin.y,
            target.z - origin.z
        ).normalize();

        arrowMesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction);

        return arrowMesh;
    }
}
