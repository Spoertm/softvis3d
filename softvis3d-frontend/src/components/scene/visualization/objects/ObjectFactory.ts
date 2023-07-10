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
import { ArrowColor } from "../../../../constants/ArrowColor";
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
        }).filter( // filter out duplicate relations
            (relation, index, self) =>
                index ===
                self.findIndex((t) =>
                    t.SourceModule !== t.TargetModule &&
                    t.SourceModule === relation.SourceModule &&
                    t.TargetModule === relation.TargetModule
                )
        );

        // for each relation, draw an arrow
        highLevelRelations.forEach((relation) => {
            const sourceModule = shapes.find((s) => s.key.endsWith(relation.SourceModule));
            const targetModule = shapes.find((s) => s.key.endsWith(relation.TargetModule));

            if (!sourceModule || !targetModule){
                console.log("sourceModule or targetModule not found for relation " + relation.SourceModule + " => " + relation.TargetModule);
                return;
            }

            const relatedDependencyArrows = this.getRelatedDependencyArrows(
                relation,
                c2cDependencies,
                systemArchitecture.Mappings,
                shapes
            );

            const key = sourceModule.key + " => " + targetModule.key;
            const totalViolations = relatedDependencyArrows.reduce(
                (sum, arrow) => sum + arrow.violations,
                0
            );

            const color = totalViolations > 0 ? ArrowColor.red : ArrowColor.pink;
            const arrow = SoftVis3dArrowFactory.createModuleToModule(
                key,
                this.getCentroid(sourceModule, true),
                this.getCentroid(targetModule),
                relatedDependencyArrows,
                totalViolations,
                color,
                8
            );

            result.push(arrow);
        });

        return result;
    }

    private static getRelatedDependencyArrows(
        relation: Relation,
        c2cDependencies: string[],
        mapping: Mapping[],
        shapes: SoftVis3dShape[]
    ): SoftVis3dArrow[] {
        const relatedDependencyArrows: SoftVis3dArrow[] = [];

        const c2cBetweenModules = ArchitectureProvider.getC2cDependenciesBetweenModules(
            relation.SourceModule,
            relation.TargetModule,
            c2cDependencies,
            mapping
        ).filter((dep, index, self) => index === self.findIndex((t) => t === dep)); // filter out duplicate relations

        c2cBetweenModules.forEach((dep) => {
            const split = dep.split(",");
            const sourceFileSlashes = split[0].replace(/\./g, "/");
            const targetFileSlashes = split[1].replace(/\./g, "/");
            const violations = parseInt(split[2]);

            const sourceShape = shapes.find((s) => s.key.includes(sourceFileSlashes));
            const targetShape = shapes.find((s) => s.key.includes(targetFileSlashes));

            if (!sourceShape || !targetShape)
                return;

            const key = sourceShape.key + " => " + targetShape.key;
            const arrow = SoftVis3dArrowFactory.createHouseToHouse(
                key,
                this.getCentroid(sourceShape, true),
                this.getCentroid(targetShape),
                violations,
            );

            relatedDependencyArrows.push(arrow);
        });

        return relatedDependencyArrows;
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
        element.opacity = 1.5;

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
