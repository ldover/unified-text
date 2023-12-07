import type { StateCommand } from '@codemirror/state';
import { EditorSelection } from '@codemirror/state';

const formatMarkdown = (sign: string): StateCommand => {
	return ({ state, dispatch }) => {
		const p0 = state.selection.main.from;
		const p1 = state.selection.main.to;

		const tr = state.update({
			changes: [
				{ from: p0, insert: sign },
				{ from: p1, insert: sign }
			],
			selection: EditorSelection.cursor(p1 + sign.length * 2)
		});

		dispatch(tr);
		return true;
	};
};

export const bold: StateCommand = formatMarkdown('**');
export const emphasize: StateCommand = formatMarkdown('*');
export const strikethrough: StateCommand = formatMarkdown('~~');
export const underline: StateCommand = formatMarkdown('~');
