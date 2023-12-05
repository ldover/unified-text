import type { MarkdownNodeStyle, MarkdownSettings, ThemeOptions } from './theme.js';
import { espresso } from './code-style.js';

const headingGray = '#5167AA',
	fontGray = '#A8AFBE',
	linkBracketGray = '#297BDE',
	// Note: background should be transparent so other styles like selection remain visible
	codeBlockGrayBackground = 'rgba(240, 240, 240, 0.5)',
	code = '#74AA5F',
	orange = '#CC844F',
	selectionBackground = '#28509E',
	tooltipSelectionBackground = '#ECECED',
	tooltipBorder = '#BEBEBE',
	background = '#161C2D',
	strikethroughGray = '#878888';

/// The colors used in the theme, as CSS color strings.
export const color = {
	headingGray,
	fontGray,
	orange,
	code,
	linkBracketGray,
	codeBlockGrayBackground,
	selectionBackground,
	background,
	tooltipSelectionBackground,
	strikethroughGray
};

const settings: MarkdownSettings = {
	background: color.background,
	foreground: color.fontGray,
	selection: color.selectionBackground,
	caret: color.red,

	requiredFonts: ['BearSansUI', 'BearSansUIHeadline', 'Roboto Mono'],
	defaultFont: 'BearSansUI',
	defaultFontSize: '18px',
	tooltipBorder: tooltipBorder,
	tooltipSelectionBackground: tooltipSelectionBackground
};

const styles: MarkdownNodeStyle[] = [
	//
	// Markdown style tags
	//
	{
		node: 'Link',
		textDecoration: 'none',
		color: color.red
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
		color: color.code
	},
	{
		node: ['CodeInfo', 'CodeText'],
		fontFamily: 'Roboto Mono, monospace',
		color: color.orange
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
	}
];

export const oceanBlue: ThemeOptions = {
	dark: true,
	settings,
	styles,
	codeStyles: espresso // This theme matches Bear UI well enough
};
