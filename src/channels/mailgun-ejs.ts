import {
  ChannelContext,
  MessageContext,
  MessagingChannel,
} from "../interfaces";
import path from "path";
import fs from "fs/promises";
import { MailgunChannel } from "./mailgun";
import ejs from "ejs";

export interface MailgunEjsMessage {
  from: string;
  to: string[];
  subject: string;
  template: {
    name: string;
    data: any;
  };
}

export class MailgunEjsChannel
  implements MessagingChannel<MailgunEjsMessage, any> {
  private channel: MailgunChannel;
  private rootDir: string;

  async send(ctx: MessageContext<MailgunEjsMessage>): Promise<any> {
    const name = path.join(this.rootDir, `${ctx.message.template.name}.ejs`);
    const template = await fs.readFile(name, "utf-8");
    const html = await ejs.render(template, ctx.message.template.data, {
      async: true,
      root: this.rootDir,
    });

    return await this.channel.send({
      ...ctx,
      message: {
        ...ctx.message,
        html,
      },
    });
  }

  async configure(ctx: ChannelContext): Promise<void> {
    this.channel = new MailgunChannel();
    this.rootDir = path.join(process.env.APP_ROOT, ctx.config.templateRoot);
    await this.channel.configure(ctx);
  }
}
