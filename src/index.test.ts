import { describe, it, expect } from 'vitest';
import type { Extension, StateCommand } from '@codemirror/state';
import { EditorSelection, EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { bold, emphasize } from '../src/lib/commands.js';

function mkState(doc: string, extension?: Extension) {
	const cursors = [];
	for (let pos = 0; ; ) {
		pos = doc.indexOf('|', pos);
		if (pos < 0) break;
		cursors.push(pos);
		doc = doc.slice(0, pos) + doc.slice(pos + 1);
	}

	let selection;

	// if 1 then just create cursor
	if (cursors.length == 1) {
		selection = EditorSelection.create([EditorSelection.cursor(cursors[0])]);
	} else if (cursors.length == 2) {
		// if 2 create selection
		selection = EditorSelection.create([EditorSelection.range(cursors[0], cursors[1])]);
	} else {
		throw new Error('Expecting 1 or 2 cursors to make state');
	}

	return EditorState.create({
		doc,
		selection,
		extensions: [markdown().language, extension || []]
	});
}

function stateStr(state: EditorState) {
	let doc = state.doc.toString();
	// Check if there's only one range and if it's a cursor (from == to)
	if (state.selection.ranges.length === 1 && state.selection.main.empty) {
		// Handle a single cursor position
		const cursorPos = state.selection.main.from;
		doc = doc.slice(0, cursorPos) + '|' + doc.slice(cursorPos);
	} else if (state.selection.ranges.length === 1) {
		// Handle a single selection range
		const { from, to } = state.selection.main;
		doc = doc.slice(0, from) + '|' + doc.slice(from, to) + '|' + doc.slice(to);
	} else {
		// More complex cases with multiple selections can be added here if needed
		throw new Error('This utility currently supports single selections or cursors only.');
	}

	return doc;
}


function cmd(state: EditorState, command: StateCommand) {
	command({
		state,
		dispatch(tr) {
			state = tr.state;
		}
	});
	return state;
}

describe('bold', () => {
	function test(from: string, to: string, command?: StateCommand, ext?: Extension,) {
		const state = mkState(from, ext);
		const out = stateStr(cmd(state, command ?? bold));
		expect(out).toBe(to);
	}

	it('applies formatting', () => test('|bolded|', '**|bolded|**'));

	it('applies formatting with surrounding text', () =>
		test('some |bolded| text', 'some **|bolded|** text'));

	it('removes formatting when selection is already formatted', () =>
		test('|**bolded**|', '|bolded|'));

	it('removes formatting when formatting is applied outside selection 2', () =>
		test('**|bolded|**', '|bolded|'));

	it('creates formatting on single selection', () => {
		// Test applying bold formatting when there's only a cursor (no selection)
		test('|', '**|**');
	});

	it('removes formatting when empty formatting', () => {
		// Test removing bold formatting when the selection is within an empty bold syntax
		test('**|**', '|');
	});

	it('does nothing when inside bolded text', () => {
		// Test that no additional formatting is applied when the cursor is inside an already bolded text
		test('**bolded|**', '**bolded|**');
	});

	it('strips whitespace before formatting', () =>
		test('some| bolded |text', 'some **|bolded|** text'));

	it('handles overlapping formatting', () =>
		test('some |bol**ded**| text', 'some **|bolded|** text'));

	it('handles overlapping formatting without removing non-formatting signs', () =>
		test('some |**bol** ** ded| text', 'some **|bol ** ded|** text'));

	it('handles removing middle part of the formatted text', () =>
		test('**some |bolded| text**', '**some** bolded **text**'));

	it('handles removing left part of the formatted text', () =>
		test('**|some| bolded text**', 'some **bolded text**'));

	it('handles removing right part of the formatted text', () =>
		test('**some bolded |text|**', '**some bolded** text'));

	it('handles nested formatting', () =>
		test('**|some bolded text|**', '***|some bolded text|***', emphasize));
});
