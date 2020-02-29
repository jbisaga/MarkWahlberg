import {MarkWahlberg} from "../../src/MarkWahlberg";
import * as fs from "fs";
const originalFile1Text = fs.readFileSync(__dirname+'/../test-data/markdown1.md').toString('utf8');

describe ('MarkWahlberg', () => {
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
            let mark = new MarkWahlberg(originalFile1Text);
            expect(mark.getVariables()).toHaveLength(2);
            done();
        });

        it ('assigns correct template indexes for test Mark text', (done) => {
            let mark = new MarkWahlberg(originalFile1Text);
            expect(mark.getVariables()[0].index).toEqual(6);
            expect(mark.getVariables()[1].index).toEqual(158);
            done();
        })
    });

    describe ('parse', () => {
        describe( 'file with only value-given variables', () => {
            let mark: MarkWahlberg;
            let files: { [key: string]: string };

            beforeAll(() => {
                files = {
                    initial: fs.readFileSync(__dirname + '/../test-data/all-have-values/initial.md').toString('utf8'),
                    noPassedValues: fs.readFileSync(__dirname + '/../test-data/all-have-values/noPassedValues.md').toString('utf8'),
                }
            });

            beforeEach(() => {
                mark = new MarkWahlberg(files.initial);
            });

            it ('correctly assigns intrinsic values to variables', () => {
                const notStrict = mark.parse();
                const strict = mark.parse({}, true);

                expect(notStrict).toEqual(files.noPassedValues);
                expect(strict).toEqual(files.noPassedValues);
            });

            //it ('correctly assigns given values to variables', () => {});
        })
    });
});

