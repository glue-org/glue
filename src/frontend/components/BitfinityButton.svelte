<script lang="ts">
  import { store } from "../store";
  import Button from "./Button.svelte";

  export let loading;
  export let toggleModal;

  async function connect() {
    loading = "bitfinity";
    await store.bitfinityConnect();
    loading = "";
    toggleModal();
  }
</script>

<Button on:click={connect} disabled={loading}>
  {#if loading === "bitfinity"}
    loading
  {:else}
    bitfinity
  {/if}
</Button>
