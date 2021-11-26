import {EgressPluginResultInterface} from './egress.interface';
import {NormalizerResultInterface} from './normalizer.interface';

export class MessageInterface {
  readonly flowKey!: string;

  // contextId for keep request contexts unique
  // TODO: please change this to required
  readonly contextId?: string;

  // all flow-inputs and ingress data comes as payload
  readonly payload!: Record<string, unknown>;

  // collected data from child flows
  // EX: harvested: { harvest_function_one: {}, harvest_function_two: {} }
  readonly harvested?: Record<string, unknown>;

  // transformed data from external transformers
  // EX: transformed: { transform_function_one: {}, transform_function_two: {} }
  readonly transformed?: Record<string, unknown>;

  // returned data from egress [HTTP GRPC kafka mongoDB redis]
  // EX: egress: { http: { data, error },  mongodb: { data, error },  kafka: { data, error }, .. }
  readonly egress?: EgressPluginResultInterface;

  // normalized data after flow normalizer actions
  // EX: normalized: { result , error }
  readonly normalized?: NormalizerResultInterface;

  // jeager parent context
  readonly parentCtx?: any;

  // jeager current context
  readonly ctx?: any;

  readonly correlationId?: string;
}
