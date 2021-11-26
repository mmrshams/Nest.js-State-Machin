import {Inject, Injectable, NotImplementedException} from '@nestjs/common';
import {MongoClient} from 'mongodb';
import {Config} from 'src/common/interfaces/config.interface';
import {
  EgressPluginInputInterface,
  EgressPluginResultInterface,
} from 'src/core/interfaces/egress.interface';

import {EgressPluginInterface} from '../../../../interfaces/egress-plugin.interface';

@Injectable()
export class BaseMongodbEgress implements EgressPluginInterface {
  constructor(
    protected readonly config: Config,
    @Inject('MongodbClient') protected readonly mongoClient: MongoClient
  ) {}

  async operate(
    message: EgressPluginInputInterface
  ): Promise<EgressPluginResultInterface> {
    throw new NotImplementedException();
  }
}
