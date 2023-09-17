import { BufferGeometry, Material } from "three";
import { SoftVis3dMesh } from "./SoftVis3dMesh";
import { ArrowType } from "./SoftVis3dArrowFactory";

export class SoftVis3dArrow extends SoftVis3dMesh {
    private _relatedDependencyArrows: SoftVis3dArrow[];
    private _arrowType: ArrowType;
    private _violations: number;

    constructor(
        key: string,
        geometry: BufferGeometry,
        material: Material,
        relatedDependencyArrows: SoftVis3dArrow[],
        arrowType: ArrowType,
        violations: number
    ) {
        super(key, geometry, material);

        this._relatedDependencyArrows = relatedDependencyArrows;
        this._arrowType = arrowType;
        this._violations = violations;
    }

    public get relatedDependencyArrows(): SoftVis3dArrow[] {
        return this._relatedDependencyArrows;
    }

    public get arrowType(): ArrowType {
        return this._arrowType;
    }

    public get violations(): number {
        return this._violations;
    }

    public get doesViolate(): boolean {
        return this._violations > 0;
    }

    public from(): string {
        return this.getSoftVis3dId().split(" => ")[0];
    }

    public to(): string {
        return this.getSoftVis3dId().split(" => ")[1];
    }
}
