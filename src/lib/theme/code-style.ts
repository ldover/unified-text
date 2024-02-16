import type { TagStyle } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// From: https://github.com/vadimdemedes/thememirror/blob/main/source/themes/espresso.ts,
const espresso: TagStyle[] = [
	{
		tag: t.comment,
		color: '#AAAAAA',
		fontFamily: 'Roboto Mono, monospace'
	},
	{
		tag: [t.keyword, t.operator, t.typeName, t.tagName, t.propertyName],
		color: '#2F6F9F',
		fontWeight: 'bold',
		fontFamily: 'Roboto Mono, monospace'
	},
	{
		tag: [t.attributeName, t.definition(t.propertyName)],
		color: '#4F9FD0',
		fontFamily: 'Roboto Mono, monospace'
	},
	{
		tag: [t.className, t.string, t.special(t.brace)],
		color: '#CF4F5F',
		fontFamily: 'Roboto Mono, monospace'
	},
	{
		tag: t.number,
		color: '#CF4F5F',
		fontWeight: 'bold',
		fontFamily: 'Roboto Mono, monospace'
	},
	{
		tag: t.variableName,
		fontWeight: 'bold',
		fontFamily: 'Roboto Mono, monospace'
	}
];

const espressoOrange: TagStyle[] = [
	{
		tag: t.comment,
		color: '#AAAAAA',
		fontFamily: 'Roboto Mono, monospace'
	},
	{
		tag: [t.keyword, t.operator, t.typeName, t.tagName, t.propertyName],
		color: '#2F6F9F',
		fontFamily: 'Roboto Mono, monospace'
	},
	{
		tag: [t.attributeName, t.definition(t.propertyName)],
		color: '#4F9FD0',
		fontFamily: 'Roboto Mono, monospace'
	},
	{
		tag: [t.className, t.string, t.special(t.brace)],
		color: '#CF6E4F',
		fontFamily: 'Roboto Mono, monospace'
	},
	{
		tag: t.number,
		color: '#CF6E4F',
		fontFamily: 'Roboto Mono, monospace'
	},
	{
		tag: t.variableName,
		fontFamily: 'Roboto Mono, monospace'
	}
];

export { espresso, espressoOrange };
