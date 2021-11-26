import {Logger} from '@nestjs/common';
import {DynamicModule, Module} from '@nestjs/common';
import {
  ClientsModule,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import {CommonModule} from 'src/common/common.module';
import {Config} from 'src/common/interfaces/config.interface';
import {
  DynamicModuleInterface,
  MicroserviceModule,
} from 'src/common/interfaces/module.interface';
import {NoOperationEgress} from 'src/plugins/egress/no-operation/services/no-operation.egress';
import {PluginsModule} from 'src/plugins/plugins.module';

import {CoreController} from './core.controller';
import {EgressService} from './services/egress/egress.service';
import {HarvesterService} from './services/harvester/harvester.service';
import {IngressService} from './services/ingress/ingress.service';
import {LoaderService} from './services/loader/loader.service';
import {NormalizerService} from './services/normalizer/normalizer.service';
import {RelayService} from './services/relay/relay.service';
import {TransformerService} from './services/transformer/transformer.service';

const loaderFactory = {
  provide: LoaderService,
  inject: [Config],
  useFactory: async (config: Config) => {
    const loaderService = new LoaderService(config);
    await loaderService.loadFlows();
    return loaderService;
  },
};

const controllers: Array<unknown> = [CoreController];
const services: Array<unknown> = [
  NormalizerService,
  NoOperationEgress,
  HarvesterService,
  TransformerService,
  EgressService,
  RelayService,
  IngressService,
  loaderFactory,
];

@Module({})
export class CoreModule extends MicroserviceModule {
  static register(config: Config): DynamicModuleInterface {
    const microserviceOptions: Array<MicroserviceOptions> = [];
    if (config.PROVIDER_TCP_ENABLED) {
      microserviceOptions.push({
        transport: Transport.TCP,
        options: {
          host: config.PROVIDER_TCP_URI.split(':')[0],
          port: parseInt(config.PROVIDER_TCP_URI.split(':')[1]),
        },
      });
    }
    return {
      moduleInstance: {
        module: CoreModule,
        imports: [
          CommonModule.register(),
          ClientsModule.register([
            {
              name: 'ProviderServiceProxy',
              transport: Transport.TCP,
              options: {
                host: config.PROVIDER_TCP_URI.split(':')[0],
                port: parseInt(config.PROVIDER_TCP_URI.split(':')[1]),
              },
            },
          ]),
          PluginsModule.register(config),
        ],
        providers: [...services],
        controllers,
      } as DynamicModule,
      options: microserviceOptions,
    };
  }
}
