import { MarkVariable } from "../../src/MarkVariable";

describe('MarkVariable', () => {
    describe('Markvariable parseSerializedProp()', () => {
        it ('rejects string with disallowed characters in key or no key at all', (done)=>{
            let badPatterns = [
                "'key1': 'bar'",
                "'key1: 'bar'",
                "key1': 'bar'",
                "1key: 'bar'",
                "key!: 'bar'",
                ": 'bar'",
                ": 1",
                ": true",
            ];

            badPatterns.forEach( pattern => {
                expect( () => {
                    MarkVariable.parseSerializedProp(pattern);
                }).toThrow(TypeError);
            });

            done();
        });


        it ('rejects string with well-formed key and value but no colon',  (done) => {
            let badPatterns = [
                "key 'value'",
                "key'value'",
                "key1",
                "key     'value'"
            ];

            badPatterns.forEach( pattern => {
                expect( () => {
                    MarkVariable.parseSerializedProp(pattern);
                }).toThrow(TypeError);
            });

            done();
        });

        it ('parses string with varying amounts of whitespace',  (done) => {
            let strings = [
                "foo: 'bar'",
                "      foo: 'bar'",
                "foo: 'bar'      ",
                "foo     :       'bar'",
                "   foo: 100   ",
                "   foo:        true",
                "foo:    null        ",
            ];

            strings.forEach( str => {
                let parsed = MarkVariable.parseSerializedProp(str);
                expect(parsed).toBeTruthy();
                expect(parsed[0]).toBeTruthy();
                expect(parsed[1]).toBeDefined();
            });
            done();
        });
    });

    describe('MarkVariable deserialize()', () => {
        it ('deserializes well-formed variable string', (done) => {
            let variable = "${{type: STRING, name: BAT!, value: '', defaultValue: 'yeee' }}";
            let markObj = MarkVariable.deserialize(variable);

            expect(markObj).toBeTruthy();
            expect(markObj.type).toBeTruthy();
            expect(markObj.type).toBe('STRING');
            expect(markObj.name).toBeTruthy();
            expect(markObj.name).toBe('BAT!');
            expect(markObj.value).toBe('')
            expect(markObj.defaultValue).toBeTruthy();
            expect(markObj.defaultValue).toBe('yeee');

            done();
        });
    });

    describe('MarkVariable().serialize()', () => {
        it ('serializes a (standard formed) property so it equals the same thing deserialized again', (done) => {
            let variableStr = "${{type: STRING, name: dingus, defaultValue: 'dangus'}}";
            let variable = new MarkVariable(variableStr);

            let serialized = variable.serialize();
            let secondTimeVariable = new MarkVariable(serialized);

            expect(variable.type).toBe(secondTimeVariable.type);
            expect(variable.name).toBe(secondTimeVariable.name);
            expect(variable.defaultValue).toBe(secondTimeVariable.defaultValue);

            done();
        });
    });

    describe ('matchesType()', () => {
        it ('matches correctly for string type', () => {
            const variableStr = "${{type: STRING, name: foo, defaultValue: ''}}";
            const variable = new MarkVariable(variableStr);

            expect(variable.matchesType('it a string')).toEqual(true);
            expect(variable.matchesType('')).toEqual(true);
            expect(variable.matchesType(123123)).toEqual(false);
            expect(variable.matchesType(123.123)).toEqual(false);
            expect(variable.matchesType({foo: 'bar'})).toEqual(false);
            expect(variable.matchesType(['foo', 'bar'])).toEqual(false);
            expect(variable.matchesType(true)).toEqual(false);
            expect(variable.matchesType(false)).toEqual(false);
            expect(variable.matchesType(null)).toEqual(false);
            expect(variable.matchesType(undefined)).toEqual(false);
        });
        it ('matches correctly for number type', () => {
            const variableStr = "${{type: NUMBER, name: foo, defaultValue: 11}}";
            const variable = new MarkVariable(variableStr);

            expect(variable.matchesType('it a string')).toEqual(false);
            expect(variable.matchesType('')).toEqual(false);
            expect(variable.matchesType(123123)).toEqual(true);
            expect(variable.matchesType(123.123)).toEqual(true);
            expect(variable.matchesType({foo: 12})).toEqual(false);
            expect(variable.matchesType([1, 2])).toEqual(false);
            expect(variable.matchesType(true)).toEqual(false);
            expect(variable.matchesType(false)).toEqual(false);
            expect(variable.matchesType(null)).toEqual(false);
            expect(variable.matchesType(undefined)).toEqual(false);
        });
        it ('matches correctly for boolean type', () => {
            const variableStr = "${{type: BOOLEAN, name: foo, defaultValue: false}}";
            const variable = new MarkVariable(variableStr);

            expect(variable.matchesType('it a string')).toEqual(false);
            expect(variable.matchesType('')).toEqual(false);
            expect(variable.matchesType(123123)).toEqual(false);
            expect(variable.matchesType(123.123)).toEqual(false);
            expect(variable.matchesType({foo: 12})).toEqual(false);
            expect(variable.matchesType([1, 2])).toEqual(false);
            expect(variable.matchesType(true)).toEqual(true);
            expect(variable.matchesType(false)).toEqual(true);
            expect(variable.matchesType(null)).toEqual(false);
            expect(variable.matchesType(undefined)).toEqual(false);
        });
        it ('matches correctly for null type', () => {
            const variableStr = "${{type: NULL, name: foo, defaultValue: null}}";
            const variable = new MarkVariable(variableStr);

            expect(variable.matchesType('it a string')).toEqual(false);
            expect(variable.matchesType('')).toEqual(false);
            expect(variable.matchesType(123123)).toEqual(false);
            expect(variable.matchesType(123.123)).toEqual(false);
            expect(variable.matchesType({foo: 12})).toEqual(false);
            expect(variable.matchesType([1, 2])).toEqual(false);
            expect(variable.matchesType(true)).toEqual(false);
            expect(variable.matchesType(false)).toEqual(false);
            expect(variable.matchesType(null)).toEqual(true);
            expect(variable.matchesType(undefined)).toEqual(false);
        });
    });

    /*
    describe ('MarkVariable constructor parsing', function(){
        it ('parses a standard variable and builds an object with all properties', function(done){});
        it ('parses a nonstandard variable and builds an object with only the standard properties', function(done){});
    });
     */


});
