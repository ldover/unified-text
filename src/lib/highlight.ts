import { Decoration, EditorView, ViewPlugin, ViewUpdate, type DecorationSet } from '@codemirror/view';

const highlightMark = Decoration.mark({ class: "cm-custom-highlight" });
const highlightMarkEmphasis = Decoration.mark({ class: "cm-custom-highlight-emphasis" });

export type Highlight = {
    id: string
    from: number
    to: number
};


export class Highlighter {

    decorations: DecorationSet

    private _activeIndex = 0

    constructor(public view: EditorView) {
        this.highlights = [];
        this.decorations = this.computeDecorations();
    }

    highlights: Highlight[];

    clear() {
        this.highlights = [];
        this.decorations = Decoration.none;
        this.view.update([]);
    }

    set(newHighlights: Highlight[]) {
        this._activeIndex = 0
        this.highlights = newHighlights;
        this.decorations = this.computeDecorations();
        this.view.update([]);
    }

    next(): number {
        if (this._activeIndex < this.highlights.length - 1) {
            this._activeIndex++
            this.decorations = this.computeDecorations();
        }
        this.navigate()
        return this._activeIndex
    }

    previous(): number {
        if (this._activeIndex > 0) {
            this._activeIndex--
            this.decorations = this.computeDecorations();
        }
        this.navigate()
        return this._activeIndex
    }

    navigate(): number {
        if (this.highlights[this._activeIndex]) {
            this.view.dispatch({
                effects: EditorView.scrollIntoView(this.highlights[this._activeIndex].from, { y: "center" })
            });
        }

        return this._activeIndex
    }

    update(update: ViewUpdate) {
        if (update.docChanged) {
            // TODO: use update.changes.mapPos(oldPos) to remap positions.
            this.decorations = this.computeDecorations();
        }
    }

    private computeDecorations() {
        const higlighths = this.highlights.map((h, i) => (i == this._activeIndex ? highlightMarkEmphasis : highlightMark).range(h.from, h.to))
        return Decoration.set(higlighths);
    }
}

export const highlightPlugin = ViewPlugin.fromClass(Highlighter, {
    decorations: manager => manager.decorations
});
