/// Extension to enable the Bear theme
import type { Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t, tags } from '@lezer/highlight';

const headingGray = '#444444',
	fontGray = '#464646',
	linkBracketGray = '#D9D9D9',
	codeBlockGrayBackground = '#F3F5F7',
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
		tag: tags.monospace,
		fontFamily: 'Roboto Mono, monospace',
		color: color.strikethroughGray
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
		tag: t.processingInstruction,
		color: color.linkBracketGray
	},
	{
		tag: [tags.url, tags.special(tags.processingInstruction)],
		color: color.red
	},
]);

export const bear: Extension = [bearTheme(), syntaxHighlighting(bearHighlightStyle)];
