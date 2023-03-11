<script>
  import { store } from "../store";

  import Button from "./Button.svelte";

  export let loading;
  export let toggleModal;

  async function connect() {
    loading = "stoic";
    await store.stoicConnect();
    loading = "";
    toggleModal();
  }
</script>

<Button on:click={connect} disabled={loading}>
  {#if loading === "stoic"}
    loading
  {:else}
    stoic
  {/if}
</Button>
