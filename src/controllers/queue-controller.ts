import { Router } from "express";
import { channels } from "../channel-hub";
import { v4 as uuid } from "uuid";

const router = Router();
const messages: {
  [key: string]: {
    id: string;
    status: "queued" | "done" | "failed";
    result?: any;
    error?: any;
  };
} = {};

router.post("/:channel/messages", async (req, res) => {
  const id = uuid();
  const channel = channels[req.params.channel];
  const awaitResult = req.query.await;

  if (!channel) {
    res.status(404).json({ message: "Channel is not exists" });
    return;
  }

  const payload = {
    name: channel.name,
    config: channel.config,
    message: req.body,
  };

  messages[id] = {
    id,
    status: "queued",
  };

  channel.instance
    .send(payload)
    .then(
      (result) =>
        (messages[id] = {
          id,
          status: "done",
          result,
        })
    )
    .catch(
      (error) =>
        (messages[id] = {
          id,
          status: "failed",
          error,
        })
    )
    .finally(() => {
      if (awaitResult) {
        res.status(200).json(messages[id]);
      }
    });

  if (!awaitResult) {
    res.status(201).json({ id });
  }
});

router.get("/messages/:id", (req, res) => {
  const id = req.query.id?.toString();

  if (!id || id! in messages) {
    res.status(404).json({ message: "Entry is not exists" });
    return;
  }

  res.status(200).json(messages[id]);
});

export default router;
