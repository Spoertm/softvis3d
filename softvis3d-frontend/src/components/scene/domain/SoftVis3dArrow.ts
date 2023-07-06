import { BufferGeometry, Material } from "three";
import { SoftVis3dMesh } from "./SoftVis3dMesh";

export class SoftVis3dArrow extends SoftVis3dMesh {
    private _relatedDependencyIds: string[];

    constructor(key: string, geometry: BufferGeometry, material: Material, relatedDependencyIds: string[]) {
        super(key, geometry, material);

        this._relatedDependencyIds = relatedDependencyIds;
    }

    public get relatedDependencyIds(): string[] {
        return this._relatedDependencyIds;
    }
}
