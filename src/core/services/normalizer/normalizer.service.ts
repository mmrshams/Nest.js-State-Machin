import {Injectable} from '@nestjs/common';
import {flatten} from 'lodash';
import {MessageInterface} from 'src/core/interfaces/message.interface';
import {
  NormalizerInterface,
  NormalizerResultInterface,
} from 'src/core/interfaces/normalizer.interface';
import {NormalizerPluginInterface} from 'src/plugins/interfaces/normalizer-plugin.interface';
import {ZIIFNormalizer} from 'src/plugins/normalizer/ziif/services/ziif.normalizer';

import {LoaderService} from '../loader/loader.service';

@Injectable()
export class NormalizerService {
  private readonly normalizers: Record<string, NormalizerPluginInterface> = {};

  constructor(
    private readonly loaderService: LoaderService,
    private readonly ziifNormalizer: ZIIFNormalizer
  ) {
    this.normalizers = {
      ziif: ziifNormalizer,
    };
  }

  async normalize(
    message: MessageInterface
  ): Promise<NormalizerResultInterface> {
    const {flowKey} = message;
    const flow = this.loaderService.getFlow(flowKey);
    const {
      data: normalizedData,
      errors,
    } = await this.normalizers.ziif.normalize({
      message,
      normalizer: flow.normalizer.ziif,
    });
    return {data: normalizedData, errors};
  }
}
