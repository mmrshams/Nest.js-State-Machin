import {DynamicModule, Module} from '@nestjs/common';
import Axios from 'axios';
import {CommonModule} from 'src/common/common.module';
import {Config} from 'src/common/interfaces/config.interface';
import {HTTPEgress} from './services/http.egress';

@Module({})
export class HTTPEgressPluginModule {
  static register(config: Config): DynamicModule {
    return {
      imports: [CommonModule.register()],
      module: HTTPEgressPluginModule,
      providers: [
        HTTPEgress,
        {provide: 'Config', useValue: config},
        {provide: 'Axios', useValue: Axios.create()},
      ],
      exports: [HTTPEgress],
    };
  }
}
