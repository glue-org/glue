<img width="1225" alt="glue-logo-wide" src="https://user-images.githubusercontent.com/32162112/174629275-00deff63-7ff2-4f5e-9df9-40576b26c30f.png">

# development 👷‍♀️

## prerequisites

- `dfx 0.10.0`
- `node v18.0.2`
- `src/frontend/constants.ts` file with the following entries:

  - BACKEND_URL
    - provide the URL for both production and development backend
  - REDIRECT_URL
    - provide the URL to redirect users to log in to discord
      - make sure you have two different `client_id`s and `redirect_uri`s for production and development if you use different discord bots

## local deployment

- run `yarn install` to install all dependencies
- to start a local version of the replica and spin up the development server, run `yarn dev`.

## deploying to mainnet

- run `dfx deploy --network ic` to deploy the frontend and backend canisters to the mainnet
  > :warning: **when deploying to mainnet**: make sure you delete the `canister_ids.json` file before deploying to mainnet!
