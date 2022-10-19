<script lang="ts">
  import "./app.css";
  import Footer from "./components/Footer.svelte";
  import Router from "svelte-spa-router";
  import Verify from "./pages/Verify.svelte";
  import TOS from "./pages/TOS.svelte";
  import Privacy from "./pages/Privacy.svelte";

  const routes = {
    // Exact path
    "/": Verify,
    "/tos": TOS,
    "/privacy": Privacy,
  };
</script>

<Router {routes} />

<Footer />
