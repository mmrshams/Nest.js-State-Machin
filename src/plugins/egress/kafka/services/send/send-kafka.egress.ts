import {Inject, Injectable} from '@nestjs/common';
import {Config} from 'src/common/interfaces/config.interface';
import {Kafka, Producer, ProducerRecord} from 'kafkajs';
import {KafkaConfig} from 'src/plugins/interfaces/kafka.message.interface';
import {EgressPluginInterface} from 'src/plugins/interfaces/egress-plugin.interface';
import {
  EgressPluginInputInterface,
  EgressPluginResultInterface,
} from 'src/core/interfaces/egress.interface';
import {KafkaProduceAction} from 'src/core/interfaces/egress-action.interface';
import {get} from 'lodash';

@Injectable()
export class SendKafkaEgress implements EgressPluginInterface {
  constructor(
    @Inject('Config')
    protected readonly config: Config
  ) {}

  private kafka!: Kafka;
  private producer?: Producer;

  private kafkaConfig: KafkaConfig = {
    clientId: `${this.config.KAFKA_CLIENT_ID}_${process.env.HOSTNAME}`,
    brokers: this.config.KAFKA_PRODUCER_BROKERS.split(','),
  };

  async sendKafkaMessage(record: ProducerRecord) {
    const metadata = await this.producer!.send(record);
    // .catch(e => console.error(e.message, e));
    return metadata;
  }

  async operate({
    action,
    message,
  }: EgressPluginInputInterface): Promise<EgressPluginResultInterface> {
    if (!this.kafka) this.kafka = new Kafka(this.kafkaConfig);
    if (!this.producer) {
      try {
        this.producer = this.kafka.producer({
          retry: {
            maxRetryTime: this.config.KAFKA_PRODUCER_MAX_RETRY_TIME,
            initialRetryTime: this.config.KAFKA_PRODUCER_INITIATE_RETRY_TIME,
            factor: this.config.KAFKA_PRODUCER_FACTOR,
            multiplier: this.config.KAFKA_PRODUCER_MULTIPLIER,
            retries: this.config.KAFKA_PRODUCER_RETRIES,
          },
        });
        await this.producer.connect();
      } catch (err) {
        this.producer = undefined;
        return {error: err, data: {}};
      }
    }

    try {
      const {topic, key} = action as KafkaProduceAction;
      const kafkaMessage = get(message, key);

      (kafkaMessage as any[]).forEach(message => {
        if (message.value && message.value.type === 'Buffer') {
          message.value = Buffer.from(message.value.data);
        }
      });

      const meta = await this.sendKafkaMessage({
        topic,
        messages: kafkaMessage,
      });
      return {data: (meta as unknown) as Record<string, unknown>};
    } catch (err) {
      if (err.name === 'KafkaJSConnectionError') this.producer = undefined;
      return {error: err, data: {}};
    }
  }
}
