import * as joi from 'joiful';

export class Selector {
  @(joi.string().required())
  key!: string;

  @(joi.string().required())
  as!: string;
}

export class Log {
  tag!: string;

  @(joi.array({elementClass: Selector}).optional())
  selectors?: Array<Selector>;

  @(joi.string().required())
  description!: string;

  @(joi.string().optional())
  level?: 'warn' | 'log' | 'error' | 'debug' | 'verbose';
}
