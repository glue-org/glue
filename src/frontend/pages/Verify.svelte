<script lang="ts">
  import { onMount } from "svelte";
  import Login from "../components/Login.svelte";
  import Menu from "../components/Menu.svelte";
  import { REDIRECT_URL } from "../constants";
  import { store } from "../store";
  import { authorize, checkIfUserIsAuthorized, notifyServer } from "../utils";
  import Logo from "../assets/glue.png";
  import Footer from "../components/Footer.svelte";

  // check if code parameter is in query
  const code = new URLSearchParams(window.location.search).get("code");

  // check if guild is in query and store it in session storage
  const guild = new URLSearchParams(window.location.search).get("guild");
  // store string in window.sessionStorage
  if (guild) {
    window.sessionStorage.setItem("guild", guild);
  }

  // check if theme is provided
  const theme = new URLSearchParams(window.location.search).get("theme");
  // store string in window.sessionStorage
  if (theme) {
    window.sessionStorage.setItem("theme", theme);
  }

  // check if logo is provided
  const customLogo = new URLSearchParams(window.location.search).get("logo")
    ? Buffer.from(
        new URLSearchParams(window.location.search).get("logo"),
        "base64",
      ).toString("ascii")
    : null;
  // store string in window.sessionStorage
  if (customLogo) {
    window.sessionStorage.setItem("customLogo", customLogo);
  }
  console.log("this is your logo src decoded", customLogo);

  let userIsAuthorized = false;
  let verifyingUser = false;
  let error = false;

  onMount(async () => {
    // get a reference to the html tag
    if (window.sessionStorage.getItem("theme")) {
      document.documentElement.setAttribute(
        "data-theme",
        window.sessionStorage.getItem("theme"),
      );
    }

    // check if user is authorized via session cookie
    userIsAuthorized = await checkIfUserIsAuthorized();
    // if not, try and authorize her
    if (!userIsAuthorized && code) {
      console.log("trying to authorize user with code");
      await authorize(code);
      // check if user is authorized via session cookie
      userIsAuthorized = await checkIfUserIsAuthorized();
    }
  });

  $: if (userIsAuthorized && $store.isAuthed) {
    verifyingUser = true;
    $store.actor
      .storeMessage({
        guildId: window.sessionStorage.getItem("guild"),
        discordId: window.sessionStorage.getItem("user_id"),
      })
      .then(() => {
        return notifyServer($store.principal.toString());
      })
      .then((reponse) => {
        if (reponse.ok) {
          console.log("message sent");
          verifyingUser = false;
        } else {
          error = true;
        }
      })
      .catch((err) => {
        console.error(err);
        alert(err);
      });
  }
</script>

<Menu />

<div
  class="py-10 space-y-20 h-screen flex flex-col items-center justify-evenly"
>
  <img
    src={window.sessionStorage.getItem("customLogo")
      ? window.sessionStorage.getItem("customLogo")
      : Logo}
    class="w-1/2 h-auto"
    alt="glue logo"
  />

  <div class="">
    {#if !userIsAuthorized}
      <a href={REDIRECT_URL}>
        <button class="btn mb-20">authenticate via discord</button>
      </a>
    {/if}
    {#if !$store.isAuthed && userIsAuthorized}
      <Login />
    {:else if $store.isAuthed && userIsAuthorized}
      <div class="flex flex-col items-center justify-center">
        {#if verifyingUser}
          <progress class="progress w-56" />
          <div>verifying user ...</div>
        {:else if error}
          <div>an error occured, please try again</div>
        {:else}
          <div>you can close this page now</div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<Footer />
