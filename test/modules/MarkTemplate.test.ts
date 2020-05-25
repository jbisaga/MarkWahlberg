import {MarkTemplate} from "../../src/MarkTemplate";
import * as fs from "fs";
const originalFile1Text = fs.readFileSync(__dirname+'/../test-data/markdown1.md').toString('utf8');

describe ('MarkWahlberg', () => {
    describe('property checks', () => {
        it ('gets no variables for constructor with empty string', (done) => {
            let empty = new MarkTemplate();

            expect(empty.getVariables()).toHaveLength(0);
            done();
        });
        it ('has empty text for constructor with empty string', (done) => {
            let empty = new MarkTemplate();

            expect(empty.getText()).toBe('');
            done();
        });


        it ('has 2 variables for test Mark text with 2 variables', (done) => {
            let mark = new MarkTemplate(originalFile1Text);
            expect(mark.getVariables()).toHaveLength(2);
            done();
        });

        it ('assigns correct template indexes for test Mark text', (done) => {
            let mark = new MarkTemplate(originalFile1Text);
            expect(mark.getVariables()[0].index).toEqual(6);
            expect(mark.getVariables()[1].index).toEqual(158);
            done();
        })
    });

    describe ('parse', () => {
        describe( 'file with only value-given variables', () => {
            let mark: MarkTemplate;
            let files: { [key: string]: string };

            beforeAll(() => {
                files = {
                    initial: fs.readFileSync(__dirname + '/../test-data/all-have-values/initial.md').toString('utf8'),
                    noPassedValues: fs.readFileSync(__dirname + '/../test-data/all-have-values/noPassedValues.md').toString('utf8'),
                    passedValues: fs.readFileSync(__dirname + '/../test-data/all-have-values/passedValues.md').toString('utf8'),
                }
            });

            beforeEach(() => {
                mark = new MarkTemplate(files.initial);
            });

            it ('correctly assigns intrinsic values to variables', () => {
                const notStrict = mark.parse();
                const strict = mark.parse({strict: true});

                expect(notStrict).toEqual(files.noPassedValues);
                expect(strict).toEqual(files.noPassedValues);
            });

            it ('correctly assigns given values to variables', () => {
                const passed = {variable1: 'it\'s a value woo', variable2: -999.999};

                const notStrict = mark.parse({varValues: passed});
                const strict = mark.parse({varValues: passed, strict: true});

                expect(notStrict).toEqual(files.passedValues);
                expect(strict).toEqual(files.passedValues);
            });

            it ('throws error for given values of invalid types', () => {
                const passed = {variable1: false, variable2: 'stringy'};
                const expectedErrMessage = 'Cannot assign false to variable variable1';

                expect(() => {
                    mark.parse({varValues: passed});
                }).toThrow(new TypeError(expectedErrMessage));

                expect(() => {
                    mark.parse({varValues: passed, strict: true});
                }).toThrow(new TypeError(expectedErrMessage));
            })
        })
    });

    describe('getVariablesForInnerText', () => {
        let mark: MarkTemplate;

        beforeEach(() => {
            const template = `
                # fooooooo
                # bar \${{name: variable1, type: STRING, value: 'bar'}}
                ## heading \${{ name: variable2, type: NUMBER, value: 4 }}
            `;
            mark = new MarkTemplate(template);
        });

        it('finds existing variable in text regardless of value', () => {
            const str = "Agreement for ${{name: variable1, type: STRING, defaultValue: 'defaultValue'}}";
            const vars = mark.getVariablesForInnerText(str);
            expect(vars).toHaveLength(1);
            expect(vars[0].variable.name).toBe(mark.getVariables()[0].variable.name);
            expect(vars[0].strLength).toBe(64);
            expect(vars[0].index).toBe(14);
        });
    });
});

