// Type definitions for mark-wahlberg
// Project: mark-wahlberg
// Definitions by: jbisaga

/*~ This is the module template file for class modules.
 *~ You should rename it to index.d.ts and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

// Note that ES6 modules cannot directly export class objects.
// This file should be imported using the CommonJS-style:
//   import x = require('[~THE MODULE~]');
//
// Alternatively, if --allowSyntheticDefaultImports or
// --esModuleInterop is turned on, this file can also be
// imported as a default import:
//   import x from '[~THE MODULE~]';
//
// Refer to the TypeScript documentation at
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
// to understand common workarounds for this limitation of ES6 modules.


/*~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */
import {TemplateVariable} from "./src/TemplateVariable";
import {VariableValue} from "./src/MarkWahlberg";

export = MarkWahlberg;

/*~ Write your module's methods and properties in this class */
declare class MarkWahlberg {
    constructor(text?: string);

    someProperty: string[];

    getText(): string;

    getVariables: TemplateVariable[];

    parse(varValues?: VariableValue, strict?: boolean): string;
}