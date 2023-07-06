import { Relation } from "./Relation";
import { Mapping } from "./Mapping";

export class SystemArchitecture {
    public FullName: string;
    public MetricsFileName: string;
    public Modules: string[];
    public Mappings: Mapping[];
    public Relations: Relation[];

    constructor(fullName: string, metricsFileName: string, modules: string[], mappings: Mapping[], relations: Relation[]) {
        this.FullName = fullName;
        this.MetricsFileName = metricsFileName;
        this.Modules = modules;
        this.Mappings = mappings;
        this.Relations = relations;
    }
}
