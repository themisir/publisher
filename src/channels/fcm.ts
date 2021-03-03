import {
  ChannelContext,
  MessageContext,
  MessagingChannel,
} from "../interfaces";
import * as admin from "firebase-admin";

interface FcmMessage {
  tokens: string[];
  payload: admin.messaging.MessagingPayload;
}

export class FirebaseCloudMessagingChannel
  implements
    MessagingChannel<FcmMessage, admin.messaging.MessagingDevicesResponse> {
  private app: admin.app.App;

  async send(
    ctx: MessageContext<FcmMessage>
  ): Promise<admin.messaging.MessagingDevicesResponse> {
    return await this.app
      .messaging()
      .sendToDevice(ctx.message.tokens, ctx.message.payload);
  }

  async configure(ctx: ChannelContext): Promise<void> {
    this.app = admin.initializeApp({
      credential: admin.credential.cert(ctx.config.credential.cert),
    });
  }
}
