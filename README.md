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

## Should I use this in my production application?
Not yet. There are still a lot of kinks to be worked out and security to be tightened up. Obviously feel free to use this an experimental way or contribute to development 😊. v1.0.0 will be released when it's ready to be used in production.
