import {DynamicModule, Module} from '@nestjs/common';
import {Config} from 'src/common/interfaces/config.interface';
import {KafkaEgressPluginModule} from './egress/kafka/kafka-egress-plugin.module';
import {KafkaIngressPluginModule} from './ingress/kafka/kafka-ingress-plugin.module';
import {HTTPEgressPluginModule} from './egress/http/http-egress-plugin.module';

import {MongodbEgressPluginModule} from './egress/mongodb/mongodb-egress-plugin.module';
import {NoOperationEgressPluginModule} from './egress/no-operation/no-operator-egress-plugin.module';
import {GrpcIngressPluginModule} from './ingress/grpc/grpc-ingress-plugin.module';
import {ZIIFNormalizerPluginModule} from './normalizer/ziif/ziif.module';

@Module({})
export class PluginsModule {
  static register(config: Config): DynamicModule {
    const modules = [
      HTTPEgressPluginModule.register(config),
      NoOperationEgressPluginModule.register(config),
      KafkaEgressPluginModule.register(config),
      ZIIFNormalizerPluginModule.register(config),
      GrpcIngressPluginModule.register(config),
      MongodbEgressPluginModule.register(config),
    ];
    // TODO: make a decision on enable/disable strategy
    if (config.KAFKA_CONSUMER_ENABLED) {
      modules.push(KafkaIngressPluginModule.register(config));
    }

    return {
      module: PluginsModule,
      imports: modules,
      exports: modules,
    };
  }
}
