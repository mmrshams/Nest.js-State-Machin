import {
  NormalizerPluginInputInterface,
  NormalizerPluginResultInterface,
} from 'src/core/interfaces/normalizer.interface';

export interface NormalizerPluginInterface {
  normalize(
    message: NormalizerPluginInputInterface
  ): Promise<NormalizerPluginResultInterface>;
}
