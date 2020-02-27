import {MarkWahlberg} from "../../src/MarkWahlberg";
import * as fs from "fs";
const originalFileText = fs.readFileSync(__dirname+'/../test-data/markdown1.md').toString('utf8');


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
            let mark = new MarkWahlberg(originalFileText);
            expect(mark.getVariables()).toHaveLength(2);
            done();
        });

        it ('assigns correct template indexes for test Mark text', (done) => {
            let mark = new MarkWahlberg(originalFileText);
            expect(mark.getVariables()[0].index).toEqual(6);
            expect(mark.getVariables()[1].index).toEqual(158);
            done();
        })
    });
});

