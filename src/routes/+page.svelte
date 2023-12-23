<script lang="ts">
	import { Editor, UnifiedText } from '../lib';
	import { bear, oceanBlue, tiger } from '../lib/theme';

	const content = `# Sample heading
Trying out [Links](somelink.md) and **bold** and *italic* and ~~strikethrough~~  lists:
1. List item 1
2. List item 2

Unordered:
* list item 1
* list item 2
  * list item 2.1

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
###### heading 6`;


	let editor;

	function onEditorMount(e) {
		editor = UnifiedText({
			// theme: oceanBlue,
			// theme: bear,
			theme: tiger,
			content,
			completions: [
				{ node: 'image', name: 'favicon.png', title: 'favicon.png', path: '/favicon.png' },
				{ node: 'link', name: 'Quality', title: 'Quality', path: 'datastore://quality.md' },
				{ node: 'link', name: 'Value', title: 'Value', path: 'datastore://value.md' },
				{ node: 'link', name: 'Action', title: 'Action', path: 'datastore://value.md' },
				{ node: 'link', name: 'Knowledge', title: 'Knowledge', path: 'datastore://value.md' },
				{
					node: 'link',
					name: 'Knowledge applications',
					title: 'Knowledge applications',
					path: 'datastore://value.md'
				},
				{
					node: 'link',
					name: 'Knowledge stack',
					title: 'Knowledge stack',
					path: 'datastore://value.md'
				}
			],
			callbacks: {
				onLinkClick: (url) => console.log(url)
			}
		})

		editor.setElement(e.detail)
	}
</script>

<div class="page">
	<div class="controls">
		<div>
			Focus
			<button on:click={() => editor.focus()}>Focus</button>
		</div>
		<div>
			Editable
			<button on:click={() => editor.setEditable(false)}>set read only</button>
		</div>
	</div>

	<div class="editor-container">
		<Editor on:mount={onEditorMount}></Editor>
	</div>
	<div class="footer-area"></div>
</div>

<style>
	.editor-container {
		width: 100%;
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
