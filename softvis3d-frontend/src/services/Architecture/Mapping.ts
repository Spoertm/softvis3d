export class Mapping {
    public Module: string;
    public RegexPath: RegExp;

    constructor(module: string, regexPath: RegExp) {
        this.Module = module;
        this.RegexPath = regexPath;
    }
}
