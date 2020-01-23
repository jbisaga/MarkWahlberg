# MarkWahlberg
A templating engine for complex data inside documents. It's not markup, it's MarkWahlberg.


## Getting started
Run `npm install mark-wahlberg`

## What is a MarkWahlberg template?
Glad you asked. A template is just a string containing zero or more embedded data points.
This is a template:
```
When you go to the store, remember to pick up 4 gallons of milk.
```
Now, it doesn't contain any embedded information, but it _is_ a template. A template with MarkWahlberg-embedded information would be
```
When you go to the ${{name: milkPlace, type: STRING, defaultValue: 'store'}}, 
remember to pick up ${{name: milkGallonsCount, type: NUMBER, defaultValue: 4}} gallons of
milk.
```
Disregarding why you'd need that much milk, there are 2 variables embedded in this template:
1. **milkPlace**, whose `type` is `STRING` and whose default value is `'store'`
2. **milkGallonsCount**, whose `type` is `NUMBER` and whose default value is `4`

## API

### `MarkTemplate` Class

#### constructor(templateString: string)

#### template.getVariables() => MarkVariable[]
#### template.getVariable(name: string) => MarkVariable | null
#### template.serialize() => string[]




### `MarkVariable` Class
#### constructor(variableString: string)
If you must create your own `MarkVariable` instances, use this constructor. Always use MarkVariable.isValidVariableString() before using it in the constructor -- if an invalid string is passed, it will throw a `TypeError`.
```javascript
let variable;
const variableStr = '${{name: foo, type: NUMBER, defaultValue: 1}}'
if (MarkVariable.isValidVariableString(variableStr)){
  variable = new MarkVariable(variableStr);
}
```

#### MarkVariable.isValidVariableString(str: string) => boolean
Use this function to check whether a string is a valid MarkVariable. **Always** use this function if you are creating a `MarkVariable` by yourself.
```javascript
const validStr = '${{name: foo, type: NUMBER, defaultValue: 1}}'
const invalidStr = '$(name: foo, type: NUMBER,)';

MarkVariable.isValidVariableString(validStr); // true
MarkVariable.isValidVariableString(invalidStr); // false

```

## Should I use this in my production application?
Not yet. There are still a lot of kinks to be worked out and security to be tightened up. Obviously feel free to use this an experimental way or contribute to development 😊. v1.0.0 will be released when it's ready to be used in production.
