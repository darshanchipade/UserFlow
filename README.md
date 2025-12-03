This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Spring Boot data pipeline integration

The ingestion UI is wired to the Spring Boot backend from [darshanchipade/springboot-SQS-Impl](https://github.com/darshanchipade/springboot-SQS-Impl). Configure the base URL once the backend is running:

```bash
# .env.local
SPRINGBOOT_BASE_URL=http://localhost:8080
```

| UI option           | Next.js route                   | Spring Boot endpoint                                      | Notes |
| ------------------- | --------------------------------| --------------------------------------------------------- | ----- |
| Local file upload   | `POST /api/ingestion/upload`    | `POST /api/extract-cleanse-enrich-and-store`              | Sends multipart form data with the uploaded file. |
| S3 / classpath URI  | `POST /api/ingestion/source`    | `GET /api/extract-cleanse-enrich-and-store?sourceUri=...` | Provide `s3://` or `classpath:` URIs; Next.js normalizes query params. |
| API JSON payload    | `POST /api/ingestion/payload`   | `POST /api/ingest-json-payload`                           | Wrap your JSON inside `{ "payload": <yourObject> }`. |
| Status polling      | `GET /api/ingestion/status?id=` | `GET /api/cleansed-data-status/{id}`                      | Returns the current cleansing/enrichment status string. |

Each Next.js route proxies requests to the backend, surfaces the raw response body, and attempts to extract `cleansedDataStoreId` + status markers so you can trigger follow-up status checks from the UI.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
