import { MarkVariable, MarkVariableType } from "../../src/MarkVariable";

describe('MarkVariable', () => {
    describe('parse for correct types', () => {
        describe('number', () => {
            let variable1: MarkVariable;
            let variable2: MarkVariable;
            beforeEach(() => {
                variable1 = new MarkVariable('${{ name: variable1, type: NUMBER, defaultValue: 10}}');
                variable2 = new MarkVariable('${{ name: variable2, type: NUMBER, value: 123.45, defaultValue: 10}}');
            });

            it ('assigns type', () => {
                expect(variable1.type).toBe(MarkVariableType.NUMBER);
                expect(variable2.type).toBe(MarkVariableType.NUMBER);
            });
            it ('assigns internal values correctly', () => {
                expect(variable1.value).toBeFalsy();
                expect(variable1.defaultValue).toBe(10);
                expect(variable2.value).toBe(123.45);
                expect(variable2.defaultValue).toBe(10);
            });
        });
        describe('string', () => {
            let variable1: MarkVariable;
            let variable2: MarkVariable;
            beforeEach(() => {
                variable1 = new MarkVariable('${{ name: variable1, type: STRING, defaultValue: \'foo\'}}');
                variable2 = new MarkVariable('${{ name: variable2, type: STRING, value: \'baz\', defaultValue: \'bat\'}}');
            });

            it ('assigns type', () => {
                expect(variable1.type).toBe(MarkVariableType.STRING);
                expect(variable2.type).toBe(MarkVariableType.STRING);
            });
            it ('assigns internal values correctly', () => {
                expect(variable1.value).toBeFalsy();
                expect(variable1.defaultValue).toBe('foo');
                expect(variable2.value).toBe('baz');
                expect(variable2.defaultValue).toBe('bat');
            });
        });

        describe('boolean', () => {
            let variable1: MarkVariable;
            let variable2: MarkVariable;
            beforeEach(() => {
                variable1 = new MarkVariable('${{ name: variable1, type: BOOLEAN, defaultValue: true}}');
                variable2 = new MarkVariable('${{ name: variable2, type: BOOLEAN, value: true, defaultValue: false}}');
            });

            it ('assigns type', () => {
                expect(variable1.type).toBe(MarkVariableType.BOOLEAN);
                expect(variable2.type).toBe(MarkVariableType.BOOLEAN);
            });
            it ('assigns internal values correctly', () => {
                expect(variable1.value).toBeFalsy();
                expect(variable1.defaultValue).toBe(true);
                expect(variable2.value).toBe(true);
                expect(variable2.defaultValue).toBe(false);
            });
        });

    });

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

    describe('Type validation', () => {
        describe ('string', () => {
            it ('throws error for incorrect default value', () => {
                const badStr1 = '${{type: STRING, name: variable1, defaultValue: 10}}';
                const badStr2 = '${{type: STRING, name: variable1, defaultValue: true}}';

                expect(() => {
                    new MarkVariable(badStr1);
                }).toThrow(new TypeError('variable1 is a STRING, NUMBER given'));

                expect(() => {
                    new MarkVariable(badStr2);
                }).toThrow(new TypeError('variable1 is a STRING, BOOLEAN given'));
            });

            it ('throws error for incorrect value', () => {
                const badStr1 = '${{type: STRING, name: variable1, value: 30, defaultValue: \'foo\'}}';
                const badStr2 = '${{type: STRING, name: variable1, value: true, udefaultValue: \'bar\'}}';

                expect(() => {
                    new MarkVariable(badStr1);
                }).toThrow(new TypeError('variable1 is a STRING, NUMBER given'));

                expect(() => {
                    new MarkVariable(badStr2);
                }).toThrow(new TypeError('variable1 is a STRING, BOOLEAN given'));
            });
        });

        describe ('number', () => {
            it ('throws error for incorrect default value', () => {
                const badStr1 = '${{type: NUMBER, name: variable1, defaultValue: \'10\'}}';
                const badStr2 = '${{type: NUMBER, name: variable1, defaultValue: true}}';

                expect(() => {
                    new MarkVariable(badStr1);
                }).toThrow(new TypeError('variable1 is a NUMBER, STRING given'));

                expect(() => {
                    new MarkVariable(badStr2);
                }).toThrow(new TypeError('variable1 is a NUMBER, BOOLEAN given'));
            });

            it ('throws error for incorrect value', () => {
                const badStr1 = '${{type: NUMBER, name: variable1, value: \'foobar\', defaultValue: -155.53}}';
                const badStr2 = '${{type: NUMBER, name: variable1, value: false, udefaultValue: 399}}';

                expect(() => {
                    new MarkVariable(badStr1);
                }).toThrow(new TypeError('variable1 is a NUMBER, STRING given'));

                expect(() => {
                    new MarkVariable(badStr2);
                }).toThrow(new TypeError('variable1 is a NUMBER, BOOLEAN given'));
            });
        });

        describe ('boolean', () => {
            it ('throws error for incorrect default value', () => {
                const badStr1 = '${{type: BOOLEAN, name: variable1, defaultValue: \'foo bar\'}}';
                const badStr2 = '${{type: BOOLEAN, name: variable1, defaultValue: 100.8}}';

                expect(() => {
                    new MarkVariable(badStr1);
                }).toThrow(new TypeError('variable1 is a BOOLEAN, STRING given'));

                expect(() => {
                    new MarkVariable(badStr2);
                }).toThrow(new TypeError('variable1 is a BOOLEAN, NUMBER given'));
            });

            it ('throws error for incorrect value', () => {
                const badStr1 = '${{type: BOOLEAN, name: variable1, value: \'foo bar?\', defaultValue: true}}';
                const badStr2 = '${{type: BOOLEAN, name: variable1, value: -49, udefaultValue: false}}';

                expect(() => {
                    new MarkVariable(badStr1);
                }).toThrow(new TypeError('variable1 is a BOOLEAN, STRING given'));

                expect(() => {
                    new MarkVariable(badStr2);
                }).toThrow(new TypeError('variable1 is a BOOLEAN, NUMBER given'));
            });
        });
    });

    describe('MarkVariable deserialize()', () => {
        it ('deserializes well-formed variable string', (done) => {
            const variable = "${{type: STRING, name: BAT!, value: '', defaultValue: 'yeee' }}";
            const markObj = MarkVariable.deserialize(variable);

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

            expect(variable.matchesType('it a string')).toBe(true);
            expect(variable.matchesType('')).toBe(true);
            expect(variable.matchesType(123123)).toBe(false);
            expect(variable.matchesType(123.123)).toBe(false);
            expect(variable.matchesType({foo: 'bar'})).toEqual(false);
            expect(variable.matchesType(['foo', 'bar'])).toEqual(false);
            expect(variable.matchesType(true)).toBe(false);
            expect(variable.matchesType(false)).toBe(false);
            expect(variable.matchesType(null)).toBe(false);
            expect(variable.matchesType(undefined)).toBe(false);
        });
        it ('matches correctly for number type', () => {
            const variableStr = "${{type: NUMBER, name: foo, defaultValue: 11}}";
            const variable = new MarkVariable(variableStr);

            expect(variable.matchesType('it a string')).toBe(false);
            expect(variable.matchesType('')).toBe(false);
            expect(variable.matchesType(123123)).toBe(true);
            expect(variable.matchesType(123.123)).toBe(true);
            expect(variable.matchesType({foo: 12})).toEqual(false);
            expect(variable.matchesType([1, 2])).toEqual(false);
            expect(variable.matchesType(true)).toBe(false);
            expect(variable.matchesType(false)).toBe(false);
            expect(variable.matchesType(null)).toBe(false);
            expect(variable.matchesType(undefined)).toBe(false);
        });
        it ('matches correctly for boolean type', () => {
            const variableStr = "${{type: BOOLEAN, name: foo, defaultValue: false}}";
            const variable = new MarkVariable(variableStr);

            expect(variable.matchesType('it a string')).toBe(false);
            expect(variable.matchesType('')).toBe(false);
            expect(variable.matchesType(123123)).toBe(false);
            expect(variable.matchesType(123.123)).toBe(false);
            expect(variable.matchesType({foo: 12})).toEqual(false);
            expect(variable.matchesType([1, 2])).toEqual(false);
            expect(variable.matchesType(true)).toBe(true);
            expect(variable.matchesType(false)).toBe(true);
            expect(variable.matchesType(null)).toBe(false);
            expect(variable.matchesType(undefined)).toBe(false);
        });
    });

    /*
    describe ('MarkVariable constructor parsing', function(){
        it ('parses a standard variable and builds an object with all properties', function(done){});
        it ('parses a nonstandard variable and builds an object with only the standard properties', function(done){});
    });
     */


});
