/* ---------------------------------------------------------------------------------------
               MarkWahlberg: a funky bunch of templating goodness

    MarkWahlberg is a templating library based on Markdown. It's Markdown with variables.

    That's it, really.

 --------------------------------------------------------------------------------------- */
import { DoingItWrongError } from "../errors";

const VARIABLE_REGEX = () => /\${{.+}}/g;
const INTERNAL_VARIABLE_VALUE_PROP = 'value';
const INTERNAL_VARIABLE_TYPE_PROP = '__markVarInternalType';
enum MarkVariableInternalType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    NULL = 'null'
};


const MarkVariableInternalTypePattern = {
    [MarkVariableInternalType.STRING]: () => /'(.*)'/,
    [MarkVariableInternalType.NUMBER]: () => /\d+/,
    [MarkVariableInternalType.BOOLEAN]: () => /(true|false)/,
    [MarkVariableInternalType.NULL]: () => /null/
};

interface DeserializedMarkVariableObject {
    name?: string,
    type?: MarkVariableInternalType,
    defaultValue?: any;
}

class MarkVariable {
    name: string;
    type: MarkVariableInternalType;
    defaultValue: any;

    /*
        The serialization standard for a MarkVariable is:

        ${name:'name', type:'TYPE', defaultValue:'the default value'}

        it's kind of like JSON. whitespace chars inside curly braces don't matter.
     */
    constructor(serializedText: string) {
        // go through serialized text and extract properties to object
        const VARIABLE_PROPS = [
            'name',
            'type',
            'defaultValue'
        ];
        let deserialized: DeserializedMarkVariableObject = MarkVariable.deserialize(serializedText);

        VARIABLE_PROPS.forEach( prop => {
            if (deserialized[prop]){
                this[prop] = deserialized[prop];
            }
        });
    }

    static deserialize = (text: string): DeserializedMarkVariableObject =>{
        if (!VARIABLE_REGEX().test(text)){
            throw new TypeError(`${text} is not a MarkWahlberg variable`);
        }

        // since the pattern matches, we can disregard the first 3 characters "${{" and the last 2 characters "}}"
        //console.log(text);
        const PROP_START_IDX = 3;
        const PROP_END_IDX = text.length - 2;

        let internalStr = text.substring(PROP_START_IDX, PROP_END_IDX);

        // now we parse the text. split by comma...
        let internalParts = internalStr.split(',');
        let internalObj: DeserializedMarkVariableObject = {};
        let props = internalParts.map( partStr => MarkVariable.parseSerializedProp(partStr));
        props.forEach( propArr => {
            let key = propArr[0];
            let value = propArr[1];
            let internalType;
            let finalVal;
            const pattern = MarkVariableInternalTypePattern;
            const type = MarkVariableInternalType;

            if (pattern[type.STRING]().test(value)){
                internalType = type.STRING;
                finalVal = pattern[type.STRING]().exec(value)[1];
            } else if (pattern[type.NUMBER]().test(value)){
                internalType = type.NUMBER;
                finalVal = parseInt(value);
            } else if (pattern[type.BOOLEAN]().test(value)){
                internalType = type.BOOLEAN;
                finalVal = /true/.test(value);
            } else if (pattern[type.NULL]().test(value)){
                internalType = type.NULL;
                finalVal = null;
            } else {
                throw new TypeError(`MarkVariable value ${value} does not match a type.`);
            }

            internalObj[key] = {
                [INTERNAL_VARIABLE_TYPE_PROP]: internalType,
                [INTERNAL_VARIABLE_VALUE_PROP]: finalVal
            };
        });

        return internalObj;
    };

    static parseSerializedProp = (propStr) => {
        const PROP_PATTERN = /^[\s]*([a-zA-Z][a-zA-Z\d]*)[\s]*:[\s]*('.*'|true|false|null|\d+)[\s]*$/;
        if (!PROP_PATTERN.test(propStr)){
            throw new TypeError(`${propStr} is not a serialized MarkVariable property`);
        }

        let parseResult = PROP_PATTERN.exec(propStr);
        let key = parseResult[1];
        let value = parseResult[2];

        return [ key, value ];
    };

    // the opposite of what deserialize() does: take the properties and return them in a string
    serialize(){
        let internalStr = '';
        let keys = Object.keys(this);

        keys.forEach((key)=>{
            let valStr;
            let obj = this[key];
            if (obj[INTERNAL_VARIABLE_TYPE_PROP] === MarkVariableInternalType.STRING){
                valStr = `'${obj[INTERNAL_VARIABLE_VALUE_PROP]}'`;
            } else {
                valStr = `${obj[INTERNAL_VARIABLE_VALUE_PROP]}`;
            }

            internalStr += (internalStr ? ', ' : '') + `${key}: ${valStr}`;
        });

        return '${{' + internalStr + '}}';
    }
}

class MarkWahlberg {
    private text: string;
    private variables: MarkVariable[];

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
            let match = matchResult[0];
            // let startingIdx = regex.lastIndex - match.length;
            vars.push(new MarkVariable(match));
        }

        this.variables = vars;
    };

    loadText(text: string){
        if (text === null || text === undefined){
            throw new DoingItWrongError(`${this.constructor.name}.loadText() cannot be called with null or undefined`)
        }

        this.text = text;
        this.setVariables();
    }

    getText(): string{
        return this.text;
    }

    getVariables(): MarkVariable[] {
        return this.variables;
    }
}

module.exports = { MarkWahlberg, MarkVariable };
