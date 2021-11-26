import {Test} from '@nestjs/testing';
import {UpdateOneOptions, UpdateQuery} from 'mongodb';
import {Config} from 'src/common/interfaces/config.interface';
import {MongodbUpsertAction} from 'src/core/interfaces/egress-action.interface';
import {EgressPluginInputInterface} from 'src/core/interfaces/egress.interface';

import {MongodbInsertEgress} from './insert-mongodb.egress';

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
          insertOne: (
            data:
              | UpdateQuery<Record<string, unknown>>
              | Partial<Record<string, unknown>>,
            options?: UpdateOneOptions
          ) => {
            if (dbName === 'error') {
              throw new Error();
            }
            return 'updated';
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

describe('MongodbInsertEgress', () => {
  let mongodbInsertEgress: MongodbInsertEgress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [MongodbInsertEgress, configFactory, mongodbClientMock],
    }).compile();
    mongodbInsertEgress = moduleRef.get<MongodbInsertEgress>(
      MongodbInsertEgress
    );
  });

  it('should to be defined', () => {
    expect(mongodbInsertEgress).toBeDefined();
  });

  describe('operate', () => {
    it('should throw error with error db', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          db: 'error',
          collection: 'test',
          query: {},
        } as MongodbUpsertAction,
        message: {
          flowKey: 'flow-key',
          payload: {},
        },
      };
      const {data, error} = await mongodbInsertEgress.operate(message);
      expect(data).toEqual({});
      expect(error).toBeDefined();
    });
  });
});
