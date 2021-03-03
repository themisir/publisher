import dotenv from "dotenv";
import express from "express";
import path from "path";
import { configureChannels } from "./channel-hub";
import queueRouter from "./controllers/queue-controller";

dotenv.config();

const port = process.env.SERVER_PORT;

const app = express();

process.env.APP_ROOT = __dirname;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/render/:template", (req, res) => {
  res.render(req.params.template, req.body);
});

app.use("/queue", queueRouter);

configureChannels();

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
