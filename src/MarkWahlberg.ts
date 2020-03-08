/* ---------------------------------------------------------------------------------------
               MarkWahlberg: a funky bunch of templating goodness

    MarkWahlberg is a templating library based on Markdown. It's Markdown with variables.

    That's it, really.

 --------------------------------------------------------------------------------------- */

import {VARIABLE_REGEX, MarkVariableValueType} from "./MarkVariable";
import { TemplateVariable } from "./TemplateVariable";
import { cloneDeep } from "lodash";

export interface VariableValue {
    [key: string]: MarkVariableValueType
}

export class MarkWahlberg {
    private text: string = '';
    private variables: TemplateVariable[] = [];

    constructor(text = ''){
        this.loadText(text);
    }

    private setVariables = ()=>{
        let t = this.text;
        const regex = VARIABLE_REGEX();
        // go through text and find variables

        let matchResult;
        let vars = [];
        while( (matchResult = regex.exec(t)) !== null){
            const match = matchResult[0];
            const startingIdx = regex.lastIndex - match.length;
            vars.push(new TemplateVariable(match, startingIdx));
        }

        this.variables = vars;
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

    parse(varValues: VariableValue = {}, strict: boolean = false): string {
        let finalText = this.text;

        const variablesWithoutInternalVal = this.variables.filter(v => !v.variable.value);
        const variablesWithoutAnyVal = variablesWithoutInternalVal.filter(v => {
            return !Object.keys(varValues).includes(v.variable.name);
        });

        if (strict && variablesWithoutAnyVal.length){
            const missingVarNames = variablesWithoutAnyVal.map(v => v.variable.name);
            throw new Error(`Variables in template without value: ${missingVarNames.join(',')}`);
        }

        // create a copy of the variables so that we can change their indexes on the fly
        let variables = cloneDeep(this.variables);

        // go through the template, replacing variables with values
        variables.forEach((templateVariable, index) => {
            let variableValue: any = undefined;
            if (Object.keys(varValues).includes(templateVariable.variable.name)){
                variableValue = varValues[templateVariable.variable.name];
            } else if (templateVariable.variable.value){
                variableValue = templateVariable.variable.value;
            } else if (templateVariable.variable.defaultValue){
                variableValue = templateVariable.variable.defaultValue;
            }

            // validate value before we replace
            if (!templateVariable.variable.matchesType(variableValue)){
                throw new TypeError(`Cannot assign ${variableValue} to variable ${templateVariable.variable.name}`);
            }

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
}
