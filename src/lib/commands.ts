import type { StateCommand } from '@codemirror/state';
import { EditorSelection } from '@codemirror/state';

const formatMarkdown = (sign: string): StateCommand => {
	return ({ state, dispatch }) => {
		const { from, to } = state.selection.main;
		let text = state.doc.sliceString(from, to);
		const isFormatted = text.startsWith(sign) && text.endsWith(sign);
		// todo: look around to see if selection is formatted: **|bolded text|**

		if (isFormatted) {
			text = text.substring(sign.length, text.length - sign.length); // remove formatting
		} else {
			text = `${sign}${text}${sign}`;  // Apply formatting
		}

		const tr = state.update({
			changes: { from, to, insert: text },
			selection: EditorSelection.create([
				EditorSelection.range(from + sign.length, to + sign.length)
			])
		});

		dispatch(tr);
		return true;
	};
};

export const bold: StateCommand = formatMarkdown('**');
export const emphasize: StateCommand = formatMarkdown('*');
export const strikethrough: StateCommand = formatMarkdown('~~');
export const underline: StateCommand = formatMarkdown('~');
