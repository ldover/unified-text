import type { MarkdownNodeStyle, MarkdownSettings, ThemeOptions } from './theme.js';
import { espresso } from './code-style.js';

const blue = '#5167AA',
	metallic = '#A8AFBE',
	gold = '#FFC66D',
	linkBracketGray = '#297BDE',
	green = '#74AA5F',
	orange = '#CC844F',
	sky = '#28509E',
	deepBlue = '#161C2D'

/// The colors used in the theme, as CSS color strings.
export const color = {
	blue,
	metallic,
	orange,
	gold,
	green,
	linkBracketGray,
	sky,
	deepBlue,
};

const settings: MarkdownSettings = {
	background: color.deepBlue,
	foreground: color.metallic,
	selection: color.sky,
	caret: color.orange,
	urlWidget: {
		color: color.metallic
	},
	requiredFonts: ['BearSansUI', 'BearSansUIHeadline', 'Roboto Mono'],
	defaultFont: 'BearSansUI',
	defaultFontSize: '18px',
	tooltipBorder: color.orange,
	tooltipSelectionBackground: color.sky
};

const styles: MarkdownNodeStyle[] = [
	//
	// Markdown style tags
	//
	{
		node: 'Link',
		textDecoration: 'none',
		color: color.gold
	},
	{
		node: ['LinkMark'],
		color: color.metallic,
	},
	{
		node: 'ATXHeading1',
		fontFamily: 'BearSansUIHeadline',
		color: color.blue,
		fontSize: '32px',
		fontWeight: 'normal'
	},
	{
		node: 'ATXHeading2',
		fontFamily: 'BearSansUIHeadline',
		color: color.blue,
		fontSize: '26px',
		fontWeight: 'normal'
	},
	{
		node: 'ATXHeading3',
		fontFamily: 'BearSansUIHeadline',
		color: color.blue,
		fontSize: '20px',
		fontWeight: 'normal'
	},
	{
		node: 'ATXHeading4',
		fontFamily: 'BearSansUIHeadline',
		color: color.blue,
		fontSize: '18px',
		fontWeight: 'normal'
	},
	{
		node: 'ATXHeading5',
		fontFamily: 'BearSansUIHeadline',
		color: color.blue,
		fontSize: '18px',
		fontWeight: 'normal'
	},
	{
		node: 'ATXHeading6',
		fontFamily: 'BearSansUIHeadline',
		color: color.blue,
		fontSize: '18px',
		fontWeight: 'normal'
	},
	{
		node: ['InlineCode', 'CodeText'],
		fontFamily: 'Roboto Mono, monospace',
		color: color.green
	},
	{
		node: ['CodeInfo'],
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
	},
	{
		node: ['URL'],
		color: color.gold
	},
	{
		node: ['ListMark', 'QuoteMark', 'HardBreak', 'TaskMarker', 'CodeMark', 'EmphasisMark'],
		color: color.orange
	}
];

export const oceanBlue: ThemeOptions = {
	dark: true,
	settings,
	styles,
	codeStyles: espresso // This theme matches Bear UI well enough
};
