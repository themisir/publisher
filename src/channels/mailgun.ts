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
    const data: any = {
      from: ctx.message.from || ctx.config.defaultFrom,
      to: ctx.message.to,
      subject: ctx.message.subject,
      text: ctx.message.text,
      html: ctx.message.html,
    };
    for (const key in data) {
      if (key in data && !Boolean(data[key])) {
        delete data[key];
      }
    }
    return await this.client.messages.create(ctx.config.domain, data);
  }

  async configure(ctx: ChannelContext): Promise<void> {
    this.client = createClient({ username: "api", ...ctx.config });
  }
}
