import { basicSetup, EditorView } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { indentWithTab } from '@codemirror/commands';
import { type KeyBinding, keymap } from '@codemirror/view';
import { type MarkdownConfig, Strikethrough, TaskList } from '@lezer/markdown';
import { styleTags, tags as t } from '@lezer/highlight';

import { autocompletion, completionKeymap, startCompletion } from '@codemirror/autocomplete';
import { EditorSelection, Prec, SelectionRange } from '@codemirror/state';
import { MarkdownAutocomplete, type MarkdownCompletion } from './completions.js';
import { imageWidget, linkWidget } from './widgets.js';
import { extractLink, nodeAtPosition } from './util.js';
import type { ThemeOptions } from './theme/theme.js';
import createTheme from './theme/theme.js';
import { bold, emphasize, strikethrough } from './commands.js';

interface SelectionSerialized {
	ranges: any[];
	mainIndex: number;
}

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
	e?: HTMLElement;
	content?: string;
	completions?: MarkdownCompletion[];
	theme: ThemeOptions;
}

function isFontAvailable(fontName: string) {
	// todo: window could be undefined if this function is called before Svelte's onMount
	const fonts = [...window.document.fonts.keys()];
	for (const { family } of fonts) {
		if (fontName === family) return true;
	}

	return false;
}

type Callback = (...args: unknown[]) => void;

type EditorEvent = 'change' | 'selection-change' | 'scroll' | 'link-click';

interface Listener {
	callback: Callback;
}

const formattingShortcuts: KeyBinding[] = [
	{
		key: 'Mod-b', // CMD + b
		preventDefault: true,
		run: bold
	},
	{
		key: 'Mod-i', // CMD + i
		preventDefault: true,
		run: emphasize
	},
	{
		key: 'Mod-shift-s', //
		preventDefault: true,
		run: strikethrough
	}
];

export class UnifiedText {
	private view: EditorView | null = null;
	private edit: boolean = true;
	private theme: ThemeOptions;
	private e: HTMLElement | null;
	private mdAutocomplete: MarkdownAutocomplete;

	private prevContent: string | null = null;
	private prevSelection: EditorSelection | null = null;
	private prevScrollTop: number | null = null;
	private listeners: EventListener[] = []

	private readonly eventListeners: { [event: string]: Listener[] } = {};

	constructor(options: EditorOptions) {
		this.mdAutocomplete = new MarkdownAutocomplete(options.completions || []);

		this.theme = options.theme;
		this.e = options.e || null;

		options.theme.settings.requiredFonts?.forEach((font) => {
			if (!isFontAvailable(font)) {
				throw new Error(`${font} not available`);
			}
		});

		// If element was passed
		this.e && this.init(options.content || '');
	}

	// Emit an event, triggering all listeners registered for this event
	private emit(event: EditorEvent, ...args: unknown[]) {
		const listeners = this.eventListeners[event];
		if (listeners) {
			listeners.forEach((eventListener) => eventListener.callback(...args));
		}
	}

	private init(doc = '') {
		if (!this.e) {
			throw new Error('HTML Element is missing.');
		}

		if (this.view) {
			this.view.destroy();
		}

		const extensions = [
			basicSetup,
			EditorView.editable.of(this.edit),
			createTheme(this.theme),
			keymap.of([indentWithTab, ...completionKeymap, ...startAutocompleteKeymap]),
			Prec.highest(keymap.of(formattingShortcuts)), // Use highest precedence to override default keymap
			markdown({ codeLanguages: languages, extensions: [Strikethrough, TaskList, ExtendedStyles] }),
			autocompletion({
				closeOnBlur: false,
				activateOnTyping: true,
				override: [(context) => this.mdAutocomplete.autocomplete(context)]
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
							this.emit('link-click', url);
							return true;
						}
					}

					return false; // Since we didn't click on a link, allow other handlers to handle this event
				}
			})
		];

		this.view = new EditorView({
			doc: doc,
			extensions,
			parent: this.e
		});

		const self = this;

		// Reset variables
		this.prevContent = null;
		this.prevSelection = null;
		this.prevScrollTop = null;

		// Mount listeners to emit editor events
		for (const ev of ['keyup', 'click']) {
			// First remove any listeners from previous init
			for (const listener of this.listeners) {
				this.e.removeEventListener(ev, listener);
			}
			this.listeners = [this.checkContentChange.bind(this), this.checkSelectionChange.bind(this)];
			for (const listener of this.listeners) {
				this.e.addEventListener(ev, listener);
			}
		}

		// Mount a scroll listener onto editor's cm-scroller selector
		const scrollEl = this.e.querySelector('.cm-scroller') as HTMLElement;

		scrollEl.addEventListener('scroll', function () {
			if (this.scrollTop != self.prevScrollTop) {
				self.prevScrollTop = this.scrollTop;
				self.emit('scroll', this.scrollTop);
			}
		});
	}

	getContent(): string {
		return this.view?.state.toJSON().doc || '';
	}

	setContent(text: string): void {
		this.init(text);
	}

	getScroll(): number {
		const eScroller = this.e.querySelector('.cm-scroller');
		if (!eScroller) {
			throw new Error('cm-scroller element not found — is editor mounted?');
		}
		return eScroller.scrollTop;
	}

	setScroll(scrollTop: number): void {
		const eScroller = this.e.querySelector('.cm-scroller');
		if (!eScroller) {
			throw new Error('cm-scroller element not found — is the editor mounted?');
		}

		// The following code attempts to set scroll positions until it stabilizes to the given value.
		// Setting it only once doesn't appear to work for some scrollTop values.
	    //  todo: check if we can use simpler and idiomatic expression like EditorView.scrollIntoView instead

		const maxAttempts = 10; // Limit the number of attempts to avoid potential infinite loops
		let attempts = 0;

		const setScrollPosition = () => {
			if (eScroller.scrollTop !== scrollTop && attempts < maxAttempts) {
				eScroller.scrollTop = scrollTop;
				attempts++;
				requestAnimationFrame(setScrollPosition);
			} else if (eScroller.scrollTop !== scrollTop){
				console.warn('Scroll position failed to restore: max attempts reached');
			}
		};

		setScrollPosition();
	}

	getSelection(): EditorSelection {
		return this.view.state.selection;
	}

	setSelection(selection: EditorSelection) {
		const transaction = this.view.state.update({ selection: selection });
		this.view.dispatch(transaction);
	}

	serializeSelection(selection: EditorSelection): SelectionSerialized {
		return {
			ranges: selection.ranges.map((range) => range.toJSON()),
			mainIndex: selection.mainIndex
		};
	}

	deserializeSelection(json: SelectionSerialized): EditorSelection {
		return EditorSelection.create(json.ranges.map(SelectionRange.fromJSON), json.mainIndex);
	}

	setCompletions(completions: MarkdownCompletion[]): void {
		this.mdAutocomplete.setCompletions(completions);
		if (document.querySelector('.cm-tooltip-autocomplete')) {
			startCompletion(this.view);
		}
	}

	setTheme(newTheme: ThemeOptions): void {
		this.theme = newTheme;
		this.init(this.getContent());
	}

	focus(): void {
		this.view.focus();
	}

	setElement(element: HTMLElement): void {
		this.e = element;
		this.init();
	}

	setEditable(isEdit: boolean): void {
		this.edit = isEdit;
		this.init(this.getContent());
	}

	on(event: EditorEvent, callback: Callback): void {
		if (!this.eventListeners[event]) {
			this.eventListeners[event] = [];
		}
		this.eventListeners[event].push({ callback });
	}

	off(event: EditorEvent, listener: Callback): void {
		if (this.eventListeners[event]) {
			this.eventListeners[event] = this.eventListeners[event].filter(
				(eventListener) => eventListener.callback !== listener
			);
		}
	}

	private checkContentChange() {
		const content = this.getContent();
		if (content != this.prevContent) {
			this.prevContent = content;
			this.emit('change', content);
		}
	}

	private checkSelectionChange() {
		const selection = this.getSelection();
		if (!this.prevSelection || !selection.eq(this.prevSelection)) {
			this.prevSelection = selection;
			this.emit('selection-change', selection);
		}
	}
}
