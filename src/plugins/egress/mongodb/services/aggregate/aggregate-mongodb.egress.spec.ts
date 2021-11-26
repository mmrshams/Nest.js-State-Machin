import {Test} from '@nestjs/testing';
import {Config} from 'src/common/interfaces/config.interface';
import {MongodbAggregateAction} from 'src/core/interfaces/egress-action.interface';
import {EgressPluginInputInterface} from 'src/core/interfaces/egress.interface';

import {MongodbAggregateEgress} from './aggregate-mongodb.egress';

const configFactory = {
  provide: 'Config',
  useFactory: async () => {
    const config = new Config({
      FLOWS_PATH: 'src/flows',
      PWD: process.env['PWD'],
    });
    return config;
  },
};

class MongodbClientMock {
  db(dbName?: string) {
    return {
      collection: (name: string) => {
        return {
          aggregate: (pipeline?: object[]) => {
            return {
              toArray: () => {
                if (dbName === 'error') throw Error();
                return ['item1', 'item2'];
              },
            };
          },
        };
      },
    };
  }
}

const mongodbClientMock = {
  provide: 'MongodbClient',
  useClass: MongodbClientMock,
};

describe('MongodbAggregateOperator', () => {
  let mongodbAggregateOperator: MongodbAggregateEgress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [MongodbAggregateEgress, configFactory, mongodbClientMock],
    }).compile();
    mongodbAggregateOperator = moduleRef.get<MongodbAggregateEgress>(
      MongodbAggregateEgress
    );
  });

  it('should to be defined', () => {
    expect(mongodbAggregateOperator).toBeDefined();
  });

  describe('operate', () => {
    it('should throw error with error db', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          db: 'error',
          collection: 'test',
          query: [
            {
              $match: {},
            },
          ],
        } as MongodbAggregateAction,
        message: {
          payload: {},
          flowKey: 'test',
        },
      };
      const {data, error} = await mongodbAggregateOperator.operate(message);
      expect(data).toEqual({});
      expect(error).toBeDefined();
    });

    it('should return array of items', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          collection: 'test',
          query: [
            {
              $match: {},
            },
          ],
        } as MongodbAggregateAction,
        message: {
          flowKey: 'test',
          payload: {},
        },
      };
      const {data, error} = await mongodbAggregateOperator.operate(message);
      expect(data).toEqual(['item1', 'item2']);
      expect(error).toBeUndefined();
    });
  });
});
