import {Inject, Injectable} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {Messages} from 'src/common/enums/messages.enum';
import {Config} from 'src/common/interfaces/config.interface';
import {v4 as uuidv4} from 'uuid';
import {
  IngressPluginInputInterface,
  IngressPluginResultInterface,
} from 'src/core/interfaces/ingress.interface';
import {IngressPluginInterface} from 'src/plugins/interfaces/ingress-plugin.interface';
import {Consumer, Kafka} from 'kafkajs';
import {OnModuleDestroy} from '@nestjs/common';
import {KafkaConfig} from 'src/plugins/interfaces/kafka.message.interface';

@Injectable()
export class ListenKafkaIngress
  implements IngressPluginInterface, OnModuleDestroy {
  constructor(
    @Inject('VenomProxy')
    protected readonly clientProxy: ClientProxy,
    @Inject('Config')
    protected readonly config: Config
  ) {}

  private kafkaConfig: KafkaConfig = {
    clientId: this.config.KAFKA_CLIENT_ID,
    brokers: this.config.KAFKA_CONSUMER_BROKERS.split(','),
    maxRetryTime: this.config.KAFKA_MAX_RETRY_TIME,
    retry: {
      initialRetryTime: this.config.KAFKA_INITIATE_RETRY_TIME,
      retries: this.config.KAFKA_RETIRIES,
    },
  };

  private kafka!: Kafka;
  private consumers: Array<Consumer> = [];
  // private readonly consumerSuffix = '-' + Math.floor(Math.random() * 100000);

  async onModuleDestroy(): Promise<void> {
    this.disconnect();
  }

  async disconnect() {
    for (const consumer of this.consumers) {
      consumer.disconnect();
    }
  }

  async listen(
    message: IngressPluginInputInterface
  ): Promise<IngressPluginResultInterface> {
    const {flows} = message;
    this.kafka = new Kafka(this.kafkaConfig);
    const ArrayOfFlows = flows.filter(flow => {
      return flow.ingress && Object.keys(flow.ingress).indexOf('kafka') > -1;
    });
    for (const kafkaflow of ArrayOfFlows) {
      let groupId;
      if (kafkaflow.ingress) {
        groupId = kafkaflow.ingress?.kafka?.groupId;
      }
      const consumer = this.kafka.consumer({
        retry: {
          retries: this.config.KAFKA_CONSUMER_RETRIES,
          multiplier: this.config.KAFKA_CONSUMER_MULTIPLIER,
          factor: this.config.KAFKA_CONSUMER_FACTOR,
          maxRetryTime: this.config.KAFKA_CONSUMER_MAX_RETRY_TIME,
        },
        sessionTimeout: this.config.KAFKA_CONSUMER_SESSION_TIMEOUT,
        maxWaitTimeInMs: this.config.KAFKA_CONSUMER_MAX_WAIT_TIME_IN_MS,
        readUncommitted: this.config.KAFKA_CONSUMER_READ_UNCOMMITTED,
        groupId: groupId as string,
      });

      await consumer.connect();
      this.consumers.push(consumer);
      if (!kafkaflow.ingress?.kafka?.topic) return {};
      await consumer.subscribe({
        topic: kafkaflow?.ingress?.kafka.topic,
        fromBeginning: true,
      });
      await consumer.run({
        eachBatchAutoResolve: this.config
          .KAFKA_CONSUMER_EACH_BATCH_AUTO_RESOLVE,
        partitionsConsumedConcurrently: this.config
          .KAFKA_CONSUMER_PARTITIONS_CONSUMED_CONCURRENTLY,
        eachBatch: async ({batch, resolveOffset}) => {
          for (const message of batch.messages) {
            await this.clientProxy
              .send(Messages.START_MAIN_FLOW, {
                flowKey: kafkaflow?.key,
                contextId: uuidv4(),
                payload: message,
              })
              .toPromise();
            await resolveOffset(message.offset);
          }
        },
      });
    }
    return {};
  }
}
