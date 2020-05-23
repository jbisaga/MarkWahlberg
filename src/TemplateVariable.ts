import { MarkVariable } from "./MarkVariable";

export class TemplateVariable {
    public variable: MarkVariable;
    public index: number;
    public strLength: number;

    constructor(variableSerializedText: string, idx: number, strLength: number) {
        this.variable = new MarkVariable(variableSerializedText);
        this.index = idx;
        this.strLength = strLength;
    }
}
