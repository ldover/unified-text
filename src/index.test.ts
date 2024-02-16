import { describe, it, expect } from 'vitest';
import type { Extension, StateCommand } from '@codemirror/state';
import { EditorSelection, EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { bold } from '../src/lib/commands.js';

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
	if (state.selection.ranges.length != 1) {
		throw new Error('Expecting a single selection');
	}

	// todo: handle single cursor here
	[state.selection.ranges[0].from, state.selection.ranges[0].to].forEach((i, j) => {
		doc = doc.slice(0, i + j) + '|' + doc.slice(i + j);
	});

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
	function test(from: string, to: string, ext?: Extension) {
		const state = mkState(from, ext);
		const out = stateStr(cmd(state, bold));
		expect(out).toBe(to);
	}

	it('applies formatting', () => test('|bolded|', '**|bolded|**'));

	it('applies formatting with surrounding text', () =>
		test('some |bolded| text', 'some **|bolded|** text'));

	it('removes formatting when selection is already formatted', () =>
		test('|**bolded**|', '|bolded|'));

	it('removes formatting when formatting is applied outside selection 2', () =>
		test('**|bolded|**', '|bolded|'));

	// todo: edge cases
	// creates formatting on single selection test('|' '**|**'));
	// removes formatting when empty formatting test('**|**', '|'));
	// does nothing when inside bolded text test('**bolded|**', '**bolded|**'));

	// it('strips whitespace before formatting', () =>
	// 	test('some| bolded |text', 'some **|bolded|** text'));
	//
	// it('handles overlapping formatting', () =>
	// 	test('some |bol**ded**| text', 'some **|bolded|** text'));
});
