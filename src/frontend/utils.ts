import { BACKEND_URL } from "./constants";

interface Data {
  discordId: string;
  guildId: string;
  principal: string;
  timestamp: Date;
}

export async function authorize(code) {
  // make a fetch request to the backend using the code
  if (code) {
    const response: Response = await fetch(
      BACKEND_URL + `/auth/discord/redirect/?code=${code}`,
      { credentials: "include" }, // this is needed so the browser will include the cookie send back in the response
    );
    console.log(response);
    // remove code from query string
    window.history.replaceState({}, "", window.location.pathname);
  }
}

export async function checkIfUserIsAuthorized(): Promise<boolean> {
  const response: Response = await fetch(BACKEND_URL + "/auth/status", {
    credentials: "include",
  });
  // store user_id in session storage
  if (response.ok) {
    const data: Data = await response.json();
    if (data.discordId) {
      sessionStorage.setItem("user_id", data.discordId);
    }
  }
  return response.status === 200;
}

export async function notifyServer(principal: string): Promise<Response> {
  // notify the server that we signed a message with the provided principal
  const response: Response = await fetch(
    BACKEND_URL + `/auth/glue/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        principal,
      }),
      credentials: "include",
    }, // this is needed so the browser will include the cookie send back in the response
  );
  // remove code from query string
  window.history.replaceState({}, "", window.location.pathname);
  return response;
}
