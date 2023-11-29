<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let el: HTMLElement;

	onMount(() => {
		dispatch('mount', el);
	});
</script>

<div class="h-full relative">
	<div bind:this={el} class="h-full"></div>
	<div class="absolute bottom-0 left-0 w-full"></div>
</div>

<style>
</style>
