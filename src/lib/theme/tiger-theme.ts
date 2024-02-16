// A copy of the Bear theme replacing red with orange
// While I do not like the duplication, the theme will probably change more in the future and so prematurely generalizing this code does not make sense.
import type { MarkdownNodeStyle, MarkdownSettings, ThemeOptions } from './theme.js';
import { espressoOrange } from './code-style.js';

const headingGray = '#444444',
	fontGray = '#464646',
	linkBracketGray = '#D9D9D9',
	// Note: background should be transparent so other styles like selection remain visible
	codeBlockGrayBackground = 'rgba(240, 240, 240, 0.5)',
	selectionBackground = '#E8F2FC',
	tooltipSelectionBackground = '#ECECED',
	tooltipBorder = '#BEBEBE',
	orange = '#EB6301',
	background = '#FFFFFF',
	strikethroughGray = '#878888';

/// The colors used in the theme, as CSS color strings.
export const color = {
	headingGray,
	fontGray,
	linkBracketGray,
	codeBlockGrayBackground,
	selectionBackground,
	orange,
	background,
	strikethroughGray,
	tooltipSelectionBackground
};

const settings: MarkdownSettings = {
	background: color.background,
	foreground: color.fontGray,
	selection: color.selectionBackground,
	caret: color.orange,

	width: '900px',

	requiredFonts: ['BearSansUI', 'BearSansUIHeadline', 'Roboto Mono'],
	defaultFont: 'BearSansUI',
	defaultFontSize: '18px',
	tooltipBorder: tooltipBorder,
	tooltipSelectionBackground: color.tooltipSelectionBackground
};

const styles: MarkdownNodeStyle[] = [
	//
	// Markdown style tags
	//
	{
		node: 'Link',
		textDecoration: 'none',
		color: color.orange
	},
	{
		node: 'ATXHeading1',
		fontFamily: 'BearSansUIHeadline',
		color: color.headingGray,
		fontSize: '32px',
		fontWeight: 'normal'
	},
	{
		node: 'ATXHeading2',
		fontFamily: 'BearSansUIHeadline',
		color: color.headingGray,
		fontSize: '26px',
		fontWeight: 'normal'
	},
	{
		node: 'ATXHeading3',
		fontFamily: 'BearSansUIHeadline',
		color: color.headingGray,
		fontSize: '20px',
		fontWeight: 'normal'
	},
	{
		node: 'ATXHeading4',
		fontFamily: 'BearSansUIHeadline',
		color: color.headingGray,
		fontSize: '18px',
		fontWeight: 'normal'
	},
	{
		node: 'ATXHeading5',
		fontFamily: 'BearSansUIHeadline',
		color: color.headingGray,
		fontSize: '18px',
		fontWeight: 'normal'
	},
	{
		node: 'ATXHeading6',
		fontFamily: 'BearSansUIHeadline',
		color: color.headingGray,
		fontSize: '18px',
		fontWeight: 'normal'
	},
	{
		node: 'InlineCode',
		fontFamily: 'Roboto Mono, monospace',
		backgroundColor: color.codeBlockGrayBackground,
		color: color.fontGray
	},
	{
		node: 'CodeInfo', // CodeInfo
		fontFamily: 'Roboto Mono, monospace',
		color: color.strikethroughGray
	},
	{
		node: 'Emphasis',
		fontStyle: 'italic'
	},
	{
		node: 'StrongEmphasis',
		fontWeight: 'bold'
	},
	{
		node: 'Strikethrough',
		textDecoration: 'line-through',
		color: color.strikethroughGray
	},
	{
		node: ['EmphasisMark', 'LinkMark', 'CodeMark'],
		color: color.linkBracketGray
	},
	{
		node: ['URL', 'ListMark', 'QuoteMark', 'HardBreak', 'TaskMarker'],
		color: color.orange
	},
	{
		node: 'CodeText',
		fontFamily: 'Roboto Mono, monospace',
		color: color.strikethroughGray
	}
];

export const tiger: ThemeOptions = {
	dark: false,
	settings,
	styles,
	codeStyles: espressoOrange
};
