import path from "path";
import {
  ChannelContext,
  MessageContext,
  MessagingChannel,
} from "../interfaces";
import { TemplateRenderer } from "../template/template-renderer";
import { MailgunChannel } from "./mailgun";

export interface MailgunTemplateMessage {
  from: string;
  to: string[];
  subject: string;
  template: {
    name: string;
    data: any;
  };
}

export class MailgunTemplateChannel
  implements MessagingChannel<MailgunTemplateMessage, any> {
  private channel: MailgunChannel;
  private templateRenderer: TemplateRenderer;

  async send(ctx: MessageContext<MailgunTemplateMessage>): Promise<any> {
    const template = this.templateRenderer.find(ctx.message.template.name);
    if (!template) {
      throw new Error("Template is not exists");
    }

    if (!(await template.validate(ctx.message.template.data))) {
      throw new Error("Validation error");
    }

    const html = await template.render(ctx.message.template.data);
    return await this.channel.send({
      ...ctx,
      message: {
        from: ctx.message.from,
        to: ctx.message.to,
        subject: ctx.message.subject,
        html,
      },
    });
  }

  async configure(ctx: ChannelContext): Promise<void> {
    this.channel = new MailgunChannel();
    this.templateRenderer = new TemplateRenderer(
      path.join(process.env.APP_ROOT, ctx.config.templateRoot)
    );
    await this.templateRenderer.initialize();
    await this.channel.configure(ctx);
  }
}
