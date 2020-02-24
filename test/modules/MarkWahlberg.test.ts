import * as fs from "fs";
import { MarkWahlberg } from "../../src/MarkWahlberg";
import { MarkVariable } from "../../src/MarkVariable";

const originalFileText = fs.readFileSync(__dirname+'/../test-data/markdown1.md').toString('utf8');

describe('MarkWahlberg.js', () => {
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

    /*
    describe ('MarkVariable constructor parsing', function(){
        it ('parses a standard variable and builds an object with all properties', function(done){});
        it ('parses a nonstandard variable and builds an object with only the standard properties', function(done){});
    });
     */

    describe('property checks', () => {
        it ('gets no variables for constructor with empty string', (done) => {
            let empty = new MarkWahlberg();

            expect(empty.getVariables()).toHaveLength(0);
            done();
        });
        it ('has empty text for constructor with empty string', (done) => {
            let empty = new MarkWahlberg();

            expect(empty.getText()).toBe('');
            done();
        });


        it ('has 2 variables for test Mark text with 2 variables', (done) => {
            let mark = new MarkWahlberg(originalFileText);
            expect(mark.getVariables()).toHaveLength(2);
            done();
        });


    });
});
