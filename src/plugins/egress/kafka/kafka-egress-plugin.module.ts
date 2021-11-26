import {DynamicModule, Module} from '@nestjs/common';
import {Config} from 'src/common/interfaces/config.interface';
import {SendKafkaEgress} from './services/send/send-kafka.egress';

@Module({})
export class KafkaEgressPluginModule {
  static register(config: Config): DynamicModule {
    return {
      module: KafkaEgressPluginModule,
      providers: [
        {
          provide: 'SendKafkaEgress',
          useFactory: async () => {
            if (!config.KAFKA_PRODUCER_ENABLED) {
              return null;
            }
            return new SendKafkaEgress(config);
          },
        },
        {provide: 'Config', useValue: config},
      ],
      exports: [SendKafkaEgress],
    };
  }
}
