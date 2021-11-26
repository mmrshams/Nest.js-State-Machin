export class KafkaPayload {
  public body: unknown;
  public messageId?: string;
  public messageType?: string;
  public topicName?: string;
  public createdTime?: string;

  create?(
    messageId: string,
    body: unknown,
    messageType: string,
    topicName: string
  ): KafkaPayload {
    return {
      messageId,
      body,
      messageType,
      topicName,
      createdTime: new Date().toISOString(),
    };
  }
}

export declare class KafkaConfig {
  clientId: string;
  brokers: string[];
  maxRetryTime?: number;
  retry?: Object;
}
