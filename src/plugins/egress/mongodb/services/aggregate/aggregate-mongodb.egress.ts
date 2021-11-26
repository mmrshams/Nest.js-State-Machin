import {Injectable} from '@nestjs/common';
import {cloneDeep, get} from 'lodash';
import {ObjectId} from 'mongodb';
import {MongodbAggregateAction} from 'src/core/interfaces/egress-action.interface';
import {
  EgressPluginInputInterface,
  EgressPluginResultInterface,
} from 'src/core/interfaces/egress.interface';
import {MessageInterface} from 'src/core/interfaces/message.interface';

import {BaseMongodbEgress} from '../base/base-mongodb.egress';

const prepareQuery = ({
  query,
  message,
}: {
  query: Array<Record<string, unknown>>;
  message: MessageInterface;
}): Array<Record<string, unknown>> => {
  let filters: Record<string, unknown> = {};
  if (query.length === 0) return [];
  filters = query[0].$match as Record<string, unknown>;
  for (const filterKey of Object.keys(filters)) {
    const filterAddress = filters[filterKey];
    filters[filterKey] = get(message, filterAddress as string);
  }
  return query;
};

@Injectable()
export class MongodbAggregateEgress extends BaseMongodbEgress {
  async operate({
    message,
    action,
  }: EgressPluginInputInterface): Promise<EgressPluginResultInterface> {
    const mongoAction = action as MongodbAggregateAction;
    let query;
    if (mongoAction.queryAddress) {
      query = get(message, mongoAction.queryAddress);
    } else {
      query = prepareQuery({
        query: cloneDeep(mongoAction.query as Array<Record<string, unknown>>),
        message,
      });
    }

    if (query[0]['$match']['_id']) {
      query[0]['$match']['_id'] = new ObjectId(query[0]['$match']['_id']);
    }

    try {
      const db = mongoAction.db
        ? await this.mongoClient.db(mongoAction.db)
        : await this.mongoClient.db();

      const aggregatedData = await db
        .collection(mongoAction.collection)
        .aggregate(query as any)
        .toArray();
      return {
        data: aggregatedData,
      };
    } catch (error) {
      return {data: {}, error};
    }
  }
}
