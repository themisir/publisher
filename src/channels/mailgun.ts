import {
  ChannelContext,
  MessageContext,
  MessagingChannel,
} from "../interfaces";
import { createClient } from "../vendor/mailgun-client";

export interface MailgunMessage {
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
}

export class MailgunChannel implements MessagingChannel<MailgunMessage, any> {
  private client: any;

  async send(ctx: MessageContext<MailgunMessage>): Promise<any> {
    return await this.client.messages.create(ctx.config.domain, {
      from: ctx.message.from || ctx.config.defaultFrom,
      ...ctx.message,
    });
  }

  async configure(ctx: ChannelContext): Promise<void> {
    this.client = createClient({ username: "api", ...ctx.config });
  }
}
