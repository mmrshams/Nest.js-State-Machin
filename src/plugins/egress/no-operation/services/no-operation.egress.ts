import {Injectable} from '@nestjs/common';
import {
  EgressPluginInputInterface,
  EgressPluginResultInterface,
} from 'src/core/interfaces/egress.interface';

import {EgressPluginInterface} from '../../../interfaces/egress-plugin.interface';

@Injectable()
export class NoOperationEgress implements EgressPluginInterface {
  constructor() {}

  async operate(
    message: EgressPluginInputInterface
  ): Promise<EgressPluginResultInterface> {
    return {data: {}};
  }
}
