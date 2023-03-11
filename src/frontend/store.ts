import { writable, get } from "svelte/store";
import type { Principal } from "@dfinity/principal";
import { Actor, HttpAgent } from "@dfinity/agent";
import { StoicIdentity } from "ic-stoic-identity";
import {
  backend,
  createActor,
  canisterId,
  idlFactory,
} from "../declarations/backend";
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl";

export const HOST =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://ic0.app";

type State = {
  isAuthed: "plug" | "stoic" | "bitfinity" | null;
  principal: Principal;
  actor: typeof backend;
  error: string;
  isLoading: boolean;
};

const defaultState: State = {
  isAuthed: null,
  principal: null,
  actor: null,
  error: "",
  isLoading: false,
};

export const createStore = ({
  whitelist,
  host,
}: {
  whitelist?: string[];
  host?: string;
}) => {
  const { subscribe, update } = writable<State>(defaultState);

  const checkConnections = async () => {
    await checkStoicConnection();
    await checkPlugConnection();
    await checkBitfinityConnection();
  };

  const checkStoicConnection = async () => {
    StoicIdentity.load().then(async (identity) => {
      if (identity !== false) {
        //ID is a already connected wallet!
        await stoicConnect();
      }
    });
  };

  const checkPlugConnection = async () => {
    const connected = await window.ic?.plug?.isConnected();
    if (connected) {
      console.log("plug connection detected");
      await plugConnect();
    }
  };

  const checkBitfinityConnection = async () => {
    const connected = await window.ic?.bitfinityWallet?.isConnected();
    if (connected) {
      console.log("bitfinity connection detected");
      await bitfinityConnect();
    }
  };

  const stoicConnect = async () => {
    StoicIdentity.load().then(async (identity) => {
      if (identity !== false) {
        //ID is a already connected wallet!
      } else {
        //No existing connection, lets make one!
        identity = await StoicIdentity.connect();
      }

      const actor = createActor(canisterId, {
        agentOptions: {
          identity,
          host: HOST,
        },
      });

      if (!actor) {
        console.warn("couldn't create actors");
        return;
      }

      const principal = identity.getPrincipal();

      update((state) => ({
        ...state,
        principal,
        actor,
        isAuthed: "stoic",
      }));
    });
  };

  const plugConnect = async () => {
    // check if plug is installed in the browser
    if (window.ic?.plug === undefined) {
      window.open("https://plugwallet.ooo/", "_blank");
      return;
    }

    // check if plug is connected
    const connected = await window.ic?.plug?.isConnected();
    if (!connected) {
      try {
        await window.ic?.plug.requestConnect({
          whitelist,
          host,
        });
        console.log("plug connected");
      } catch (e) {
        console.warn(e);
        return;
      }
    }

    // check wether agent is present
    // if not create it
    if (!window.ic?.plug?.agent) {
      console.warn("no agent found");
      const result = await window.ic?.plug?.createAgent({
        whitelist,
        host,
      });
      result
        ? console.log("agent created")
        : console.warn("agent creation failed");
    }
    // check of if createActor method is available
    if (!window.ic?.plug?.createActor) {
      console.warn("no createActor found");
      return;
    }

    // Fetch root key for certificate validation during development
    if (process.env.NODE_ENV !== "production") {
      window.ic.plug.agent.fetchRootKey().catch((err) => {
        console.warn(
          "Unable to fetch root key. Check to ensure that your local replica is running",
        );
        console.error(err);
      });
    }
    const actor = (await window.ic?.plug.createActor({
      canisterId: canisterId,
      interfaceFactory: idlFactory,
    })) as typeof backend;

    if (!actor) {
      console.warn("couldn't create actors");
      return;
    }

    const principal = await window.ic.plug.agent.getPrincipal();
    update((state) => ({
      ...state,
      actor,
      principal,
      isAuthed: "plug",
    }));

    console.log("plug is authed");
  };

  const bitfinityConnect = async () => {
    // check if bitfinity is installed in the browser
    if (window.ic?.bitfinityWallet === undefined) {
      window.open("https://wallet.infinityswap.one/", "_blank");
      return;
    }

    // check if bitfinity is connected
    const bitfinityConnected = await window.ic?.bitfinityWallet?.isConnected();
    if (!bitfinityConnected) {
      try {
        await window.ic?.bitfinityWallet.requestConnect({ whitelist });
        console.log("bitfinity connected");
      } catch (e) {
        console.warn(e);
        return;
      }
    }

    const actor = (await window.ic?.bitfinityWallet.createActor({
      canisterId: canisterId,
      interfaceFactory: idlFactory,
      host: HOST,
    })) as typeof backend;

    if (!actor) {
      console.warn("couldn't create actors");
      return;
    }

    const principal = await window.ic.bitfinityWallet.getPrincipal();

    update((state) => ({
      ...state,
      actor,
      principal,
      isAuthed: "bitfinity",
    }));

    console.log("bitfinity is authed");
  };

  const disconnect = async () => {
    const store = get({ subscribe });
    if (store.isAuthed === "stoic") {
      StoicIdentity.disconnect();
    } else if (store.isAuthed === "plug") {
      // awaiting this fails, promise never returns
      window.ic.plug.disconnect();
    } else if (store.isAuthed === "bitfinity") {
      await window.ic.bitfinityWallet.disconnect();
    }
    console.log("disconnected");
    update((prevState) => {
      return {
        ...defaultState,
      };
    });
  };

  return {
    subscribe,
    update,
    plugConnect,
    stoicConnect,
    bitfinityConnect,
    checkConnections,
    disconnect,
  };
};

export const store = createStore({
  whitelist: [canisterId],
  host: HOST,
});

declare global {
  interface Window {
    ic: {
      bitfinityWallet: {
        requestConnect: (options?: {
          whitelist?: string[];
          timeout?: number;
        }) => Promise<{ derKey: Buffer; rawKey: Buffer }>;
        isConnected: () => Promise<boolean>;
        createActor: (options: {
          canisterId: string;
          interfaceFactory: InterfaceFactory;
          host: string;
        }) => Promise<Actor>;
        getPrincipal: () => Promise<Principal>;
        disconnect: () => Promise<boolean>;
        getAccountID: () => Promise<string>;
        getUserAssets: () => Promise<
          {
            id: string;
            name: string;
            fee: string;
            symbol: string;
            balance: string;
            decimals: number;
            hide: boolean;
            isTestToken: boolean;
            logo: string;
            standard: string;
          }[]
        >;
      };
      plug: {
        agent: HttpAgent;
        sessionManager: {
          sessionData: {
            accountId: string;
          };
        };
        getPrincipal: () => Promise<Principal>;
        deleteAgent: () => void;
        requestConnect: (options?: {
          whitelist?: string[];
          host?: string;
        }) => Promise<any>;
        createActor: (options: {}) => Promise<Actor>;
        isConnected: () => Promise<boolean>;
        disconnect: () => Promise<void>;
        createAgent: (args?: {
          whitelist: string[];
          host?: string;
        }) => Promise<undefined>;
        requestBalance: () => Promise<
          Array<{
            amount: number;
            canisterId: string | null;
            image: string;
            name: string;
            symbol: string;
            value: number | null;
          }>
        >;
        requestTransfer: (arg: {
          to: string;
          amount: number;
          opts?: {
            fee?: number;
            memo?: string;
            from_subaccount?: number;
            created_at_time?: {
              timestamp_nanos: number;
            };
          };
        }) => Promise<{ height: number }>;
      };
    };
  }
}
