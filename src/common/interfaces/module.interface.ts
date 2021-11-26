import {DynamicModule} from '@nestjs/common';
import {MicroserviceOptions} from '@nestjs/microservices';

export interface ServiceOptions {
  uri: string;
}

export interface DynamicModuleInterface {
  moduleInstance: DynamicModule;
  options: Array<MicroserviceOptions> | ServiceOptions | null;
}

export class MicroserviceModule {
  [x: string]: any;
}
