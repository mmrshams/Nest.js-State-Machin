import {DynamicModule, Module} from '@nestjs/common';
import {MongoClient} from 'mongodb';
import {Config} from 'src/common/interfaces/config.interface';

import {MongodbAggregateEgress} from './services/aggregate/aggregate-mongodb.egress';
import {MongodbInsertEgress} from './services/insert/insert-mongodb.egress';
import {MongodbUpsertEgress} from './services/upsert/upsert-mongodb.egress';

@Module({})
export class MongodbEgressPluginModule {
  static register(config: Config): DynamicModule {
    return {
      module: MongodbEgressPluginModule,
      providers: [
        {
          provide: 'MongodbClient',
          useFactory: async () => {
            if (!config.MONGODB_ENABLED) {
              return null;
            }
            const mongoClient = new MongoClient(config.MONGODB_URI, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
            });
            return await mongoClient.connect();
          },
        },
        {provide: 'Config', useValue: config},
        MongodbAggregateEgress,
        MongodbUpsertEgress,
        MongodbInsertEgress,
      ],
      exports: [
        MongodbAggregateEgress,
        MongodbUpsertEgress,
        MongodbInsertEgress,
      ],
    };
  }
}
