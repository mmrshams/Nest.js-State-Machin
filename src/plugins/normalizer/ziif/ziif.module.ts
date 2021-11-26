import {DynamicModule, Module} from '@nestjs/common';
import {Config} from 'src/common/interfaces/config.interface';
import {ZIIFNormalizer} from './services/ziif.normalizer';

@Module({})
export class ZIIFNormalizerPluginModule {
  static register(config: Config): DynamicModule {
    return {
      module: ZIIFNormalizerPluginModule,
      providers: [ZIIFNormalizer],
      exports: [ZIIFNormalizer],
    };
  }
}
