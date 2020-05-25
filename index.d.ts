// Type definitions for mark-wahlberg
// Project: mark-wahlberg
// Definitions by: jbisaga


import { TemplateVariable } from "./src/TemplateVariable";
import { VariableValue } from "./src/MarkTemplate";
import {DeserializedMarkVariableObject} from "./src/MarkVariable";

export class MarkTemplate {
    constructor(text?: string);
    getText(): string;
    getVariables(): TemplateVariable[];
    parse(varValues?: VariableValue, strict?: boolean): string;
    getVariablesForInnerText(text: string): TemplateVariable[];
}

export class MarkVariable {
    constructor(serializedText: string);
    static deserialize = (text: string) => DeserializedMarkVariableObject;
    static parseSerializedProp = (propStr: string) => [any, any];
    public matchesType = (value: any) => boolean;

    name: string;
    type: MarkVariableType;
    value: any;
    defaultValue: any;
}

export { MarkVariableType } from './src/MarkVariable';
