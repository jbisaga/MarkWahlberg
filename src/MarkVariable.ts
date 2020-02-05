export const VARIABLE_REGEX = () => /\${{.+}}/g;
const INTERNAL_VARIABLE_VALUE_PROP = 'value';
const INTERNAL_VARIABLE_TYPE_PROP = '__markVarInternalType';

enum MarkVariableType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    NULL = 'null'
};


const MarkVariableInternalTypePattern = {
    [MarkVariableType.STRING]: () => /'(.*)'/,
    [MarkVariableType.NUMBER]: () => /\d+/,
    [MarkVariableType.BOOLEAN]: () => /(true|false)/,
    [MarkVariableType.NULL]: () => /null/
};

export interface DeserializedMarkVariableObject {
    name?: string,
    type?: MarkVariableType,
    value?: any;
    defaultValue?: any;
}

export class MarkVariable {
    name: string;
    type: MarkVariableType;
    defaultValue: any;
    value: any;

    /*
        The serialization standard for a MarkVariable is:

        ${name:'name', type:'TYPE', value:'the value', defaultValue:'the default value'}

        it's kind of like JSON. whitespace chars inside curly braces don't matter.
     */
    constructor(serializedText: string) {
        // go through serialized text and extract properties to object
        let deserialized: DeserializedMarkVariableObject = MarkVariable.deserialize(serializedText);

        if (deserialized.name){
            this.name = deserialized.name;
        }

        if (deserialized.type){
            this.type = deserialized.type;
        }

        if (deserialized.value) {
            this.value = deserialized.value;
        }

        if (deserialized.defaultValue){
            this.defaultValue = deserialized.defaultValue;
        }

    }

    static deserialize = (text: string): DeserializedMarkVariableObject =>{
        if (!VARIABLE_REGEX().test(text)){
            throw new TypeError(`${text} is not a MarkWahlberg variable`);
        }

        // since the pattern matches, we can disregard the first 3 characters "${{" and the last 2 characters "}}"
        //console.log(text);
        const PROP_START_IDX = 3;
        const PROP_END_IDX = text.length - 2;

        const internalStr = text.substring(PROP_START_IDX, PROP_END_IDX);

        // now we parse the text. split by comma...
        const internalParts = internalStr.split(',');
        let internalObj: DeserializedMarkVariableObject = {};
        const parts = internalParts.map( partStr => MarkVariable.parseSerializedProp(partStr));

        // validate type
        const givenType: any = parts.find(([key]) => key === 'type');
        let finalType: MarkVariableType | null = null;
        for (let type in MarkVariableType){
            if (givenType === type){
                finalType = givenType;
                break;
            }
        }
        if (!finalType){
            throw new Error(`MarkVariableType ${givenType} does not exist.`);
        }
        internalObj.type = finalType;

        // validate value and defaultValue against type
        // these validations fail gracefully -- if fails, the value doesn't get returned
        const value: any = parts.find(([key]) => key === 'value');
        const defaultValue: any = parts.find(([key]) => key === 'defaultValue');
        if (!value && !defaultValue){
            throw new Error(`${text} does not have a value or a defaultValue`);
        }
        if (value && MarkVariable.validateValue(finalType, value)){
            internalObj.value = value;
        }
        if (defaultValue && MarkVariable.validateValue(finalType, defaultValue)){
            internalObj.defaultValue = defaultValue;
        }

        return internalObj;
    };

    static parseSerializedProp = (propStr: string) => {
        const PROP_PATTERN = /^[\s]*([a-zA-Z][a-zA-Z\d]*)[\s]*:[\s]*('.*'|true|false|null|\d+)[\s]*$/;
        if (!PROP_PATTERN.test(propStr)){
            throw new TypeError(`${propStr} is not a serialized MarkVariable property`);
        }

        let parseResult = PROP_PATTERN.exec(propStr);
        let key = parseResult[1];
        let value = parseResult[2];

        return [ key, value ];
    };

    private static validateValue(type: MarkVariableType, value: any){
        return MarkVariableInternalTypePattern[type]().test(value);
    }

    // the opposite of what deserialize() does: take the properties and return them in a string
    serialize(){
        let internalStr = '';
        let propertyStrings: string[] = [];

        propertyStrings.push(`name: ${this.name}`);
        propertyStrings.push(`type: ${this.type}`);

        const getValueString = (val: string) => {
            let valStr: string;
            if (this.type === MarkVariableType.STRING){
                valStr = `'${this.value}'`;
            } else {
                valStr = `${this.value}`;
            }

            return valStr;
        };

        if (this.value){
            propertyStrings.push(`value: ${getValueString(this.value)}`);
        }
        if (this.defaultValue){
            propertyStrings.push(`value: ${getValueString(this.defaultValue)}`);
        }

        propertyStrings.forEach((str, idx)=>{
            internalStr += str + (idx === propertyStrings.length - 1 ? ', ' : '');
        });

        return '${{' + internalStr + '}}';
    }
}


/*
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
};*/
