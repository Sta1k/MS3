interface IStrategy {
  transform(el: MessageParsed): Promise<MessageParsed | void>;
}

interface ICode {
  // tslint:disable-next-line
  [key: string]: any;
}

interface IProvider {
  transform(el: MessageParsed): void;
}
