<script lang="ts">
  import { store } from "../store";

  import Button from "./Button.svelte";

  export let loading;
  export let toggleModal;

  async function connect() {
    loading = "plug";
    await store.plugConnect();
    loading = "";
    toggleModal();
  }
</script>

<Button on:click={connect} disabled={loading}>
  {#if loading === "plug"}
    loading
  {:else}
    plug
  {/if}
</Button>
