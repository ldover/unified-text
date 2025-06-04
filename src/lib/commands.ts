// commands.ts
import type { StateCommand } from '@codemirror/state';
import { EditorSelection } from '@codemirror/state';

/* helper ──────────────────────────────────────────────────────────────── */
function stripPairedMarks(text: string, sign: string): string {
	let out = '';
	for (let i = 0; i < text.length;) {
		if (text.startsWith(sign, i)) {
			const j = text.indexOf(sign, i + sign.length);
			if (j !== -1) {                                // paired ⇒ drop both marks
				out += text.slice(i + sign.length, j);
				i = j + sign.length;
				continue;
			}                                               // lone mark ⇒ keep
		}
		out += text[i++];
	}
	return out;
}

/* command ─────────────────────────────────────────────────────────────── */
const formatMarkdown = (sign: string): StateCommand => {
	return ({ state, dispatch }) => {
		const sel = state.selection.main;
		const doc = state.doc;

		/*───────────────────────────────────────────────────────────*
		 * NON-EMPTY SELECTION                                       *
		 *───────────────────────────────────────────────────────────*/
		if (!sel.empty) {
			const raw = doc.sliceString(sel.from, sel.to);

			/* a) whole selection already wrapped → unwrap */
			if (raw.startsWith(sign) && raw.endsWith(sign)) {
				const inner = raw.slice(sign.length, raw.length - sign.length);
				dispatch(
					state.update({
						changes: { from: sel.from, to: sel.to, insert: inner },
						selection: EditorSelection.range(sel.from, sel.from + inner.length)
					})
				);
				return true;
			}

			/* b) selection is inside an outer wrapper **|text|** → unwrap */
			if (
				sel.from >= sign.length &&
				sel.to + sign.length <= doc.length &&
				doc.sliceString(sel.from - sign.length, sel.from) === sign &&
				doc.sliceString(sel.to, sel.to + sign.length) === sign
			) {
				dispatch(
					state.update({
						changes: [
							{ from: sel.to, to: sel.to + sign.length },   // closing **
							{ from: sel.from - sign.length, to: sel.from }    // opening  **
						],
						selection: EditorSelection.range(
							sel.from - sign.length,
							sel.to - sign.length
						)
					})
				);
				return true;
			}

			/* c) fresh formatting (trim WS + drop inner pairs, keep lone marks) */
			const leadingWS = raw.match(/^\s+/)?.[0] ?? '';
			const trailingWS = raw.match(/\s+$/)?.[0] ?? '';
			const coreFrom = sel.from + leadingWS.length;
			const coreTo = sel.to - trailingWS.length;

			let coreText = doc.sliceString(coreFrom, coreTo);
			coreText = stripPairedMarks(coreText, sign);         // << new helper

			const wrapped = sign + coreText + sign;
			dispatch(
				state.update({
					changes: { from: coreFrom, to: coreTo, insert: wrapped },
					selection: EditorSelection.range(
						coreFrom + sign.length,
						coreFrom + sign.length + coreText.length
					)
				})
			);
			return true;
		}

		/*───────────────────────────────────────────────────────────*
		 * CURSOR-ONLY BEHAVIOUR                                     *
		 *───────────────────────────────────────────────────────────*/
		const before = doc.sliceString(sel.from - sign.length, sel.from);
		const after = doc.sliceString(sel.from, sel.from + sign.length);

		/* cursor between an empty pair **|** → delete */
		if (before === sign && after === sign) {
			dispatch(
				state.update({
					changes: [
						{ from: sel.from - sign.length, to: sel.from },
						{ from: sel.from, to: sel.from + sign.length }
					],
					selection: EditorSelection.cursor(sel.from - sign.length)
				})
			);
			return true;
		}

		/* cursor somewhere inside bold text → no-op */
		const openPos = doc.sliceString(0, sel.from).lastIndexOf(sign);
		const closeRel = doc.sliceString(sel.from).indexOf(sign);
		if (
			openPos !== -1 &&
			closeRel !== -1 &&
			openPos < sel.from - sign.length &&
			sel.from + closeRel >= sel.from
		) {
			return false;
		}

		/* default: insert empty pair and place cursor between */
		dispatch(
			state.update({
				changes: { from: sel.from, to: sel.to, insert: sign + sign },
				selection: EditorSelection.cursor(sel.from + sign.length)
			})
		);
		return true;
	};
};

export const bold: StateCommand = formatMarkdown('**');
export const emphasize: StateCommand = formatMarkdown('*');
export const strikethrough: StateCommand = formatMarkdown('~~');
export const underline: StateCommand = formatMarkdown('~');
