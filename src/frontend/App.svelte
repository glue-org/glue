<script lang="ts">
  import { onMount } from "svelte";
  import "./app.css";
  import Login from "./components/Login.svelte";
  import Menu from "./components/Menu.svelte";
  import { store } from "./store";
  import { authorize, checkIfUserIsAuthorized, notifyServer } from "./utils";

  // check if code parameter is in query
  const code = new URLSearchParams(window.location.search).get("code");

  // check if guild is in query and store it in session storage
  const guild = new URLSearchParams(window.location.search).get("guild");
  // store string in window.sessionStorage
  if (guild) {
    window.sessionStorage.setItem("guild", guild);
  }

  let userIsAuthorized = false;
  let verifyingUser = false;
  let error = false;

  onMount(async () => {
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
        alert("no guild provided");
      });
  }
</script>

<Menu />

<h1 class="text-9xl text-center">GLUE</h1>

<div class="flex justify-center items-center h-screen">
  {#if !userIsAuthorized}
    <a
      href="https://discord.com/api/oauth2/authorize?client_id=974260670675697714&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code&scope=identify"
    >
      <button class="btn">authenticate via discord</button>
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
