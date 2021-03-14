import Mailgun from "mailgun.js";
import {
  ChannelContext,
  MessageContext,
  MessagingChannel,
} from "../interfaces";

// tslint:disable-next-line:no-var-requires
const mailgun = new Mailgun(require("form-data"));

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
    this.client = mailgun.client({ username: "api", ...ctx.config });
  }
}
