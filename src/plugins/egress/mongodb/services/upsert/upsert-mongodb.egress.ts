import {Injectable} from '@nestjs/common';
import {get} from 'lodash';
import {ObjectId} from 'mongodb';
import {MongodbUpsertAction} from 'src/core/interfaces/egress-action.interface';
import {
  EgressPluginInputInterface,
  EgressPluginResultInterface,
} from 'src/core/interfaces/egress.interface';

import {BaseMongodbEgress} from '../base/base-mongodb.egress';

@Injectable()
export class MongodbUpsertEgress extends BaseMongodbEgress {
  async operate({
    message,
    action,
  }: EgressPluginInputInterface): Promise<EgressPluginResultInterface> {
    const mongoAction = action as MongodbUpsertAction;
    try {
      let queryConditions;
      if (mongoAction.queryAddress) {
        queryConditions = get(message, mongoAction.queryAddress);
      } else {
        const referenceKey = get(
          message,
          mongoAction.query.reference_id as string
        );
        queryConditions = {reference_id: referenceKey};
      }

      if (queryConditions['_id']) {
        queryConditions['_id'] = new ObjectId(queryConditions['_id']);
      }

      const db = mongoAction.db
        ? await this.mongoClient.db(mongoAction.db)
        : await this.mongoClient.db();

      const data = await db.collection(mongoAction.collection).findOneAndUpdate(
        queryConditions,
        {
          $set: mongoAction.valueKey
            ? get(message, mongoAction.valueKey)
            : {...mongoAction.value},
          $inc: {version: 1},
        },

        {
          upsert: mongoAction.upsertMode ? mongoAction.upsertMode : false,
          returnOriginal: false,
        }
      );
      return {
        meta: {
          isExists: data?.lastErrorObject?.updatedExisting,
        },
        data: {
          ...data.value,
        },
      };
    } catch (error) {
      return {data: {}, error};
    }
  }
}
