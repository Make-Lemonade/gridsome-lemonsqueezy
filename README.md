# @lemonsqueezy/gridsome-lemonsqueezy

> Lemon Squeezy plugin for Gridsome.

## Install

- `npm install @lemonsqueezy/gridsome-lemonsqueezy`
- `yarn add @lemonsqueezy/gridsome-lemonsqueezy`

## Usage

```js
module.exports = {
    plugins: [
        {
            use: '@lemonsqueezy/gridsome-lemonsqueezy',
            options: {
                apiKey: process.env.LSQ_API_KEY,
                storeId: process.env.LSQ_API_STORE_ID,
            }
        }
    ]
}
```

Create a `.env` file in the root of your Gridsome project and add `LSQ_API_KEY` and `LSQ_API_STORE_ID` variables.

### Options

#### apiKey

- Type: `string` *required*

Your Lemon Squeezy API key.

#### storeId

- Type: `string` *required*

The ID of your Lemon Squeezy store.

#### apiUrl

- Type: `string` *optional*
- Default: `'https://api.lemonsqueezy.com/v1/'`

The URL to the Lemon Squeezy API (useful for local testing).

#### insecure

- Type: `boolean` *optional*
- Default: `true`

If the HTTP client should verify SSL certificates (useful for local testing).
