import {DynamicModule, Module} from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {Config} from 'src/common/interfaces/config.interface';
import {ListenKafkaIngress} from './services/send/listen-kafka.ingress';

@Module({})
export class KafkaIngressPluginModule {
  static register(config: Config): DynamicModule {
    return {
      module: KafkaIngressPluginModule,
      imports: [
        ClientsModule.register([
          {
            name: 'VenomProxy',
            transport: Transport.TCP,
            options: {
              host: config.PROVIDER_TCP_URI.split(':')[0],
              port: parseInt(config.PROVIDER_TCP_URI.split(':')[1]),
            },
          },
        ]),
      ],
      providers: [ListenKafkaIngress, {provide: 'Config', useValue: config}],
      exports: [ListenKafkaIngress],
    };
  }
}
