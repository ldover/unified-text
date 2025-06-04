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

	/**
	 * Icons in base64 encoding for autocomplete tooltip.
	 */
	icons?: Icons;
}

type Icons = {
	[key: string]: string;
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
	 * Line padding
	 */
	line?: StyleSpec

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
	 * Blockquote style (`.cm-blockquote` selector) 
	 */
	blockquote?: StyleSpec

	/**
	 * Image style (`.cm-img` selector)
	 */
	imgWidget?: StyleSpec;

	/**
	 * Hidden URL style (`cm-hidden-url`)
	 */
	urlWidget?: StyleSpec;

	/**
	 * Editor content style (`cm-content`)
	 */
	editorContent?: StyleSpec

	/**
	 * Higlight style
	 */
	higlight?: StyleSpec

	/**
	 * Higlight style for active highlight
	 */
	higlightActive?: StyleSpec
}


const createTheme = ({ dark, settings, styles, codeStyles, icons }: ThemeOptions): Extension => {
	const defaults = {
		defaultFont: 'Roboto',
		defaultFontSize: '18px',
		lineHeight: '170%',
		line: {},
		width: '900px',
		imgWidget: {
			maxHeight: '300px'
		},
		urlWidget: {
			color: '#D9D9D9',
			cursor: 'pointer'
		},
		highlight: {
			backgroundColor: 'yellow'
		},
		higlightActive: {
			backgroundColor: 'yellow',
			border: "1px solid black"
		},
		editorContent: {}
	};

	const opts = Object.assign({}, defaults, settings || {});

	// Create CSS selectors for icons
	const iconStyles = []
	if (icons) {
		for (const [iconType, base64String] of Object.entries(icons)) {
			iconStyles.push([
				`.cm-completionIcon-${iconType}`,
				{
					"&:after": {
						content: `url('data:image/svg+xml;base64,${base64String}')`,
						verticalAlign: "middle"
					}
				}
			])
		}
	}

	const addStyles = Object.fromEntries(iconStyles)

	const css = {
		'&': {
			width: '100%',
			height: '100%',
			color: '#1f1f1f',
			backgroundColor: opts.background
		},
		'&.cm-focused': {
			outline: 'none' // Hide the outline of the focused editor
		},
		".cm-blockquote": opts.blockquote,
		'.cm-img': opts.imgWidget,
		'.cm-hidden-url': opts.urlWidget, // Style for hidden url widget "..." in: "[title](...)"
		'.cm-scroller': {
			paddingTop: '40px',
			// paddingRight: '64px',
			// paddingLeft: '84px', // Adjust for  MacOS traffic lights: todo: abstraction leak from Tiger -> text editor

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
			color: opts.foreground,
			...opts.editorContent // Extra styles
		},
		".cm-custom-highlight": { 
			...opts.highlight

		},
		".cm-custom-highlight-emphasis": { 
			...opts.higlightActive
		},
		'.cm-activeLine': {
			backgroundColor: 'transparent' // Don't show active line
		},
		'.cm-line': {
			lineHeight: opts.lineHeight,
			...opts.line
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
		...addStyles,
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
		},
		'.cm-search.cm-panel': {
			textTransform: 'capitalize',
			backgroundColor: '#ffffff',
			padding: '46px 86px 4px 22px',
			fontFamily: opts.defaultFont,

			'& > .cm-textfield': {
				borderRadius: '5px',
				fontSize: '14px',
			},
			'& > label': {
				color: '#27272a',
			},
			'& input[type=checkbox]': {
				verticalAlign: 'text-bottom'
			},
			'& input[type=checkbox]:focus-visible': {
				outline: '2px solid #fdba74',
			},
			'& > .cm-textfield:focus': {
				outline: '2px solid #fdba74',
				border: '1px solid #fb923c',
			},
			'& > .cm-button': {
				textTransform: 'capitalize',
				border: 'none',
				padding: '2px 12px',
				borderRadius: '5px',
				fontSize: '14px',
				fontFamily: opts.defaultFont,
				color: '#27272a',
				backgroundColor: '#e4e4e7'
			},
			'& > .cm-button:focus-visible': {
				outline: '2px solid #fdba74',
			},
			'& button[name=close]': {
				top: '78px',
				right: '24px',
				color: '#a1a1aa',
				fontSize: '34px',
				background: 'none',
				cursor: 'pointer'
			}
		}
	};

	const theme = EditorView.theme(
		css,
		{ dark: dark }
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
