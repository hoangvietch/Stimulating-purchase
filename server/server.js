import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import mongoose from "mongoose";
import { dbConnection } from "./databases";
import winston from "winston";
import * as C from "./controllers";

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "./logs/combined.log" }),
  ],
});
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(async () => {
  mongoose.connect(dbConnection.url, dbConnection.options, () => {
    logger.info("Connected DB successfully !");
  });
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        const dataStore = {
          name: shop,
          accessToken: accessToken,
          scope: scope,
          active: true,
        };
        const store = await C.storeController.findStoreByName(shop);
        if (!!store) {
          await C.storeController.updateStatusStoreById(store._id, true);
        } else {
          await C.storeController.createStore(dataStore);
        }
        const host = ctx.query.host;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        const response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) => {
            await C.storeController.updateStatusStoreByName(shop, false);
          },
        });

        if (!response.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${response.result}`
          );
        }

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}&host=${host}`);
      },
    })
  );

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router
    .get("/", async (ctx) => {
      const shop = ctx.query.shop;
      if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
        ctx.redirect(`/auth?shop=${shop}`);
      } else {
        await handleRequest(ctx);
      }
    })
    .post("/webhooks", async (ctx) => {
      try {
        await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
        console.log(`Webhook processed, returned status code 200`);
      } catch (error) {
        console.log(`Failed to process webhook: ${error}`);
      }
    })
    .get("(/_next/static/.*)", handleRequest)
    .get("/_next/webpack-hmr", handleRequest)
    .get("/test", (ctx, next) => (ctx.body = "OK"))
    .get("(.*)", verifyRequest(), handleRequest);

  server.use(router.allowedMethods()).use(router.routes());
  server.listen(port, () => {
    logger.info(`=================================`);
    logger.info(`======= ENV: ${process.env.NODE_ENV} =======`);
    logger.info(`🚀 App listening on the port ${port}`);
    logger.info(`=================================`);
  });
});
