import express from "express";
import { router } from "./routes/v1";
import client from "@repo/db/client";
// If you see "Cannot find module '@repo/db'", make sure:
// 1. The @repo/db package exists in your turborepo (e.g., in /packages/db).
// 2. The package.json in @repo/db has a "name": "@repo/db" field.
// 3. You have run `pnpm install` or `yarn install` at the root.
// 4. Your tsconfig.json has "baseUrl" and "paths" set up if needed.
// 5. The build output of @repo/db exists (run `pnpm build` or `yarn build` in the package).
// Uncomment the import below after verifying the above steps.
// import client from "@repo/db";

const app = express();

app.use("/api/v1", router);

app.listen(process.env.PORT || 3000);