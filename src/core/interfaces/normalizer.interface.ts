import * as joi from 'joiful';
import {MessageInterface} from './message.interface';

export type Types = 'string' | 'number' | 'boolean';
export class ZIIF {
  // the key from the parsed json flow data
  @(joi.string().required())
  key!: string;

  @(joi.string().required())
  as!: string;

  @(joi.boolean().optional())
  asArray?: boolean;

  @(joi.object().optional())
  validation?: {
    type: Types;
    schema: string;
    // TODO: implement custom function validator, check existence on loader
    // custom: string;
  };

  @(joi.string().optional())
  castTo?: Types;

  @(joi.boolean().optional())
  prioritizeCast?: Boolean;

  @(joi.array({elementClass: ZIIF}).required())
  innerNormalizers?: Array<ZIIF>;
}
export class Normalizer {
  @(joi.array({elementClass: ZIIF}).required())
  ziif!: Array<ZIIF>;
}

export class NormalizerResultInterface {
  readonly data!: Record<string, unknown>;
  readonly errors?: Array<Error>;
}

export class NormalizerInterface {
  readonly flowKey!: string;

  readonly payload!: Record<string, unknown>;
}

export class NormalizerPluginResultInterface {
  readonly data!: Record<string, unknown>;
  readonly errors?: Array<Error>;
}

export class NormalizerPluginInputInterface {
  readonly normalizer!: Array<ZIIF>;
  readonly message!: MessageInterface;
}
