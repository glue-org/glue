export const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://iccc.global"
    : "http://localhost:8081";
export const REDIRECT_URL =
  process.env.NODE_ENV === "production"
    ? "https://discord.com/api/oauth2/authorize?client_id=974260670675697714&redirect_uri=https%3A%2F%2Fr53d5-wyaaa-aaaae-qacxa-cai.ic0.app&response_type=code&scope=identify"
    : "https://discord.com/api/oauth2/authorize?client_id=996793569065050132&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code&scope=identify";

console.log(BACKEND_URL, REDIRECT_URL);
