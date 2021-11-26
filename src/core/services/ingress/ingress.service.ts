import {Injectable, OnModuleInit, Optional} from '@nestjs/common';
import {ListenGrpcIngress} from 'src/plugins/ingress/grpc/services/call/listen-grpc.ingress';
import {ListenKafkaIngress} from 'src/plugins/ingress/kafka/services/send/listen-kafka.ingress';
import {EgressPluginInterface} from 'src/plugins/interfaces/egress-plugin.interface';

import {LoaderService} from '../loader/loader.service';

@Injectable()
export class IngressService implements OnModuleInit {
  private readonly ingresses: Record<string, EgressPluginInterface> = {};

  constructor(
    private readonly loaderService: LoaderService,
    private readonly grpcIngress: ListenGrpcIngress,
    @Optional() private readonly kafkaIngress?: ListenKafkaIngress
  ) {}

  async onModuleInit() {
    // await
    this.listen();
  }

  async listen(): Promise<boolean> {
    const flows = this.loaderService.getFlows();
    let flowType: Array<unknown> = [];
    for (const flow of flows) {
      if (flow.ingress) {
        flowType = flowType.concat(Object.keys(flow.ingress));
      }
    }
    if (flowType.indexOf('kafka') > -1) {
      await this.kafkaIngress?.listen({flows});
    }
    await this.grpcIngress.listen({
      flows: this.loaderService.getFlows(),
    });
    return true;
  }
}
