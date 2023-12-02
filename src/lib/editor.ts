import { basicSetup, EditorView } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { indentWithTab } from '@codemirror/commands';
import { type KeyBinding, keymap } from '@codemirror/view';
import {type MarkdownConfig, Strikethrough} from '@lezer/markdown';
import {styleTags, tags} from '@lezer/highlight';

import { autocompletion, completionKeymap, startCompletion } from '@codemirror/autocomplete';
import { EditorSelection } from '@codemirror/state';
import { getMarkdownAutocomplete, type MarkdownCompletion } from './completions.js';
import { bear } from './bear-theme.js';
import { imageWidget, linkWidget } from './widgets.js';
import { extractLink, nodeAtPosition } from './util.js';


export const ExtendedStyles: MarkdownConfig = {
	props: [
		styleTags({
			"HeaderMark": tags.heading,
			"ListMark": tags.special(tags.processingInstruction),
		})
	]
}

const startAutocompleteKeymap: KeyBinding[] = [
	{ key: 'Ctrl-Space', run: startCompletion, shift: () => false }
];

interface EditorStyle {
	fontSize: number;
	fontFamily: string;
}

interface EditorOptions {
	content?: string;
	completions?: MarkdownCompletion[];
	style?: EditorStyle;
	callbacks?: {
		onChange?: (doc: string) => void;
		onLinkClick?: (url: string) => void;
	};
}

export function UnifiedText(e: HTMLElement, options: EditorOptions) {
	const mdAutocomplete = getMarkdownAutocomplete(options.completions || []);

	let view: EditorView;

	let fontSize = 19;

	function init() {
		if (view) {
			view.destroy();
		}

		e.addEventListener('keyup', () => {
			options.callbacks?.onChange && options.callbacks.onChange(view.state.toJSON().doc);
		});

		const extensions = [
			basicSetup,
			bear,
			keymap.of([indentWithTab, ...completionKeymap, ...startAutocompleteKeymap]),
			markdown({ codeLanguages: languages, extensions: [Strikethrough, ExtendedStyles] }),
			autocompletion({
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

	init();

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
		},
		setTheme: function () {
			throw new Error('not implemented');
		},
		getTheme: function () {
			throw new Error('not implemented');
		},
		increaseFontSize: function (): boolean {
			if (fontSize >= 64) {
				return false;
			}

			fontSize += 1;

			init();
			return true;
		},
		decreaseFontSize: function (): boolean {
			if (fontSize <= 4) {
				return false;
			}

			fontSize -= 1;

			init();
			return true;
		}
	};
}
