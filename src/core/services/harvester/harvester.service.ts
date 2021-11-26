import {Inject, Injectable} from '@nestjs/common';
import {MessageInterface} from 'src/core/interfaces/message.interface';
import {LoaderService} from '../loader/loader.service';
import {Messages} from 'src/common/enums/messages.enum';
import {ClientProxy} from '@nestjs/microservices';
import {HarvestResultInterface} from 'src/core/interfaces/harvest.interface';
import {merge} from 'lodash';

@Injectable()
export class HarvesterService {
  constructor(
    private readonly loaderService: LoaderService,
    @Inject('ProviderServiceProxy') private readonly clientProxy: ClientProxy
  ) {}

  async harvest(message: MessageInterface): Promise<HarvestResultInterface> {
    const {flowKey} = message;
    const flow = this.loaderService.getFlow(flowKey);

    if (!flow.collectors) return {};

    let results = [];

    for (const [_, childFlowKey] of Object.entries(flow.collectors)) {
      const result = await this.clientProxy
        .send(Messages.START_MAIN_FLOW, {
          flowKey: childFlowKey,
          contextId: message.contextId,
          payload: message,
          parentCtx: message.ctx,
          correlationId: message.correlationId,
        })
        .toPromise();

      if ((result as any).error) throw (result as any).error;

      results.push({
        [childFlowKey!]: result,
      });
    }

    results = await Promise.all(results);
    return merge({}, ...results);
  }
}
