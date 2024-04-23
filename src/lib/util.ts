import { syntaxTree } from '@codemirror/language';
import type { EditorView } from 'codemirror';
import type { SyntaxNode } from '@lezer/common';

export function nodeAtPosition(event: MouseEvent, view: EditorView): SyntaxNode | null {
	const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
	if (pos) {
		const tree = syntaxTree(view.state);
		// Find the leaf (smallest node) at the given position
		return tree.resolve(pos, -1);
	}

	return null;
}

export function extractLink(node: SyntaxNode, view: EditorView): string | null {
	if (node.type.name === 'Link') {
		const tokenText = view.state.doc.sliceString(node.from, node.to);
		// Extract the URL part of the link
		const urlMatch = tokenText.match(/\[.*?\]\((.*?)\)/);
		if (urlMatch && urlMatch[1]) {
			return urlMatch[1];
		}

		return null;
	} else if (node.type.name === 'URL') {
		return view.state.doc.sliceString(node.from, node.to);
	} else {
		throw new Error(`Cannot extract link from node type: ${node.type.name}`);
	}
}
