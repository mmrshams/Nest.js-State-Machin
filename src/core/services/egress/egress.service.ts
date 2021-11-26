import {Injectable} from '@nestjs/common';
import {
  HTTPAction,
  MongodbAggregateAction,
  MongodbInsertAction,
  MongodbUpsertAction,
  KafkaAction,
} from 'src/core/interfaces/egress-action.interface';
import {SendKafkaEgress} from 'src/plugins/egress/kafka/services/send/send-kafka.egress';
import {MongodbAggregateEgress} from 'src/plugins/egress/mongodb/services/aggregate/aggregate-mongodb.egress';
import {MongodbInsertEgress} from 'src/plugins/egress/mongodb/services/insert/insert-mongodb.egress';
import {MongodbUpsertEgress} from 'src/plugins/egress/mongodb/services/upsert/upsert-mongodb.egress';
import {NoOperationEgress} from 'src/plugins/egress/no-operation/services/no-operation.egress';
import {EgressPluginInterface} from 'src/plugins/interfaces/egress-plugin.interface';

import {LoaderService} from '../loader/loader.service';
import {MessageInterface} from 'src/core/interfaces/message.interface';
import {EgressPluginResultInterface} from 'src/core/interfaces/egress.interface';
import {HTTPEgress} from 'src/plugins/egress/http/services/http.egress';

@Injectable()
export class EgressService {
  private readonly egresses: Record<string, unknown> = {};

  constructor(
    private readonly loaderService: LoaderService,
    sendKafkaMessage: SendKafkaEgress,
    noOperationEgress: NoOperationEgress,
    mongodbUpsertEgress: MongodbUpsertEgress,
    mongodbInsertEgress: MongodbInsertEgress,
    mongodbAggregateEgress: MongodbAggregateEgress,
    httpEgress: HTTPEgress
  ) {
    this.egresses = {
      mongodb: {
        insert: mongodbInsertEgress,
        upsert: mongodbUpsertEgress,
        aggregate: mongodbAggregateEgress,
      },
      kafka: {
        produce: sendKafkaMessage,
      },
      noop: noOperationEgress,
      http: httpEgress,
      kafka_send_message: sendKafkaMessage,
    };
  }

  async operate(
    message: MessageInterface
  ): Promise<EgressPluginResultInterface> {
    const {flowKey} = message;
    const flow = this.loaderService.getFlow(flowKey);
    if (!flow.egress) return {data: {}};
    for (const [egress, egressActions] of Object.entries(flow.egress)) {
      if (egress === 'http') {
        const result = await (this.egresses[egress] as HTTPEgress).operate({
          message,
          action: egressActions,
        });

        if (result.error && flow.propagateError) {
          const error = result.error;
          error.name = 'EGRESS_ERROR';
          throw error;
        }
        return result;
      }

      for (const [egressAction, action] of Object.entries<
        | MongodbInsertAction
        | MongodbUpsertAction
        | MongodbAggregateAction
        | KafkaAction
      >(egressActions)) {
        const result = await (this.egresses[egress] as Record<
          string,
          EgressPluginInterface
        >)[egressAction].operate({message, action});

        if (result.error && flow.propagateError) {
          const error = result.error;
          error.name = 'EGRESS_ERROR';
          throw error;
        }
        return result;
      }
    }
    throw Error('Invalid egress config key !');
  }
}
