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

import { BufferGeometry, Material, Mesh, MeshBasicMaterial, MeshLambertMaterial } from "three";

export class SoftVis3dMesh extends Mesh {
    private readonly softVis3dId: string;

    constructor(softVis3dId: string, geometry: BufferGeometry, material: Material) {
        super(geometry, material);

        this.softVis3dId = softVis3dId;
    }

    public getSoftVis3dId(): string {
        return this.softVis3dId;
    }

    public get color(): number {
        const materialType = (this.material as Material).type;
        switch (materialType) {
            case 'MeshBasicMaterial':
                let basicMaterial = this.material as THREE.MeshBasicMaterial;
                return basicMaterial.color.getHex();
            case 'MeshLambertMaterial':
                let lambertMaterial = this.material as THREE.MeshLambertMaterial;
                return lambertMaterial.color.getHex();
            default:
                throw new Error("Unsupported material type: " + materialType);
        }
    }

    public set color(value: number) {
        const materialType = (this.material as Material).type;
        switch (materialType) {
            case 'MeshBasicMaterial':
                let basicMaterial = this.material as MeshBasicMaterial;
                basicMaterial.color.setHex(value);
                break;
            case 'MeshLambertMaterial':
                let lambertMaterial = this.material as MeshLambertMaterial;
                lambertMaterial.color.setHex(value);
                break;
            default:
                throw new Error("Unsupported material type: " + materialType);
        }
    }
}
