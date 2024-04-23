import { syntaxTree } from '@codemirror/language';
import type { CompletionContext, CompletionResult  } from '@codemirror/autocomplete';
import type { EditorView } from 'codemirror';

export interface MarkdownCompletion {
	embeddable?: boolean
	name: string; // name to match
	title: string; // title to use in the link or image
	path: string;
	type: string // maps to CSS selector `.cm-completionIcon-{type}`
	boost?: number
	detail?: string
}

export function completeLinksAndEmbeds(
	context: CompletionContext,
	embeds: MarkdownCompletion[],
	links: MarkdownCompletion[]
): CompletionResult | null {
	const formatEmbed = (completion: MarkdownCompletion) =>
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
			boost: completion.boost,
			detail: completion.detail,
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
			type: completion.type
		}));

	const tree = syntaxTree(context.state);
	const nodeBefore = tree.resolveInner(context.pos, -1);
	const nodeBefore0 = tree.resolveInner(context.pos, 0);
	if (nodeBefore.name === 'Image') {
		const startImageNode = nodeBefore.from; // from `!`
		const endImageNode = nodeBefore.to; // to `]` or `)`, which depends on whether URL part is present
		return {
			from: nodeBefore.from + 2, // Start matching after `![`
			options: createOptions(startImageNode, endImageNode, embeds, formatEmbed)
		};
	} else if (nodeBefore.name === 'URL' && nodeBefore0.name === 'Image') {
		const startImageNode = nodeBefore.from - 4; // from "!"
		const endImageNode = nodeBefore.to + 1; // to ")"

		return {
			from: nodeBefore.from, // Start matching from the start of URL node as '()' are not part of URL
			options: createOptions(startImageNode, endImageNode, embeds, formatEmbed)
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
	let embedCompletions: MarkdownCompletion[] = [];

	function _setCompletions(completions: MarkdownCompletion[]) {
		linkCompletions = completions
		embedCompletions = completions?.filter((c) => c.embeddable);
	}

	_setCompletions(completions);

	return {
		setCompletions: function (completions: MarkdownCompletion[]) {
			_setCompletions(completions);
		},
		autocomplete: function (context: CompletionContext) {
			return completeLinksAndEmbeds(context, embedCompletions, linkCompletions);
		}
	};
}
