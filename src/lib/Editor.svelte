<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let el: HTMLElement;

	onMount(() => {
		dispatch('mount', el);
	});
</script>

<div bind:this={el}></div>

<style>
	div {
		width: 100%;
        height: 100%;
	}
</style>
