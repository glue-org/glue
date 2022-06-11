<script lang="ts">
  import { onMount } from "svelte";
  import "./app.css";
  import Login from "./components/Login.svelte";
  import { store } from "./store";
  import { authorize, checkIfUserIsAuthorized, notifyServer } from "./utils";
  import { Principal } from "@dfinity/principal";

  // check if code parameter is in query
  const code = new URLSearchParams(window.location.search).get("code");

  // check if guild is in query and store it in session storage
  const guild = new URLSearchParams(window.location.search).get("guild");
  // store string in window.sessionStorage
  if (guild) {
    window.sessionStorage.setItem("guild", guild);
  }

  let userIsAuthorized;

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
    $store.actor
      .storeMessage({
        guildId: window.sessionStorage.getItem("guild"),
        discordId: window.sessionStorage.getItem("user_id"),
      })
      .then(() => {
        console.log("message sent");
      })
      .then(() => {
        notifyServer($store.principal.toString());
      })
      .catch((err) => {
        console.error(err);
        alert("no guild provided");
      });
  }
</script>

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
      <div>Authorized {$store.principal}</div>
      <div>
        <button class="btn my-4" on:click={async () => await store.disconnect()}
          >disconnect</button
        >
        <button
          class="btn my-4"
          on:click={async () => {
            let response = await $store.actor.retrieveMessage(
              Principal.fromText(
                "ci6uj-i7ujw-wrp3j-6nfh6-ux3y4-hym5t-ruodk-flgjh-salcu-6nxa2-cae",
              ),
            );
            console.log(response);
          }}>get Message</button
        >
      </div>
    </div>
  {/if}
</div>
