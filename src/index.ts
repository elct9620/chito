import "reflect-metadata";

import { Hono } from "hono";

import "@bot/telegram";
import { route as RegisterRoute } from "@controller/RegisterController";
import { route as RootRoute } from "@controller/RootController";
import { route as WebhookRoute } from "@controller/WebhookController";

const app = new Hono();

app.route("/", RootRoute);
app.route("/register", RegisterRoute);
app.route("/webhook", WebhookRoute);

export default app;
