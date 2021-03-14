import {
  ChannelContext,
  MessageContext,
  MessagingChannel,
} from "../interfaces";
import { Client as DiscordClient } from "discord.js";

export interface DiscordMessage {
  channelId?: string;
  content: string;
  color?: string;
  replyTo?: string;
}

export class DiscordChannel implements MessagingChannel<DiscordMessage> {
  private client: DiscordClient;

  async send(ctx: MessageContext<DiscordMessage>): Promise<any> {
    const channelId: string =
      ctx.message.channelId || ctx.config.defaultChannelId;
    const channel = this.client.channels.resolve(channelId);
    if (channel.isText()) {
      const message = {
        content: ctx.message.content,
        hexColor: ctx.message.color,
      };

      if (ctx.message.replyTo) {
        const resolvedMessage = await channel.messages.fetch(
          ctx.message.replyTo
        );
        if (!resolvedMessage) {
          throw Error("Failed to resolve message");
        }
        return await resolvedMessage.reply(message);
      } else {
        return await channel.send(message);
      }
    } else {
      throw Error("Channel is not a Text channel");
    }
  }

  async configure(ctx: ChannelContext): Promise<void> {
    this.client = new DiscordClient();
    this.client.login(ctx.config.token);
    this.client.on("ready", () => {
      this.client.user.setActivity("Chilling", {
        type: "CUSTOM_STATUS",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      });
    });
  }
}
