import {Injectable} from '@nestjs/common';
import {get} from 'lodash';
import {MongodbInsertAction} from 'src/core/interfaces/egress-action.interface';
import {
  EgressPluginInputInterface,
  EgressPluginResultInterface,
} from 'src/core/interfaces/egress.interface';

import {BaseMongodbEgress} from '../base/base-mongodb.egress';

@Injectable()
export class MongodbInsertEgress extends BaseMongodbEgress {
  async operate({
    message,
    action,
  }: EgressPluginInputInterface): Promise<EgressPluginResultInterface> {
    const mongoAction = action as MongodbInsertAction;
    try {
      const targetData = get(message, mongoAction.valueKey as string);
      if (!targetData)
        throw Error(`Key ${mongoAction.valueKey}not exist on the message`);
      const db = mongoAction.db
        ? await this.mongoClient.db(mongoAction.db)
        : await this.mongoClient.db();
      const mongoData = mongoAction.valueKey
        ? get(message, mongoAction.valueKey as string)
        : {...mongoAction.value};
      const data = await db
        .collection(mongoAction.collection)
        .insertOne(mongoData);
      return {
        data: data.ops[0],
      };
    } catch (error) {
      return {data: {}, error};
    }
  }
}
