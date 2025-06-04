import {
	Decoration,
	ViewPlugin,
	WidgetType,
	type DecorationSet,
	EditorView,
	ViewUpdate
} from '@codemirror/view';
import { RangeSetBuilder, type Range, EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';

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
	 * Walks up the syntax-tree ancestors of `nodeRef` and returns `true` if
	 * it finds any ancestor whose type name is exactly `"Link"`. Otherwise `false`.
	 */
	function isInsideLinkNode(nodeRef: any): boolean {
		let cursor = nodeRef.node; // TreeCursor passed into `enter`
		while (cursor) {
			if (cursor.name === "Link" || cursor.name == 'Image') return true;
			cursor = cursor.parent;
		}
		return false;
	}

	/**
	 * Iterate visible ranges, look for nodes named "URL" that are inside
	 * a parent "Link", and replace them with a SymbolWidget. If the cursor
	 * is inside that URL, skip decoration so the user can still edit it.
	 */
	function links(view: EditorView): DecorationSet {
		const widgets: Range<Decoration>[] = [];
		const { state, visibleRanges } = view;
		const selection = view.state.selection

		for (const { from, to } of visibleRanges) {
			syntaxTree(state).iterate({
				from,
				to,
				enter: (node) => {
					// Only interested in leaf nodes whose name is "URL"
					if (node.name !== "URL") return;

					// If this "URL" node is not part of a Link, skip it
					if (!isInsideLinkNode(node)) return;

					// If cursor (or selection anchor) is within this URL, do not hide it
					const sel = selection.main;
					const insideCursor =
						sel.empty
							? sel.head >= node.from && sel.head <= node.to
							: sel.anchor >= node.from && sel.anchor <= node.to;
					if (insideCursor) return;

					// Finally, decorate: replace the entire URL span with the widget
					const linkText = state.doc.sliceString(node.from, node.to);
					const deco = Decoration.replace({
						widget: new SymbolWidget(linkText),
					});
					widgets.push(deco.range(node.from, node.to));
				},
			});
		}
		return Decoration.set(widgets);
	}

	function urlRangeAt(state: EditorState, pos: number): {from: number; to: number} | null {
		// Walk the concrete syntax tree at `pos`
		let cur: SyntaxNode | null = syntaxTree(state).resolve(pos, 1);   // 1 = prefer leaves
		while (cur) {
		  if (cur.name === "URL") {
			// Must also be inside a Link parent; bail otherwise
			let p = cur.parent;
			while (p && p.name !== "Link") p = p.parent;
			if (p) return { from: cur.from, to: cur.to };
			break;
		  }
		  cur = cur.parent;
		}
		return null;
	  }

	return ViewPlugin.fromClass(
		class {
		  decorations: DecorationSet;
		  private activeUrl: { from: number; to: number } | null;
	
		  constructor(view: EditorView) {
			this.decorations = links(view);                         // initial build
			this.activeUrl = urlRangeAt(view.state, view.state.selection.main.head);
		  }
	
		  update(update: ViewUpdate) {
			// 1️⃣ Structural changes → always rebuild
			if (update.docChanged || update.viewportChanged) {
			  this.decorations = links(update.view);
			  this.activeUrl = urlRangeAt(update.state, update.state.selection.main.head);
			  return;
			}
	
			// 2️⃣ Pure cursor/selection moves
			if (update.selectionSet) {
			  const next = urlRangeAt(update.state, update.state.selection.main.head);
	
			  // If we’re still inside the same URL (or still outside any URL) do nothing
			  const same =
			  (this.activeUrl && next &&
				this.activeUrl.from === next.from &&
				this.activeUrl.to === next.to) ||
				(!this.activeUrl && !next);
				
			  if (same) return;                     // skip expensive work
	
			  // Cursor entered or left a URL → rebuild decorations
			  this.decorations = links(update.view);
			  this.activeUrl = next;
			}
		  }
		},
		{ decorations: v => v.decorations }
	  );
}



export const blockquoteStyling = ViewPlugin.fromClass(class {
	decorations: DecorationSet

	constructor(view: EditorView) {
		this.decorations = this.build(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged)
			this.decorations = this.build(update.view);
	}

	/** Scan visible ranges, add a line decoration to every block-quote line */
	build(view: EditorView) {
		const builder = new RangeSetBuilder<Decoration>();
		const tree = syntaxTree(view.state);

		tree.iterate({
			enter(node) {
				if (node.name === "Blockquote") {
					let lnFrom = view.state.doc.lineAt(node.from).number;
					let lnTo = view.state.doc.lineAt(node.to).number;
					for (let l = lnFrom; l <= lnTo; l++) {
						let pos = view.state.doc.line(l).from;
						builder.add(pos, pos, Decoration.line({ class: "cm-blockquote" }));
					}
				}
			},
			// only look at what’s on screen for speed
			from: view.viewport.from, to: view.viewport.to
		});
		return builder.finish();
	}
}, {
	decorations: v => v.decorations
});

