import dotenv from "dotenv";
import express from "express";
import path from "path";
import { configureChannels } from "./channel-hub";
import createQueueRouter from "./controllers/queue-controller";
import { TemplateRenderer } from "./template/template-renderer";

dotenv.config();

const port = process.env.SERVER_PORT;

const app = express();

process.env.APP_ROOT = __dirname;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const renderer = new TemplateRenderer(app.get("views"));

renderer.initialize();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/queue", createQueueRouter());
app.post("/render/:template*", async (req, res) => {
  const template = renderer.find(req.params.template);
  const result = await template.render(req.body);
  res.status(200).contentType("html").send(result);
});

configureChannels();

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
