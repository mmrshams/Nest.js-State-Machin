import {Controller, Inject} from '@nestjs/common';
import {ClientProxy, MessagePattern} from '@nestjs/microservices';
import {from, Observable} from 'rxjs';
import {Trace} from 'src/common/decorators/tracer.decorator';
import {Messages} from 'src/common/enums/messages.enum';

import {MessageInterface} from './interfaces/message.interface';
import {EgressService} from './services/egress/egress.service';
import {HarvesterService} from './services/harvester/harvester.service';
import {TransformerService} from './services/transformer/transformer.service';
import {NormalizerService} from './services/normalizer/normalizer.service';
import {RelayService} from './services/relay/relay.service';

@Controller()
export class CoreController {
  constructor(
    @Inject('ProviderServiceProxy') private readonly clientProxy: ClientProxy,
    private readonly normalizerService: NormalizerService,
    private readonly harvesterService: HarvesterService,
    private readonly transformerService: TransformerService,
    private readonly egressService: EgressService,
    private readonly relayService: RelayService
  ) {}

  @MessagePattern(Messages.START_MAIN_FLOW)
  @Trace()
  async startMainFlow(message: MessageInterface): Promise<Observable<unknown>> {
    return this.harvest({...message, parentCtx: message.ctx});
  }

  @Trace()
  async harvest(message: MessageInterface): Promise<Observable<unknown>> {
    const harvestedData = await this.harvesterService.harvest(message);
    return this.transform({
      ...message,
      harvested: harvestedData,
    });
  }

  @Trace()
  async transform(message: MessageInterface): Promise<Observable<unknown>> {
    const transformedData = await this.transformerService.transform(message);
    return this.egress({
      ...message,
      transformed: transformedData,
    });
  }

  @Trace()
  async egress(message: MessageInterface): Promise<Observable<unknown>> {
    const egressData = await this.egressService.operate(message);
    return this.normalize({
      ...message,
      egress: egressData,
    });
  }

  @Trace()
  async normalize(message: MessageInterface): Promise<Observable<unknown>> {
    const normalizedData = await this.normalizerService.normalize(message);
    return this.relay({
      ...message,
      normalized: normalizedData,
    });
  }

  @Trace()
  async relay(message: MessageInterface): Promise<Observable<unknown>> {
    const {
      nextFlowKeys: nextFlows,
      terminate,
      isAsync,
    } = await this.relayService.relay(message);

    if (terminate) {
      return new Observable(sub => {
        if (!isAsync) sub.next(message);
        sub.complete();
      });
    }

    const nextFlowsResults = [];

    for (const [_, {nextFlowKey, as, isAsync}] of Object.entries(nextFlows)) {
      if (isAsync) {
        this.clientProxy
          .send<unknown>(Messages.START_MAIN_FLOW, {
            flowKey: nextFlowKey,
            contextId: message.contextId,
            payload: message,
            parentCtx: message.ctx,
            correlationId: message.correlationId,
          })
          .toPromise();
        continue;
      }

      const result = await this.clientProxy
        .send<unknown>(Messages.START_MAIN_FLOW, {
          flowKey: nextFlowKey,
          contextId: message.contextId,
          payload: message,
          parentCtx: message.ctx,
          correlationId: message.correlationId,
        })
        .toPromise();

      if (result && (result as any).error) throw (result as any).error;

      nextFlowsResults.push({
        [as!]: result,
      });
    }

    return from(Promise.all(nextFlowsResults));
  }
}
