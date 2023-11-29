import { syntaxTree } from '@codemirror/language';
import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import type { EditorView } from 'codemirror';

export interface MarkdownCompletion {
	node: 'link' | 'image';
	name: string; // name to match
	title: string; // title to use in the link or image
	path: string;
}

export function completeImageLinks(
	context: CompletionContext,
	images: MarkdownCompletion[],
	links: MarkdownCompletion[]
): CompletionResult | null {
	const formatImage = (completion: MarkdownCompletion) =>
		`![${completion.name}](${completion.path})`;
	const formatLink = (completion: MarkdownCompletion) => `[${completion.name}](${completion.path})`;

	const createOptions = (
		start: number,
		end: number,
		completions: MarkdownCompletion[],
		format: (completion: MarkdownCompletion) => string
	) =>
		completions.map((completion) => ({
			label: completion.name,
			apply: (view: EditorView) => {
				const completedText = format(completion);
				view.dispatch({
					changes: [
						{ from: start, to: end }, // delete the incomplete node
						{ from: start, insert: completedText } // insert completed text
					],
					// Set the selection to the position after the completed text
					selection: { anchor: start + completedText.length }
				});
			},
			type: 'text'
		}));

	const tree = syntaxTree(context.state);
	const nodeBefore = tree.resolveInner(context.pos, -1);
	const nodeBefore0 = tree.resolveInner(context.pos, 0);
	if (nodeBefore.name === 'Image') {
		const startImageNode = nodeBefore.from; // from `!`
		const endImageNode = nodeBefore.to; // to `]` or `)`, which depends on whether URL part is present
		return {
			from: nodeBefore.from + 2, // Start matching after `![`
			options: createOptions(startImageNode, endImageNode, images, formatImage)
		};
	} else if (nodeBefore.name === 'URL' && nodeBefore0.name === 'Image') {
		const startImageNode = nodeBefore.from - 4; // from "!"
		const endImageNode = nodeBefore.to + 1; // to ")"

		return {
			from: nodeBefore.from, // Start matching from the start of URL node as '()' are not part of URL
			options: createOptions(startImageNode, endImageNode, images, formatImage)
		};
	} else if (nodeBefore.name === 'Link') {
		return {
			from: nodeBefore.from + 1, // Start matching after `[`
			options: createOptions(nodeBefore.from, nodeBefore.to, links, formatLink)
		};
	}

	return null;
}

export function getMarkdownAutocomplete(completions: MarkdownCompletion[]) {
	let linkCompletions: MarkdownCompletion[] = [];
	let imageCompletions: MarkdownCompletion[] = [];

	function _setCompletions(completions: MarkdownCompletion[]) {
		linkCompletions = completions?.filter((c) => c.node === 'link');
		imageCompletions = completions?.filter((c) => c.node === 'image');
	}

	_setCompletions(completions);

	return {
		setCompletions: function (completions: MarkdownCompletion[]) {
			_setCompletions(completions);
		},
		autocomplete: function (context: CompletionContext) {
			return completeImageLinks(context, imageCompletions, linkCompletions);
		}
	};
}
