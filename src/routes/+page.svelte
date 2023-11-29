<script>
	import { Editor, UnifiedText } from '../lib';

	let editor;

	const content = `# Sample heading
Trying out [Links](somelink.md) and **bold** and *italic* and ~~strikethrough~~  lists:
1. List item 1
2. List item 2

Unordered:
* list item 1
* list item 2
  * list item 2.1

Code \`inline\` and code block —

\`\`\`javascript
const test = 'code block'
\`\`\`

## Heading 2
Some text.

### Heading 3
Almost
#### heading 4
As text
##### heading 5
###### heading 6`;

	function onEditorMount(e) {
		editor = UnifiedText(e.detail, {
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
		});
	}
</script>

<div class="page">
	<div class="controls">
		<div>
			Font size:
			<button on:click={editor.increaseFontSize()}>+</button>
			<button on:click={editor.decreaseFontSize()}>-</button>
		</div>
	</div>

	<Editor on:mount={onEditorMount}></Editor>
</div>

<style>
	.page {
		display: flex;
		height: 100%;
	}

	.controls {
		width: 300px;
		height: 100%;
		border: 1px solid black;
		padding: 8px;
	}

	.controls > div {
		display: flex;
	}
</style>
