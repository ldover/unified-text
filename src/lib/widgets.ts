import {
	Decoration,
	ViewPlugin,
	WidgetType,
	type DecorationSet,
	EditorView,
	ViewUpdate
} from '@codemirror/view';
import type { Range } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

/**
 * Returns an image plugin that renders images below the Markdown Image elements
 */
export function imageWidget() {
	class ImageWidget extends WidgetType {
		url: string;

		constructor(url: string) {
			super();
			this.url = url;
		}

		eq(other: ImageWidget) {
			return other.url == this.url;
		}

		toDOM() {
			const img = document.createElement('img');
			img.className = 'cm-img';
			if (this.url) {
				img.src = this.url;
			}
			return img;
		}

		ignoreEvent() {
			return true; // no interactivity
		}
	}

	function getImages(view: EditorView) {
		const widgets: Range<Decoration>[] = [];
		for (const { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter: (node) => {
					if (node.name == 'Image') {
						const imageText = view.state.doc.sliceString(node.from, node.to);
						// todo: it will be better to parse image node with markdown parser
						const regexPattern = /!\[.*?\]\(([^)]+)\)/;
						const match = imageText.match(regexPattern);

						if (match && match[1]) {
							const url = match[1];
							const deco = Decoration.widget({
								widget: new ImageWidget(url),
								side: 1
							});
							widgets.push(deco.range(node.to));
						}
					}
				}
			});
		}
		return Decoration.set(widgets);
	}

	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = getImages(view);
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged) this.decorations = getImages(update.view);
			}
		},
		{
			decorations: (v) => v.decorations
		}
	);
}

/**
 * Hides the Markdown URL part of the link with a custom widget
 */
export function linkWidget() {
	class SymbolWidget extends WidgetType {
		url: string;

		constructor(url: string) {
			super();
			this.url = url;
		}

		eq(other: SymbolWidget) {
			return other.url == this.url;
		}

		toDOM() {
			const span = document.createElement('span');
			span.classList.add('cm-hidden-url');
			span.textContent = '...'; // to hide the link
			return span;
		}

		ignoreEvent() {
			return false; // will be needing interactions
		}
	}

	/**
	 * Return widget decorations for Markdown links to hide the URL.
	 *
	 * If cursor is inside the URL, it won't return decoration for that link.
	 * @param view
	 */
	function links(view: EditorView) {
		const widgets: Range<Decoration>[] = [];
		for (const { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter: (node) => {
					const linkText = view.state.doc.sliceString(node.from, node.to);
					if (node.name == 'URL') {
						// check that our cursor is not within the URL.
						const cursorPos = view.state.selection.main.head;
						if (cursorPos >= node.from && cursorPos <= node.to) {
							// If cursor within the URL node
							return; // Don't create decoration
						}

						const deco = Decoration.replace({
							widget: new SymbolWidget(linkText)
						});
						widgets.push(deco.range(node.from, node.to));
					}
				}
			});
		}
		return Decoration.set(widgets);
	}

	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = links(view);
			}

			update(update: ViewUpdate) {
				// todo: this will update now after every change, even cursor change
				//  Should do something like this: if (update.docChanged || update.viewportChanged)
				this.decorations = links(update.view);
			}
		},
		{
			decorations: (v) => v.decorations
		}
	);
}
