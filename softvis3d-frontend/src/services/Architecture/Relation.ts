export class Relation {
    public SourceModule: string;
    public TargetModule: string;

    constructor(sourceModule: string, targetModule: string) {
        this.SourceModule = sourceModule;
        this.TargetModule = targetModule;
    }
}
