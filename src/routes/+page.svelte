<script lang="ts">
	import { UnifiedText } from '../lib/editor.js';
	import Editor from '../lib/Editor.svelte';
	import { bear, oceanBlue } from '../lib/theme';
	import type {MarkdownCompletion} from "$lib/completions.js";
	import { Highlighter } from '$lib/highlight.js';

	const content = `# Sample heading
Trying out [Links](somelink.md) and **bold** and *italic* and ~~strikethrough~~  lists:
1. List item 1
2. List item 2

Unordered:
* list item 1
* list item 2
  * list item 2.1

Here is a link: www.somelink.com


Code \`inline\` and code block —

\`\`\`
const test = 'code block'
\`\`\`


And blockquote:

> "If I have 10 hours to cut down a tree I will spend the first few hours sharpening the axe."
> Lincoln

And a hardbreak\\
with text continuing on next line.

And a few tasks:
* [ ] Code a Bear theme
* [ ] Code a Knowledge Universe theme


## Heading 2
Some text.

### Heading 3
Almost
#### heading 4
As text
##### heading 5
###### heading 6 

## Math

Euler's identity is $e^{i\pi} + 1 = 0$ in one elegant formula.

`;


	let editor: UnifiedText;

	let plugin: Highlighter

	let highlights = [{from: 0, to: 10, id: '1'}, 
		{from: 20, to: 30, id: '2'}, 
		{from: 400, to: 420, id: '3'}]

	function onEditorMount(e) {
		let completions: MarkdownCompletion[] = [
			{embeddable: true, type: 'image', name: 'favicon.png', title: 'favicon.png', path: '/favicon.png'},
			{embeddable: true, type: 'image', name: 'knowledge-universe.png', title: 'knowledge-universe.png', path: '/favicon.png'},
			{type: 'note', name: 'Quality', title: 'Quality', path: 'datastore://quality.md'},
			{type: 'note', name: 'Value', title: 'Value', path: 'datastore://value.md'},
			{type: 'note', name: 'Action', title: 'Action', path: 'datastore://value.md'},
			{type: 'note', name: 'Knowledge', title: 'Knowledge', path: 'datastore://value.md'},
			{detail: '#evergreen', boost: 99, type: 'note', name: 'Knowledge 2', title: 'Knowledge 2', path: 'datastore://value.md'},
			{detail: '#evergreen', boost: 0, type: 'note', name: 'Knowledge 3', title: 'Knowledge 3', path: 'datastore://value.md'},
			{detail: '#evergreen', boost: 50, type: 'note', name: 'Knowledge 4', title: 'Knowledge 4', path: 'datastore://value.md'},
			{detail: '#logs', boost: 30, type: 'log', name: 'Knowledge log', title: 'Knowledge log', path: 'datastore://value.md'},
			{detail: 'inbox', name: 'Knowledge applications', title: 'Knowledge applications', path: 'datastore://value.md'},
			{detail: 'inbox', name: 'Knowledge stack', title: 'Knowledge stack', path: 'datastore://value.md'}
		];
		editor = new UnifiedText({
			// theme: oceanBlue,
			theme: bear,
			content,
			completions: completions,
			katexEnabled: true
		})

		editor.on('link-click', (url) => console.log({url}))
		// editor.on('change', (content) => console.log({content}))
		// editor.on('selection-change', (selection) => console.log(editor.serializeSelection(selection)))
		// editor.on('scroll', (scroll) => console.log({scroll}))
		editor.setElement(e.detail)
		editor.setContent(content, '1')
		
		plugin = editor.getHighlightPlugin()!
		
		plugin.set(highlights)
		setTimeout(() => {
			console.log('scroll down')
			editor.insert('testing', editor.getContent().length)
		}, 5000)
	}
	
	let activeIndex = 0
</script>

<div class="page">
	<div class="controls">
		<div>
			Prev highlight
			<button on:click={() => activeIndex = plugin.previous()}>Prev highlight</button>
		</div>
		<div>{activeIndex}/{highlights.length}</div>
		<div>
			Next highlight
			<button on:click={() => activeIndex = plugin.next()}>Next highlight</button>
		</div>
		<div>
			Focus
			<button on:click={() => editor.focus()}>Focus</button>
		</div>
		<div>
			Editable
			<button on:click={() => editor.setEditable(!editor.isEditable())}>Toggle editable</button>
		</div>
	</div>

	<div class="editor-container">
		<Editor on:mount={onEditorMount}></Editor>
	</div>
	<div class="footer-area"></div>
</div>

<style>
	.editor-container {
		width: 50%;
		height: 100%;
		/*max-height: 700px;*/
		border: 1px solid black;
	}

	.footer-area {
		height: 0%;
	}

	.page {
		overflow-y: hidden;
		/*display: flex;*/

		height: 100vh;
	}

	.controls {
		width: 300px;
		border: 1px solid black;
		padding: 8px;
	}

	.controls > div {
		display: flex;
	}
</style>
