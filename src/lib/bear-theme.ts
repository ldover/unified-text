/// Extension to enable the Bear theme for a configured MarkdownParser:
// MarkdownParser should be configured with the following tags, which enable us to style Markdown in a more granular way:
// 	- "HeaderMark": tags.heading,
// 	- "ListMark QuoteMark HardBreak": tags.special(tags.processingInstruction),
// 	- "CodeText": tags.special(tags.monospace),
// 	- "CodeInfo": tags.special(tags.labelName),
// And it depends on these extensions:
// - Strikethrough
// - TaskList
//
import type { Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t, tags } from '@lezer/highlight';

const headingGray = '#444444',
	fontGray = '#464646',
	linkBracketGray = '#D9D9D9',
	// Note: background should be transparent so other styles like selection remain visible
	codeBlockGrayBackground = 'rgba(240, 240, 240, 0.5)',
	selectionBackground = '#E8F2FC',
	dropdownSelectionBackground = '#ECECED',
	dropdownBorder = '#BEBEBE',
	red = '#DE4C4F',
	background = '#FFFFFF',
	strikethroughGray = '#878888';

/// The colors used in the theme, as CSS color strings.
export const color = {
	headingGray,
	fontGray,
	linkBracketGray,
	codeBlockGrayBackground,
	selectionBackground,
	red,
	background,
	strikethroughGray,
	dropdownSelectionBackground
};

export interface BearThemeOptions {
	fontSize?: string;
	width?: string;
}

export const bearTheme = (options?: BearThemeOptions) => {
	const defaultOptions = {
		fontSize: '18px',
		width: '700px'
	};

	const opts = Object.assign({}, defaultOptions, options || {});

	return EditorView.theme(
		{
			'&': {
				width: '100%',
				paddingTop: '16px',
				height: '100%',
				color: '#1f1f1f',
				fontSize: opts.fontSize,
				backgroundColor: 'rgb(254, 254, 254)'
			},
			'&.cm-focused': {
				outline: 'none' // Hide the outline of the focused editor
			},
			'.cm-img': {
				maxHeight: '300px'
			},
			'.cm-scroller': {
				paddingTop: '24px',
				width: "100%",
				justifyContent: "center"
			},
			'.cm-content': {
				caretColor: color.red,
				fontFamily: 'BearSansUI',
				maxWidth: opts.width,
				width: opts.width
			},
			'.cm-activeLine': {
				backgroundColor: 'transparent'
			},
			'.cm-line': {
				lineHeight: '170%',
				padding: '0 54px'
			},
			'&.cm-focused .cm-cursor': {
				// Caret
				borderLeftColor: color.red,
				borderLeftWidth: '2px'
			},
			'.cm-gutters': {
				display: 'none' // Hide gutters
			},
			'.cm-hidden-url': {
				color: linkBracketGray // Style for hidden url widget "..." in: "[title](...)"
			},
			'&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
				backgroundColor: 'transparent' // Override highlighting matching bracket
			},
			'.cm-selectionMatch': {
				backgroundColor: 'transparent' // Override highlighting text that matches selection
			},
			'.cm-tooltip': {
				borderColor: dropdownBorder,
				boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.1)',
				borderRadius: '10px',
				padding: '8px',
				backgroundColor: color.background
			},
			'.cm-tooltip-autocomplete': {
				'& > ul > li > .cm-completionLabel': {
					fontFamily: 'BearSansUI',
					color: fontGray,
					fontSize: '14px'
				},
				'& > ul > li > .cm-completionLabel > .cm-completionMatchedText': {
					fontWeight: 'bold',
					textDecoration: 'none'
				},
				'& > ul > li[aria-selected]': {
					backgroundColor: color.dropdownSelectionBackground,
					color: fontGray,
					borderRadius: '4px'
				}
			}
		},
		{ dark: false }
	);
};

export const bearHighlightStyle = HighlightStyle.define([
	//
	// Markdown style tags
	//
	{
		tag: tags.link,
		textDecoration: 'none',
		color: color.red
	},
	{
		tag: tags.heading1,
		fontFamily: 'BearSansUIHeadline',
		color: color.headingGray,
		fontSize: '32px',
		fontWeight: 'normal',
	},
	{
		tag: tags.heading2,
		fontFamily: 'BearSansUIHeadline',
		color: color.headingGray,
		fontSize: '26px',
		fontWeight: 'normal',
	},
	{
		tag: tags.heading3,
		fontFamily: 'BearSansUIHeadline',
		color: color.headingGray,
		fontSize: '20px',
		fontWeight: 'normal',
	},
	{
		tag: tags.heading4,
		fontFamily: 'BearSansUIHeadline',
		color: color.headingGray,
		fontSize: '18px',
		fontWeight: 'normal',
	},
	{
		tag: tags.heading5,
		fontFamily: 'BearSansUIHeadline',
		color: color.headingGray,
		fontSize: '18px',
		fontWeight: 'normal',
	},
	{
		tag: tags.heading6,
		fontFamily: 'BearSansUIHeadline',
		color: color.headingGray,
		fontSize: '18px',
		fontWeight: 'normal',
	},
	{
		tag: tags.monospace, // InlineCode
		fontFamily: 'Roboto Mono, monospace',
		backgroundColor: color.codeBlockGrayBackground,
		color: color.fontGray,
	},
	{
		tag: tags.special(tags.labelName),  // CodeInfo
		fontFamily: 'Roboto Mono, monospace',
		color: color.strikethroughGray,
	},
	{
		tag: tags.emphasis,
		fontStyle: 'italic'
	},
	{
		tag: tags.strong,
		fontWeight: 'bold'
	},
	{
		tag: tags.strikethrough,
		textDecoration: 'line-through',
		color: color.strikethroughGray
	},
	{
		tag: t.processingInstruction,  // LinkMark EmphasisMark CodeMark
		color: color.linkBracketGray
	},
	{
		tag: [
			tags.url,
			tags.special(tags.processingInstruction), // ListMark, QuoteMark, HardBreak
			t.atom  // TaskMarker (TaskList extension)
		],
		color: color.red
	},
	{
		tag: tags.special(tags.monospace), // CodeText (multi-line code block without CodeInfo)
		fontFamily: 'Roboto Mono, monospace',
		color: color.strikethroughGray
	},
	//
	// Code style tags
	//
	// We use this theme: https://github.com/vadimdemedes/thememirror/blob/main/source/themes/espresso.ts,
	// because it matches Bear UI theme very well
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
	},
]);

export const bear: Extension = [bearTheme(), syntaxHighlighting(bearHighlightStyle)];
