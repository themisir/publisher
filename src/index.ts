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
app.get("/render/:template(*)", async (req, res) => {
  try {
    const template = renderer.find(req.params.template);
    const result = await template.render(template.exampleData);
    res.status(200).contentType("html").send(result);
  } catch (error) {
    res.status(500).contentType("text/plain").send(error.toString());
  }
});

app.get("/templates", (req, res) => {
  res.json(
    Object.values(renderer.templates).map((t) => ({
      name: t.name,
      example: t.exampleData,
    }))
  );
});

configureChannels();

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
