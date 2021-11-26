import {DynamicModule, Module} from '@nestjs/common';
import {Config} from 'src/common/interfaces/config.interface';

import {NoOperationEgress} from './services/no-operation.egress';

@Module({})
export class NoOperationEgressPluginModule {
  static register(config: Config): DynamicModule {
    return {
      module: NoOperationEgressPluginModule,
      providers: [NoOperationEgress],
      exports: [NoOperationEgress],
    };
  }
}
