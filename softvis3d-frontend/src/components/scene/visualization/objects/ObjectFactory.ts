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

import { MeshLambertMaterial, BoxGeometry, Vector3 } from "three";
import { SoftVis3dMesh } from "../../domain/SoftVis3dMesh";
import { SoftVis3dShape } from "../../domain/SoftVis3dShape";
import { SoftVis3dArrow } from "../../domain/SoftVis3dArrow";
import { ArchitectureProvider } from "../../../../services/Architecture/ArchitectureProvider";
import { Relation } from "../../../../services/Architecture/Relation";
import { SoftVis3dArrowFactory } from "../../domain/SoftVis3dArrowFactory";
import { Mapping } from "../../../../services/Architecture/Mapping";

export class ObjectFactory {
    public static getSceneObjects(shapes: SoftVis3dShape[]): SoftVis3dMesh[] {
        const result: SoftVis3dMesh[] = [];

        shapes.forEach((s) => result.push(this._getShape(s)));

        const arrows = this.getDependencyArrows(shapes);
        result.push(...arrows);

        return result;
    }

    private static getDependencyArrows(shapes: SoftVis3dShape[]): SoftVis3dArrow[] {
        console.log(shapes[0]);
        const result: SoftVis3dArrow[] = [];

        const systemArchitecture = ArchitectureProvider.getSystemArchitecture();
        const c2cDependencies = ArchitectureProvider.getC2cDependencies();

        const highLevelRelations = c2cDependencies.map((dep) => {
            const split = dep.split(",");
            const fromFile = split[0];
            const toFile = split[1];

            const fromModule = ArchitectureProvider.moduleOf(fromFile, systemArchitecture.Mappings);
            const toModule = ArchitectureProvider.moduleOf(toFile, systemArchitecture.Mappings);

            return new Relation(fromModule, toModule);
        }).filter(
            (relation, index, self) =>
                index ===
                self.findIndex((t) =>
                    t.SourceModule !== t.TargetModule &&
                    t.SourceModule === relation.SourceModule &&
                    t.TargetModule === relation.TargetModule
                )
        );

        highLevelRelations.forEach((relation) => {
            const fromShape = shapes.find((s) => s.key.endsWith(relation.SourceModule));
            const toShape = shapes.find((s) => s.key.endsWith(relation.TargetModule));

            if (fromShape && toShape) {
                const relatedDependencyIds = this.getRelatedDependencyIds(
                    relation,
                    c2cDependencies,
                    systemArchitecture.Mappings
                );

                const key = fromShape.key + " => " + toShape.key;
                const arrow = SoftVis3dArrowFactory.create(
                    key,
                    this.getCentroid(fromShape),
                    this.getCentroid(toShape),
                    relatedDependencyIds,
                );

                result.push(arrow);
            }
        });

        return result;
    }

    private static getRelatedDependencyIds(relation: Relation, allC2c: string[], mapping: Mapping[]): string[] {
        const c2cBetweenModules: string[] = ArchitectureProvider.getC2cDependenciesBetweenModules(
            relation.SourceModule,
            relation.TargetModule,
            allC2c,
            mapping);

        // Remake from csv format to "from => to"
        const modifiedC2cBetweenModules: string[] = c2cBetweenModules.map(c2c => {
            const split = c2c.split(",");
            const fromFile = split[0];
            const toFile = split[1];

            return fromFile + " => " + toFile;
        });

        return modifiedC2cBetweenModules;
    }

    private static getCentroid(shape: SoftVis3dShape, originShape = false): Vector3 {
        const centerX = originShape
            ? shape.position._x
            : shape.position._x + shape.dimensions.length / 2;

        const centerY = originShape
            ? shape.position._y
            : shape.position._y + shape.dimensions.width / 2;

        const centerZ = shape.position._z + shape.dimensions.height / 2;

        return new Vector3(centerX, centerZ, centerY);
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
}
