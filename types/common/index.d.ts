type HashMap<T> = { [key: string]: T }

type Reconnecting = {
  mongo: number;
  amqp: number;
};

type Result<T> = 
    | { ok: true, value: T }
    | { ok: false, message: string }
