import * as joi from 'joiful';
import {Log} from 'src/common/interfaces/log.interface';

import {Egress} from './egress-action.interface';
import {Condition} from './condition.interface';
import {Normalizer} from './normalizer.interface';
import {RetryPolicy} from './retry-policy.interface';
import {Ingress} from './ingress.interface';

export class FlowInterface {
  constructor(data: Partial<FlowInterface>) {
    Object.assign(this, data);
  }

  // flow key should be unique
  @(joi.string().required())
  key!: string;

  // if propagate error is set to true, it will throw error for tracer to catch
  @(joi.boolean().default(true))
  propagateError? = true;

  // keys of flows required for harvester
  @(joi
    .array()
    .items(joi => joi.string())
    .optional())
  collectors?: Array<string>;

  // names of transformer functions venom loads at startup
  @(joi
    .array()
    .optional()
    .items(joi => joi.string()))
  transformers?: Array<string>;

  // action type the flow require
  @(joi.object().optional())
  egress?: Egress;

  @(joi.object().optional())
  ingress?: Ingress;

  // @(joi.object().required())
  // streamsModes!: string = 'stream:end->stream:data->stream:end' 'unary->stream:datab->stream:end';

  // normalize action result ( validation, casting, pick and rename key/values )
  @(joi.object().required())
  normalizer!: Normalizer;

  // TODO make in required
  // array of conditions change the next flow step
  @(joi.array({elementClass: Condition}).required())
  conditions!: Array<Condition>;

  @(joi
    .array()
    .optional()
    .items(joi => joi.string()))
  relays?: Array<string>;
  // retry policy on flow failure state
  @(joi.object().optional())
  retryPolicy?: RetryPolicy;
}
