# Bidding Bot Demo

Learn how to post a collection offer on OpenSea!

## Local development

### Setup node (optional)

```sh
nvm install
```

### Install dependencies

```sh
yarn
```

### Configure Environment Variables

These are the environment variables used in this bidding bot. Add them to `.env` in this directory and they'll get sourced automatically.

`WALLET_PRIVATE_KEY` - The private key of the wallet you want to use to make the offer. Set it according to the instructions 
in `yarn create-wallet`

`API_KEY` - Your OpenSea API key. Get one [here](https://docs.opensea.io/reference/request-an-api-key). This is only required for mainnet.

`NETWORK` - The network you want to use. Either `mainnet` or `testnets`. Use `testnets` for testing, and `mainnet` for real offers.

The following environment variables are network specific, and should be prefixed with `MAINNET_` or `TESTNETS_` depending on the network you're using.

`{network}_RPC_URL` - The RPC URL. You can get this by signing up with e.g. Alchemy.

`{network}_COLLECTION_SLUG` - The slug of the collection you want to make an offer on.

`{network}_ITEM_ASSET_CONTRACT_ADDRESS` - The asset contract address of the item you want to make an offer on.

`{network}_ITEM_TOKEN_IDENTIFIER` - The token identifier of the item you want to make an offer on.

### Create a Wallet

Follow the steps from the command below to create a new wallet and add the private key to a `.env` file in this directory.

```sh
yarn create-wallet
```

### Make an Offer

Adjust the values in `biddingBot.ts` to make an offer on a collection. Then run the following command to make the offer.

```sh
yarn bidding-bot
```

