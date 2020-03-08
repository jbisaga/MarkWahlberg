export const VARIABLE_REGEX = () => /\${{.+}}/g;
// const INTERNAL_VARIABLE_VALUE_PROP = 'value';
// const INTERNAL_VARIABLE_TYPE_PROP = '__markVarInternalType';

export enum MarkVariableType {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    UNKNOWN = 'UNKNOWN'
};

export type MarkVariableValueType = string | number | boolean | null;

const MarkVariableInternalTypePattern = {
    [MarkVariableType.STRING]: () => /'(.*)'/,
    [MarkVariableType.NUMBER]: () => /^[-+]?[0-9]*\.?[0-9]+$/,
    [MarkVariableType.BOOLEAN]: () => /(true|false)/,
    [MarkVariableType.UNKNOWN]: () => new RegExp(''),
};

const MarkVariableTypeConvert =  {
    [MarkVariableType.STRING]: (str: string) => {
        return str.replace(/^\s*'(.*)'\s*$/, (a, matched)=> {
            return matched;
        })
    },
    [MarkVariableType.NUMBER]: (val: string) => parseFloat(val),
    [MarkVariableType.BOOLEAN]: (val: string) => val === 'true',
    [MarkVariableType.UNKNOWN]: (val: string) => val,
}

export interface VariableValueTypeValidationResult {
    valid: boolean;
    type: MarkVariableType
}

export interface DeserializedMarkVariableObject {
    name?: string,
    type?: MarkVariableType,
    value?: any;
    defaultValue?: any;
}

export class MarkVariable {
    name: string = '';
    type: MarkVariableType = MarkVariableType.UNKNOWN;
    defaultValue: any = null;
    value: any = null;

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

        if (deserialized.value !== undefined) {
            this.value = deserialized.value;
        }

        if (deserialized.defaultValue !== undefined){
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
        const partsName = parts.find(([key]) => key === 'name');
        if (partsName){
            internalObj.name = partsName[1];
        }

        // validate type
        const partsType = parts.find(([key]) => key === 'type');
        let givenType: any;
        if (partsType){
            givenType = partsType[1];
        } else {
            givenType = MarkVariableType.UNKNOWN;
        }
        let finalType: MarkVariableType = MarkVariableType.UNKNOWN;
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

        const requireValidation = (given: any) => {
            const result = MarkVariable.validateValue(finalType, given);

            if (!result.valid){
                throw new TypeError(`${internalObj.name} is a ${finalType}, ${result.type} given`)
            }
        };

        if (valuePart){
            requireValidation(valuePart[1]);
            internalObj.value = MarkVariable.convertValue(valuePart[1], finalType);
        }
        if (defaultValuePart){
            requireValidation(defaultValuePart[1]);
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
        let key, value;
        if (parseResult && parseResult.length){
            key = parseResult[1];
            value = parseResult[2];
        }

        return [ key, value ];
    };

    private static validateValue(type: MarkVariableType, value: any): VariableValueTypeValidationResult{
        if (MarkVariableInternalTypePattern[type]().test(value)){
            // all good
            return {
                valid: true,
                type: type
            }
        } else {
            // find the actual type of the given value
            let givenType = MarkVariableType.UNKNOWN;
            const otherTypes = Object.values(MarkVariableType).filter(t => {
                return t !== type && t !== MarkVariableType.UNKNOWN;
            });
            otherTypes.forEach((t) => {
                if (MarkVariableInternalTypePattern[t]().test(value)){
                    givenType = t;
                }
            });

            return {
                valid: false,
                type: givenType,
            }
        }
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
        return false;
    }
}
