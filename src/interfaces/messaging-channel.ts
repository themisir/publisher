export interface ChannelContext {
  name: string;
  config: any;
}

export interface MessageContext<T> extends ChannelContext {
  message: T;
}

export interface MessagingChannel<Message = any, Result = any> {
  send(ctx: MessageContext<Message>): Promise<Result>;
  configure(ctx: ChannelContext): Promise<void>;
}
