import {Injectable} from '@nestjs/common';
import {MessageInterface} from 'src/core/interfaces/message.interface';
import {LoaderService} from '../loader/loader.service';

@Injectable()
export class TransformerService {
  constructor(private readonly loaderService: LoaderService) {}

  async transform(message: MessageInterface): Promise<Record<string, unknown>> {
    try {
      // TODO: please check this
      const {flowKey} = message;
      const flow = this.loaderService.getFlow(flowKey);
      const providerRequestInputs: Array<{[key: string]: unknown}> = [];

      // TODO: Run Transformers in Parallel
      for (const transformerName of flow?.transformers as Array<string>) {
        const transformer = this.loaderService.getTransformer(transformerName);
        const res = await transformer(message);
        providerRequestInputs.push({
          [transformerName]: res,
        });
      }
      const transformed: Record<string, unknown> = {};
      providerRequestInputs.forEach(p =>
        Object.keys(p).forEach(k => {
          transformed[k] = p[k];
        })
      );
      return transformed;
    } catch (err) {
      const error = new Error();
      error.name = 'TRANSFORM_ERROR';
      error.message =
        err.name === 'TRANSFORM_ERROR' ? err.message : 'Invalid Data';
      error.stack = err.stack;
      throw error;
    }
  }
}
