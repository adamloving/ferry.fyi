import { DateTime } from "luxon";
import { dbInit } from "./lib/db";
import {
  getSchedule,
  getTerminal,
  getTerminals,
  getVessel,
  getVessels,
  updateLong,
  updateShort,
} from "./lib/wsf";
import bodyParser from "koa-bodyparser";
import fs from "fs";
import Koa from "koa";
import logger from "heroku-logger";
import mount from "koa-mount";
import path from "path";
import requestLogger from "koa-logger";
import Router from "koa-router";
import serve from "koa-static";

// start main app
const app = new Koa();
app.use(requestLogger());

// api app
const api = new Koa();
api.use(bodyParser());
const router = new Router();
router.get("/vessels", async (context) => {
  context.body = await getVessels();
});
router.get("/vessels/:vesselId", async (context) => {
  const { vesselId } = context.params;
  // eslint-disable-next-line require-atomic-updates
  context.body = await getVessel(vesselId);
});
router.get("/terminals", async (context) => {
  context.body = await getTerminals();
});
router.get("/terminals/:terminalId", async (context) => {
  const { terminalId } = context.params;
  // eslint-disable-next-line require-atomic-updates
  context.body = await getTerminal(terminalId);
});
router.get("/schedule/:departingId/:arrivingId", async (context) => {
  const { departingId, arrivingId } = context.params;
  // eslint-disable-next-line require-atomic-updates
  context.body = {
    schedule: await getSchedule(departingId, arrivingId),
    timestamp: DateTime.local().toSeconds(),
  };
});
api.use(router.routes());
api.use(router.allowedMethods());
app.use(mount("/api", api));

// static files app
const dist = new Koa();
const clientDist = path.resolve(
  __dirname,
  "../",
  process.env.NODE_ENV === "development" ? "dist/" : "",
  "client/"
);
dist.use(serve(clientDist));
const browser = new Router();
browser.get(/.*/, (context) => {
  context.type = "html";
  context.body = fs.readFileSync(path.resolve(clientDist, "index.html"));
});
dist.use(browser.routes());
app.use(mount("/", dist));

// start server
(async () => {
  await dbInit;
  app.listen(process.env.PORT, () => logger.info("Server started"));
  await Promise.all([updateLong(), updateShort()]);
  setInterval(updateLong, 30 * 1000);
  setInterval(updateShort, 10 * 1000);
})();
