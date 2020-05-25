/* ---------------------------------------------------------------------------------------
               MarkWahlberg: a funky bunch of templating goodness

    MarkWahlberg is a templating library based on Markdown. It's Markdown with variables.

    That's it, really.

 --------------------------------------------------------------------------------------- */

import React from "react";
import {VARIABLE_REGEX, MarkVariableValueType, MarkVariableType, MarkVariable} from "./MarkVariable";
import { TemplateVariable } from "./TemplateVariable";
import { cloneDeep } from "lodash";
import { Marked } from '@ts-stack/markdown';
import DOMPurify from 'dompurify';

import { DefaultVariableComponent } from "./DefaultVariableComponent";

export interface VariableValue {
    [key: string]: MarkVariableValueType
}

export interface ParseOptions {
    varValues?: VariableValue;
    strict?: boolean;
}

export interface VariableRenderProps {
    value: any;
    defaultValue: any;
    name: string;
    type: MarkVariableType
}

type VariableComponent = React.Component<VariableRenderProps> | React.FC<VariableRenderProps>;

export interface RenderOptions {
    variableComponent?: VariableComponent;
    varValues?: VariableValue;
}


export class MarkTemplate {
    private text: string = '';
    private variables: TemplateVariable[] = [];

    constructor(text = ''){
        this.loadText(text);
    }

    private static getVariablesFromString(str: string): TemplateVariable[] {
        const regex = VARIABLE_REGEX();
        // go through text and find variables

        let matchResult;
        let vars = [];
        while( (matchResult = regex.exec(str)) !== null){
            const match = matchResult[0];
            const startingIdx = regex.lastIndex - match.length;
            vars.push(new TemplateVariable(match, startingIdx, match.length));
        }

        return vars;
    };

    private setVariables = ()=>{
        const t = this.text;
        this.variables = MarkTemplate.getVariablesFromString(t);
    };

    private loadText(text: string){
        if (text === null || text === undefined){
            throw new Error(`${this.constructor.name}.loadText() cannot be called with null or undefined`)
        }

        this.text = text;
        this.setVariables();
    }

    getText(): string{
        return this.text;
    }

    getVariables(): TemplateVariable[] {
        return this.variables;
    }

    // TODO: implement if needed
    /*getVariableByName(name: string): (TemplateVariable | null) {
        const variable = this.variables.find(templateVar => templateVar.variable.name === name);
        return variable || null;
    }*/

    private __getParsedVariableValue(templateVariable: TemplateVariable, varValues: VariableValue) {
        let variableValue: any = undefined;
        if (Object.keys(varValues).includes(templateVariable.variable.name)){
            variableValue = varValues[templateVariable.variable.name];
        } else if (templateVariable.variable.value){
            variableValue = templateVariable.variable.value;
        } else if (templateVariable.variable.defaultValue){
            variableValue = templateVariable.variable.defaultValue;
        }
        return variableValue;
    }

    private __requireValidParsedValue(templateVariable:  TemplateVariable, value: any): void {
        if (!templateVariable.variable.matchesType(value)){
            throw new TypeError(`Cannot assign ${value} to variable ${templateVariable.variable.name}`);
        }
    }

    private __requireStrictParsing(varValues: VariableValue): void {
        const variablesWithoutInternalVal = this.variables.filter(v => !v.variable.value);
        const variablesWithoutAnyVal = variablesWithoutInternalVal.filter(v => {
            return !Object.keys(varValues).includes(v.variable.name);
        });

        if (variablesWithoutAnyVal.length){
            const missingVarNames = variablesWithoutAnyVal.map(v => v.variable.name);
            throw new Error(`Variables in template without value: ${missingVarNames.join(',')}`);
        }
    }

    parse(options: ParseOptions = {}): string {
        const varValues = options.varValues || {};
        const strict = options.strict || false;

        let finalText = this.text;

        if (strict){
            this.__requireStrictParsing(varValues);
        }

        // create a copy of the variables so that we can change their indexes on the fly
        let variables = cloneDeep(this.variables);

        // go through the template, replacing variables with values
        variables.forEach((templateVariable, index) => {
            const variableValue: any = this.__getParsedVariableValue(templateVariable, varValues);

            // validate value before we replace
            this.__requireValidParsedValue(templateVariable, variableValue);

            const before = finalText.slice(0, templateVariable.index);
            let after = finalText.slice(templateVariable.index);
            const textVarRegex = VARIABLE_REGEX();
            const matchArr = textVarRegex.exec(after);
            let match;
            if (matchArr){
                match = matchArr[0];
            }

            if (match && variableValue !== undefined){
                after = after.replace(match, variableValue);
            }

            // change following indexes so we can parse them the right way
            variables.forEach((v, idx)=>{
                if (idx > index){
                    v.index -= match.length;
                }
            });

            finalText = before + after;
        });

        return finalText;
    }

    getVariablesForInnerText(text: string): TemplateVariable[]{
        const potentialVariablesInString = MarkTemplate.getVariablesFromString(text);
        const variableObjs = this.getVariables().map(tV => tV.variable);
        // compare to actual variables
        return potentialVariablesInString
            .filter(tV => {
                return variableObjs.find(v => v.name === tV.variable.name);
            });
    }

    /*render(options: RenderOptions = {}): React.ReactElement {
        const variableComponent: VariableComponent = options.variableComponent || DefaultVariableComponent;
        const varValues: VariableValue = options.varValues || {};
        const finalText = Marked.parse(this.text);

        let variables = cloneDeep(this.variables);
        variables.forEach((templateVariable, index) => {
            const variableValue: any =  this.__getParsedVariableValue(templateVariable, varValues);
        })
    },*/

}
