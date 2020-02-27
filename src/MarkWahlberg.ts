/* ---------------------------------------------------------------------------------------
               MarkWahlberg: a funky bunch of templating goodness

    MarkWahlberg is a templating library based on Markdown. It's Markdown with variables.

    That's it, really.

 --------------------------------------------------------------------------------------- */

import {MarkVariable, VARIABLE_REGEX} from "./MarkVariable";
import { TemplateVariable } from "./TemplateVariable";

export class MarkWahlberg {
    private text: string;
    private variables: TemplateVariable[];

    constructor(text = ''){
        this.loadText(text);
    }

    setVariables = ()=>{
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

    loadText(text: string){
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
}
