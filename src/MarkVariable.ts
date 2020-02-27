export const VARIABLE_REGEX = () => /\${{.+}}/g;
// const INTERNAL_VARIABLE_VALUE_PROP = 'value';
// const INTERNAL_VARIABLE_TYPE_PROP = '__markVarInternalType';

enum MarkVariableType {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    NULL = 'NULL'
};

export type MarkVariableValueType = string | number | boolean | null;

const MarkVariableInternalTypePattern = {
    [MarkVariableType.STRING]: () => /'(.*)'/,
    [MarkVariableType.NUMBER]: () => /\d+/,
    [MarkVariableType.BOOLEAN]: () => /(true|false)/,
    [MarkVariableType.NULL]: () => /null/
};

const MarkVariableTypeConvert =  {
    [MarkVariableType.STRING]: (str: string) => {
        return str.replace(/^\s*'(.*)'\s*$/, (a, matched)=> {
            return matched;
        })
    },
    [MarkVariableType.NUMBER]: (val: any) => val,
    [MarkVariableType.BOOLEAN]: (val: any) => val,
    [MarkVariableType.NULL]: (val: any) => val,
}

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

        // validate name
        internalObj.name = parts.find(([key]) => key === 'name')[1];

        // validate type
        const givenType: any = parts.find(([key]) => key === 'type')[1];
        let finalType: MarkVariableType | null = null;
        for (let type in MarkVariableType){
            if (givenType === type){
                finalType = givenType;
            }
        }
        if (!finalType){
            throw new Error(`MarkVariableType ${givenType} does not exist.`);
        }
        internalObj.type = finalType;

        // validate value and defaultValue against type
        // these validations fail gracefully -- if fails, the value doesn't get returned
        const valuePart: any = parts.find(([key]) => key === 'value');
        const defaultValuePart: any = parts.find(([key]) => key === 'defaultValue');
        if (!valuePart && !defaultValuePart){
            throw new Error(`${text} does not have a value or a defaultValue`);
        }
        if (valuePart && MarkVariable.validateValue(finalType, valuePart[1])){
            internalObj.value = MarkVariable.convertValue(valuePart[1], finalType);
        }
        if (defaultValuePart && MarkVariable.validateValue(finalType, defaultValuePart[1])){
            internalObj.defaultValue = MarkVariable.convertValue(defaultValuePart[1], finalType);
        }

        return internalObj;
    };

    static parseSerializedProp = (propStr: string) => {
        const PROP_PATTERN = /^[\s]*([a-zA-Z][a-zA-Z\d]*)[\s]*:[\s]*(.+)[\s]*$/;
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

    private static convertValue(value: any, type: MarkVariableType) : any {
        return MarkVariableTypeConvert[type](value);
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
                valStr = `'${val}'`;
            } else {
                valStr = `${val}`;
            }

            return valStr;
        };

        if (this.value){
            propertyStrings.push(`value: ${getValueString(this.value)}`);
        }
        if (this.defaultValue){
            propertyStrings.push(`defaultValue: ${getValueString(this.defaultValue)}`);
        }

        propertyStrings.forEach((str, idx)=>{
            internalStr += str + (idx !== propertyStrings.length - 1 ? ', ' : '');
        });

        return '${{' + internalStr + '}}';
    }

    public matchesType(value: any): boolean{
        if (this.type === MarkVariableType.STRING){
            return typeof value === 'string';
        }
        if (this.type === MarkVariableType.BOOLEAN){
            return typeof value === 'boolean';
        }
        if (this.type === MarkVariableType.NUMBER){
            return typeof value === 'number';
        }
        if (this.type === MarkVariableType.NULL){
            return value === null;
        }
        return false;
    }
}
