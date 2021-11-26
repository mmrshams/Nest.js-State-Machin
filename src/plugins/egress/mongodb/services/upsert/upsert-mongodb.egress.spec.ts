import {Test} from '@nestjs/testing';
import {FilterQuery, UpdateOneOptions, UpdateQuery} from 'mongodb';
import {Config} from 'src/common/interfaces/config.interface';
import {MongodbUpsertAction} from 'src/core/interfaces/egress-action.interface';
import {EgressPluginInputInterface} from 'src/core/interfaces/egress.interface';

import {MongodbUpsertEgress} from './upsert-mongodb.egress';

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
          findOneAndUpdate: (
            filter: FilterQuery<Record<string, unknown>>,
            update:
              | UpdateQuery<Record<string, unknown>>
              | Partial<Record<string, unknown>>,
            options?: UpdateOneOptions
          ) => {
            if (dbName === 'error') {
              throw new Error();
            }
            return {};
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

describe('MongodbUpsertEgress', () => {
  let mongodbUpsertEgress: MongodbUpsertEgress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [MongodbUpsertEgress, configFactory, mongodbClientMock],
    }).compile();
    mongodbUpsertEgress = moduleRef.get<MongodbUpsertEgress>(
      MongodbUpsertEgress
    );
  });

  it('should to be defined', () => {
    expect(mongodbUpsertEgress).toBeDefined();
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
          payload: {},
          flowKey: 'test',
        },
      };
      const {data, error} = await mongodbUpsertEgress.operate(message);
      expect(data).toEqual({});
      expect(error).toBeDefined();
    });

    it('should return array of items', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          collection: 'test',
          query: {},
        } as MongodbUpsertAction,
        message: {
          flowKey: 'test',
          payload: {},
        },
      };
      const {data, error} = await mongodbUpsertEgress.operate(message);
      expect(data).toEqual({});
      expect(error).toBeUndefined();
    });
  });
});
