import * as joi from 'joiful';

import {Log} from '../../common/interfaces/log.interface';

export class Operand {
  key?: string;
  value?: string | number | boolean | null | undefined;
}

export class OrOperator {
  $or!: Array<Expression>;
}
export class AndOperator {
  $and!: Array<Expression>;
}
export class GteOperator {
  $gte!: Array<Expression>;
}
export class LteOperator {
  $lte!: Array<Expression>;
}
export class GtOperator {
  $gt!: Array<Expression>;
}
export class LtOperator {
  $lt!: Array<Expression>;
}
export class EqOperator {
  $eq!: Array<Expression>;
}
export class NeOperator {
  $ne!: Array<Expression>;
}
export class NotOperator {
  $not!: Expression;
}

export type Expression =
  | OrOperator
  | AndOperator
  | GteOperator
  | LteOperator
  | LtOperator
  | GtOperator
  | Operand;

export type ConditionState = 'success' | 'fail';

export class Condition {
  // the success next flow
  @(joi.string().optional())
  nextFlowKey?: string;

  // log according to condition state
  @(joi.object().optional())
  logs?: Record<ConditionState, Log>;

  // this expression should meet to call the next flow
  expression!: Expression;

  @(joi.boolean().optional())
  terminal? = false;

  @(joi.boolean().optional())
  isAsync? = false;

  @(joi.string().optional())
  as?: string;
}
