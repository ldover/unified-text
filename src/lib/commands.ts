import type { StateCommand } from '@codemirror/state';
import { EditorSelection } from '@codemirror/state';

const formatMarkdown = (sign: string): StateCommand => {
	return ({ state, dispatch }) => {
		const { from, to } = state.selection.main;
		let selected = state.doc.sliceString(from, to);
		// Look around the selection to selected text is formatted: **|bolded text|**
		const selectedOut = state.doc.sliceString(from - sign.length, to + sign.length);

		function isFormatted(text: string) {
			return text.startsWith(sign) && text.endsWith(sign);
		}

		const isInnerFormatted = isFormatted(selected);
		const isOuterFormatted = isFormatted(selectedOut);

		let selection;
		let insertFrom = from;
		let insertTo = to;
		if (isInnerFormatted) {
			// if |**bold**|, then new selection will be same on the left and -4 on the right
			selection = { from: from, to: to - sign.length * 2 };
			selected = selected.substring(sign.length, selected.length - sign.length); // remove formatting
		} else if (isOuterFormatted) {
			// if **|bold|**, then new selection will be -2 for left and -2 for right
			selection = { from: from - sign.length, to: to - sign.length };
			insertFrom -= sign.length;
			insertTo += sign.length;
		} else {
			selection = { from: from + sign.length, to: to + sign.length };
			selected = `${sign}${selected}${sign}`; // Apply formatting
		}

		const tr = state.update({
			changes: { from: insertFrom, to: insertTo, insert: selected },
			selection: EditorSelection.create([EditorSelection.range(selection.from, selection.to)])
		});

		dispatch(tr);
		return true;
	};
};

export const bold: StateCommand = formatMarkdown('**');
export const emphasize: StateCommand = formatMarkdown('*');
export const strikethrough: StateCommand = formatMarkdown('~~');
export const underline: StateCommand = formatMarkdown('~');
