This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Integration of CleverTap Web SDK

This project illustrates how to import the `clevertap-web-sdk` on a nextJS app.

Since the module is designed for [client-side only](https://github.com/CleverTap/clevertap-web-sdk/issues/39#issuecomment-983328291), for nextJS apps, one can't straightforwardly import the sdk like: 

```
import clevertap from 'clevertap-web-sdk'
```

due to the library expecting for window object to be defined. See [#52](https://github.com/CleverTap/clevertap-web-sdk/issues/52)

Aside from a [workaround](https://github.com/CleverTap/clevertap-web-sdk/issues/39), one can *_asyncly import_* it when the component mounts or just before an event push:

```js
async function initializeClevertap(): Promise<CleverTap> {
  const clevertap = await import('clevertap-web-sdk')

  // clevertap.default.init(ACCOUNT_ID, TARGET_DOMAIN)
  // clevertap.privacy.push({ optOut: false })
  // clevertap.privacy.push({ useIP: false })
  clevertap.default.setLogLevel(3)

  return clevertap.default
}
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
