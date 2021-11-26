import * as joi from 'joiful';
import {FlowInterface} from './flow.interface';

export class IngressPluginResultInterface {
  readonly error?: Error;
}

export class IngressPluginInputInterface {
  readonly flows!: Array<FlowInterface>;
}

export class GrpcIngress {
  @(joi.string().required())
  method!: string;

  @(joi.string().required())
  service!: string;

  @(joi.string().required())
  package!: string;

  @(joi.string().required())
  key!: string;
}

export class KafkaIngress {
  @(joi.string().required())
  topic!: string;
  groupId!: string;
}

export class Ingress {
  @(joi.object().optional())
  grpc?: GrpcIngress;
  kafka?: KafkaIngress;
}
