import fs from "fs/promises";
import path from "path";
import {
  FirebaseCloudMessagingChannel,
  MailgunChannel,
  MailgunTemplateChannel,
} from "./channels";
import { MessagingChannel } from "./interfaces";

const channelTypes: { [name: string]: any } = {
  fcm: FirebaseCloudMessagingChannel,
  mailgun: MailgunChannel,
  "mailgun-template": MailgunTemplateChannel,
};

export const channels: {
  [name: string]: {
    instance: MessagingChannel;
    config: any;
    name: string;
  };
} = {};

export async function configureChannels() {
  const config = await readConfig();

  for (const channelName of Object.keys(config.channels)) {
    const channelConfig = config.channels[channelName];
    const channelType = channelTypes[channelConfig.type];

    if (channelType) {
      const channel: MessagingChannel = new channelType();
      await channel.configure({
        name: channelName,
        config: channelConfig.config,
      });
      channels[channelName] = {
        instance: channel,
        config: channelConfig.config,
        name: channelName,
      };
    }
  }
}

interface Config {
  channels: {
    [name: string]: {
      type: string;
      config: any;
    };
  };
}

async function readConfig(): Promise<Config> {
  const configPath = path.join(
    path.dirname(process.env.APP_ROOT),
    "channels.json"
  );
  const configContents = await fs.readFile(configPath, "utf-8");
  return JSON.parse(configContents);
}
