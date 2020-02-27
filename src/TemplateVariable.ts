import { MarkVariable } from "./MarkVariable";

export class TemplateVariable {
    public variable: MarkVariable;
    public index: number;

    constructor(variableSerializedText: string, idx: number) {
        this.variable = new MarkVariable(variableSerializedText);
        this.index = idx;
    }
}
