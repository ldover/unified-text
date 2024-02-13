import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import type { StyleSpec } from 'style-mod';
import { HighlightStyle, type TagStyle, syntaxHighlighting } from '@codemirror/language';
import {Tag, tags, tags as t} from "@lezer/highlight";


export type MarkdownType = 'Document' |
	'CodeBlock' |
	'FencedCode' |
	'Blockquote' |
	'HorizontalRule' |
	'BulletList' |
	'OrderedList' |
	'ListItem' |
	'ATXHeading1' |
	'ATXHeading2' |
	'ATXHeading3' |
	'ATXHeading4' |
	'ATXHeading5' |
	'ATXHeading6' |
	'SetextHeading1' |
	'SetextHeading2' |
	'HTMLBlock' |
	'LinkReference' |
	'Paragraph' |
	'CommentBlock' |
	'ProcessingInstructionBlock' |
	'Escape' |
	'Entity' |
	'HardBreak' |
	'Emphasis' |
	'StrongEmphasis' |
	'Link' |
	'Image' |
	'InlineCode' |
	'HTMLTag' |
	'Comment' |
	'ProcessingInstruction' |
	'URL' |
	'HeaderMark' |
	'QuoteMark' |
	'ListMark' |
	'LinkMark' |
	'EmphasisMark' |
	'CodeMark' |
	'CodeText' |
	'CodeInfo' |
	'LinkTitle' |
	'LinkLabel' |
	'Strikethrough' |      // extension
	'StrikethroughMark' |  // extension
	'TaskList' |           // extension
	'TaskMarker';          // extension


const toTag = (node: MarkdownType) : Tag => {
	const map = {
		Blockquote: t.quote,
		BlockQuote: t.quote, // there appear to be 2 blockquote tags in lezer/markdown's (markdown.ts)
		HorizontalRule: t.contentSeparator,
		ATXHeading1: t.heading1,
		ATXHeading2: t.heading2,
		ATXHeading3: t.heading3,
		ATXHeading4: t.heading4,
		ATXHeading5: t.heading5,
		ATXHeading6: t.heading6,
		Comment: t.comment,
		CommentBlock: t.comment,
		Escape: t.escape,
		Entity: t.character,
		Emphasis: t.emphasis,
		StrongEmphasis: t.strong,
		Link: t.link,
		Image: t.link,
		OrderedList: t.list,
		URL: t.url,
		InlineCode: t.monospace,
		EmphasisMark: t.processingInstruction,
		CodeMark: t.special(t.atom),
		LinkMark: t.special(t.link),
		LinkLabel: t.labelName,
		LinkTitle: t.string,
		Paragraph: t.content,
		Strikethrough: tags.strikethrough, // extension
		StrikethroughMark: tags.processingInstruction,  // extension
		TaskList: tags.list,  // extension
		TaskMarker: tags.atom,  // extension
		BulletList: t.special(t.list), // custom
		HeaderMark: tags.heading,  // custom
		QuoteMark: tags.special(tags.processingInstruction),  // custom
		ListMark: tags.special(tags.processingInstruction),  // custom
		HardBreak: tags.special(tags.processingInstruction),  // custom
		CodeText: tags.special(tags.monospace), // custom
		CodeInfo: tags.special(tags.labelName), // custom
	}

	const tag = map[node]
	if (tag) {
		return tag
	} else {
		throw new Error(`Unsupported MarkdownNode: ${node}`)
	}
}

export interface ThemeOptions {
	/**
	 * Theme variant. Determines which styles CodeMirror will apply by default.
	 */
	dark: boolean;

	/**
	 * Settings to customize the look of the editor, like background, selection and others.
	 */
	settings: MarkdownSettings;

	/**
	 * Syntax highlighting styles for Markdown nodes.
	 */
	styles: MarkdownNodeStyle[];

	/**
	 * Syntax highlighting styles for code.
	 */
	codeStyles: TagStyle[];
}

export interface MarkdownNodeStyle {
	node: MarkdownType | readonly MarkdownType[];
	[styleProperty: string]: any;
}

export interface MarkdownSettings {
	/**
	 * Editor background color
	 */
	background: string;

	/**
	 * Default font color
	 */
	foreground: string;

	/**
	 * Selection color
	 */
	selection: string;

	/**
	 * Caret color
	 */
	caret: string;

	//
	// Tooltip props

	/**
	 * Tooltip border color
	 */
	tooltipBorder: string

	/**
	 * Background color of selected item
	 */
	tooltipSelectionBackground: string

	//
	// Optional style props

	/**
	 * Line height
	 */
	lineHeight?: string;

	/**
	 * Fonts required by this theme — used to check whether fonts are loaded
	 */
	requiredFonts?: string[];

	/**
	 * Font used to style content
	 */
	defaultFont?: string;

	/**
	 * Default content
	 */
	defaultFontSize?: string;

	/**
	 * Editor content width
	 */
	width?: string;

	/**
	 * Image style (`.cm-img` selector)
	 */
	imgWidget?: StyleSpec;

	/**
	 * Hidden URL style (`cm-hidden-url`)
	 */
	urlWidget?: StyleSpec;
}


const createTheme = ({ dark, settings, styles, codeStyles }: ThemeOptions): Extension => {
	const defaults = {
		defaultFont: 'Roboto',
		defaultFontSize: '18px',
		lineHeight: '170%',
		width: '900px',
		imgWidget: {
			maxHeight: '300px'
		},
		urlWidget: {
			color: '#D9D9D9'
		}
	};


	const opts = Object.assign({}, defaults, settings || {});

	const theme = EditorView.theme(
		{
			'&': {
				width: '100%',
				height: '100%',
				color: '#1f1f1f',
				backgroundColor: opts.background
			},
			'&.cm-focused': {
				outline: 'none' // Hide the outline of the focused editor
			},
			'.cm-img': opts.imgWidget,
			'.cm-hidden-url': opts.urlWidget, // Style for hidden url widget "..." in: "[title](...)"
			'.cm-scroller': {
				paddingTop: '40px',
				paddingBottom: '50%', // Add bottom padding so user can scroll past the editor content
				width: '100%',
				justifyContent: 'center'
			},
			'.cm-content': {
				caretColor: opts.caret,
				fontSize: opts.defaultFontSize,
				fontFamily: opts.defaultFont,
				maxWidth: opts.width,
				width: opts.width,
				color: opts.foreground
			},
			'.cm-activeLine': {
				backgroundColor: 'transparent' // Don't show active line
			},
			'.cm-line': {
				lineHeight: opts.lineHeight,
				padding: '0 54px' // todo: why this padding this necessary
			},
			'&.cm-focused .cm-cursor': {
				borderLeftColor: opts.caret, // Caret
				borderLeftWidth: '2px'
			},
			'.cm-gutters': {
				display: 'none' // Hide gutters
			},
			'&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
				backgroundColor: 'transparent' // Override highlighting for matching bracket
			},
			'.cm-selectionMatch': {
				backgroundColor: 'transparent' // Override highlighting text that matches selection
			},
			'&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
				{ backgroundColor: opts.selection },
			'.cm-tooltip': {
				// todo: border doesn't show in dark mode
				//   - box shadow might need customization for dark mode
				borderColor: opts.tooltipBorder,
				boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.1)',
				borderRadius: '10px',
				padding: '8px',
				backgroundColor: opts.background
			},
			".cm-completionIcon": {
				fontSize: "90%",
				width: "1em",
				display: "inline-block",
				textAlign: "center",
				paddingRight: ".6em",
				opacity: "1.0",
				boxSizing: "content-box",
				transform: "scale(0.8)"
			},
			".cm-completionIcon-note": {
				"&:after": {
					content: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIg" +
						"ZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4K" +
						"PHBhdGggZD0iTTExIDE2SDQuNUM0LjIyMzg2IDE2IDQgMTUuNzc2MSA0IDE1LjVW" +
						"MS41QzQgMS4yMjM4NiA0LjIyMzg2IDEgNC41IDFIMTQuNUMxNC43NzYxIDEgMTUg" +
						"MS4yMjM4NiAxNSAxLjVWMTJNMTEgMTZWMTIuNUMxMSAxMi4yMjM5IDExLjIyMzkg" +
						"MTIgMTEuNSAxMkgxNU0xMSAxNkwxNSAxMiIgc3Ryb2tlPSIjQTFBMUFBIi8+Cjxw" +
						"YXRoIGQ9Ik02LjUgNEgxMi41TTYuNSA3SDEyLjUiIHN0cm9rZT0iI0ExQTFBQSIv" +
						"Pgo8L3N2Zz4K')",
					verticalAlign: "middle"
				}
			},
			".cm-completionIcon-image": {
				"&:after": {
					content: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIg" +
						"ZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4K" +
						"PHBhdGggZD0iTTE2IDUuNVYxNEg1LjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1v" +
						"cGFjaXR5PSIwLjUiLz4KPHBhdGggZD0iTTIgMTJWMkgxNFYxMkgyWiIgc3Ryb2tl" +
						"PSIjQTFBMUFBIi8+CjxwYXRoIGQ9Ik0xNS41IDVIMTdWMTVINVYxMy41IiBzdHJv" +
						"a2U9IiNBMUExQUEiLz4KPHBhdGggZD0iTTcuODIzNTUgNi43MjAzMkw0IDExLjVI" +
						"MTMuNVYxMC41TDExLjUgOC41SDEwLjVWOS4yNUwxMSAxMFYxMC41SDEwLjQ5OThM" +
						"OC4xNDkzMyA2LjczOTI1QzguMDc2MjcgNi42MjIzNyA3LjkwOTY2IDYuNjEyNjgg" +
						"Ny44MjM1NSA2LjcyMDMyWiIgZmlsbD0iI0ExQTFBQSIvPgo8cGF0aCBkPSJNMTEu" +
						"NSA0LjVDMTIuMDUyMyA0LjUgMTIuNSA0Ljk0NzcyIDEyLjUgNS41QzEyLjUgNi4w" +
						"NTIyOCAxMi4wNTIzIDYuNSAxMS41IDYuNUMxMC45NDc3IDYuNSAxMC41IDYuMDUy" +
						"MjggMTAuNSA1LjVDMTAuNSA0Ljk0NzcyIDEwLjk0NzcgNC41IDExLjUgNC41WiIg" +
						"ZmlsbD0iI0ExQTFBQSIvPgo8L3N2Zz4K')",
					verticalAlign: "middle"
				}
			},
			".cm-completionIcon-log": {
				"&:after": {
					content: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIg" +
						"ZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4K" +
						"PHBhdGggZD0iTTMgNVYzQzMgMi40NDc3MiAzLjQ0NzcyIDIgNCAySDEyQzEyLjU1" +
						"MjMgMiAxMyAyLjQ0NzcyIDEzIDNWNUgzWiIgZmlsbD0iI0ExQTFBQSIvPgo8cGF0" +
						"aCBkPSJNMyAxMy41VjVINVY2SDExVjVIMTNWMTNDMTMgMTMuNTUyMyAxMi41NTIz" +
						"IDE0IDEyIDE0SDMuNUMzLjIyMzg2IDE0IDMgMTMuNzc2MSAzIDEzLjVaIiBmaWxs" +
						"PSIjQTFBMUFBIi8+CjxwYXRoIGQ9Ik0zLjkgMTMuMkMzLjczNDMxIDEyLjk3OTEg" +
						"My40MjA5MSAxMi45MzQzIDMuMiAxMy4xQzIuOTc5MDkgMTMuMjY1NyAyLjkzNDMx" +
						"IDEzLjU3OTEgMy4xIDEzLjhMMy45IDEzLjJaTTQuODUgMTUuM0w0LjQ1IDE1LjZM" +
						"NC44NSAxNS4zWk0xNCA0VjE1SDE1VjRIMTRaTTE0IDE1SDUuMjVWMTZIMTRWMTVa" +
						"TTUuMjUgMTVMMy45IDEzLjJMMy4xIDEzLjhMNC40NSAxNS42TDUuMjUgMTVaTTUu" +
						"MjUgMTVMNS4yNSAxNUw0LjQ1IDE1LjZDNC42Mzg4NSAxNS44NTE4IDQuOTM1MjQg" +
						"MTYgNS4yNSAxNlYxNVpNMTQgMTVMMTQgMTVWMTZDMTQuNTUyMyAxNiAxNSAxNS41" +
						"NTIzIDE1IDE1SDE0WiIgZmlsbD0iI0ExQTFBQSIvPgo8L3N2Zz4K')",
					verticalAlign: "middle"
				}
			},
			'.cm-tooltip-autocomplete': {
				'& > ul > li > .cm-completionLabel': {
					fontFamily: opts.defaultFont,
					color: opts.foreground,
					fontSize: '14px'
				},
				'& > ul > li > .cm-completionDetail': {
					fontStyle: 'normal',
					fontFamily: opts.defaultFont,
					color: opts.foreground,
					opacity: 0.5,
					fontSize: '12px',
					fontWeight: 'light'
				},
				'& > ul > li > .cm-completionLabel > .cm-completionMatchedText': {
					fontWeight: 'bold',
					textDecoration: 'none'
				},
				'& > ul > li[aria-selected]': {
					backgroundColor: opts.tooltipSelectionBackground,
					color: opts.foreground,
					borderRadius: '4px'
				}
			}
		},
		{
			dark: dark
		}
	);

	function toTagStyles (styles: MarkdownNodeStyle[]): TagStyle[] {
		return styles.map(row => {
			let tag: Tag | Tag[];
			if (Array.isArray(row.node)) {
				tag = row.node.map(node => toTag(node))
			} else {
				tag = toTag(row.node)
			}

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const {node, ...styles} = row
			return {
				tag,
				...styles
			}
		})
	}

	const markdownStyles = toTagStyles(styles);
	const highlightStyle = HighlightStyle.define([...markdownStyles, ...codeStyles]);
	const extension = [theme, syntaxHighlighting(highlightStyle)];

	return extension;
};

export default createTheme;
