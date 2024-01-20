import { basicSetup, EditorView } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { indentWithTab } from '@codemirror/commands';
import { type KeyBinding, keymap } from '@codemirror/view';
import { type MarkdownConfig, Strikethrough, TaskList } from '@lezer/markdown';
import { styleTags, tags as t } from '@lezer/highlight';

import { autocompletion, completionKeymap, startCompletion } from '@codemirror/autocomplete';
import {EditorSelection} from '@codemirror/state';
import { getMarkdownAutocomplete, type MarkdownCompletion } from './completions.js';
import { imageWidget, linkWidget } from './widgets.js';
import { extractLink, nodeAtPosition } from './util.js';
import type { ThemeOptions } from './theme/theme.js';
import createTheme from './theme/theme.js';

export const ExtendedStyles: MarkdownConfig = {
	props: [
		styleTags({
			HeaderMark: t.heading,
			'ListMark QuoteMark HardBreak': t.special(t.processingInstruction),
			CodeText: t.special(t.monospace),
			CodeInfo: t.special(t.labelName),
			CodeMark: t.special(t.atom),
			LinkMark: t.special(t.link)
		})
	]
};

const startAutocompleteKeymap: KeyBinding[] = [
	{ key: 'Ctrl-Space', run: startCompletion, shift: () => false }
];

interface EditorOptions {
	e?: HTMLElement,
	content?: string;
	completions?: MarkdownCompletion[];
	theme: ThemeOptions;
	callbacks?: {
		onChange?: (doc: string) => void;
		onLinkClick?: (url: string) => void;
	};
}

function isFontAvailable(fontName: string) {
	// todo: window could be undefined if this function is called before Svelte's onMount
	const fonts = [...window.document.fonts.keys()];
	for (const { family } of fonts) {
		if (fontName === family) return true;
	}

	return false;
}

export function UnifiedText(options: EditorOptions) {
	const mdAutocomplete = getMarkdownAutocomplete(options.completions || []);

	let view: EditorView;
	let edit = true;

	let theme = options.theme;
	let e = options.e || null;

	options.theme.settings.requiredFonts?.forEach((font) => {
		if (!isFontAvailable(font)) {
			throw new Error(`${font} not available`);
		}
	});

	function init() {
		if (!e) {
			throw new Error('HTML Element is missing.')
		}

		if (view) {
			view.destroy();
		}

		e.addEventListener('keyup', () => {
			options.callbacks?.onChange && options.callbacks.onChange(view.state.toJSON().doc);
		});

		const extensions = [
			basicSetup,
			EditorView.editable.of(edit),
			createTheme(theme),
			keymap.of([indentWithTab, ...completionKeymap, ...startAutocompleteKeymap]),
			markdown({ codeLanguages: languages, extensions: [Strikethrough, TaskList, ExtendedStyles] }),
			autocompletion({
				closeOnBlur: false,
				activateOnTyping: true,
				override: [(context) => mdAutocomplete.autocomplete(context)]
			}),
			linkWidget(),
			imageWidget(),
			EditorView.lineWrapping,
			EditorView.domEventHandlers({
				mousedown: (event, view) => {
					//
					// Handle link clicks
					//
					if (!event.metaKey) return false; // Only run when CMD key is pressed, normal click is to edit link

					const node = nodeAtPosition(event, view);
					if (node && ['Link', 'URL'].includes(node.type.name)) {
						const url = extractLink(node, view);
						if (url) {
							options.callbacks?.onLinkClick && options.callbacks.onLinkClick(url);
							return true;
						}
					}

					return false; // Since we didn't click on a link, allow other handlers to handle this event
				}
			})
		];

		view = new EditorView({
			doc: options.content || '',
			extensions,
			parent: e
		});
	}

	// If element was passed
	e && init();

	return {
		getContent: function (): string {
			return view.state.toJSON().doc;
		},
		setContent: function (text: string) {
			// Create a transaction that replaces the entire content
			const transaction = view.state.update({
				changes: { from: 0, to: view.state.doc.length, insert: text }
			});

			// Apply the transaction to the editor view
			view.update([transaction]);
		},
		getScroll: function (): number {
			const eScroller = e.querySelector('.cm-scroller');
			if (!eScroller) {
				throw new Error('cm-scroller element not found — is editor mounted?');
			}
			return eScroller.scrollTop;
		},
		setScroll: function (scrollTop: number) {
			const eScroller = e.querySelector('.cm-scroller');
			if (!eScroller) {
				throw new Error('cm-scroller element not found — is editor mounted?');
			}
			eScroller.scrollTop = scrollTop;
		},
		getCursor: function (): number {
			return view.state.selection.main.head;
		},
		setCursor: function (position: number) {
			const selection = EditorSelection.create([EditorSelection.cursor(position)]);

			const transaction = view.state.update({
				selection: selection
			});
			view.dispatch(transaction);
		},
		setCompletions: function (completions: MarkdownCompletion[]) {
			mdAutocomplete.setCompletions(completions);

			// If tooltip visible recompute the completions
			if (document.querySelector('.cm-tooltip-autocomplete')) {
				startCompletion(view)  // Refresh completions
			}
		},
		setTheme: function (newTheme: ThemeOptions) {
			theme = newTheme;
			init();
		},
		focus: function () {
			view.focus();
		},
		setElement: function (element: HTMLElement) {
			e = element;
			init();
		},
		setEditable: function (isEdit: boolean) {
			edit = isEdit
			init() // todo: use comportment to update extension: https://discuss.codemirror.net/t/switch-between-editor-being-editable-or-not/2745/5
		}
	};
}
