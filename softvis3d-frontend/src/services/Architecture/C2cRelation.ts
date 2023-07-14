export class C2cRelation {
    private _sourceClass: string;
    private _targetClass: string;
    private _violations: number;

    constructor(sourceModule: string, targetModule: string, violations: number) {
        this._sourceClass = sourceModule;
        this._targetClass = targetModule;
        this._violations = violations;
    }

    public get SourceClass(): string {
        return this._sourceClass;
    }

    public get TargetClass(): string {
        return this._targetClass;
    }

    public get Violations(): number {
        return this._violations;
    }
}
