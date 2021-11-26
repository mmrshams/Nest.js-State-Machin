import {Injectable} from '@nestjs/common';
import {get} from 'lodash';
import {
  AndOperator,
  EqOperator,
  Expression,
  GteOperator,
  GtOperator,
  LteOperator,
  LtOperator,
  NeOperator,
  NotOperator,
  Operand,
  OrOperator,
} from 'src/core/interfaces/condition.interface';
import {MessageInterface} from 'src/core/interfaces/message.interface';

class Stack<T> {
  _store: Array<T> = [];
  push(val: T) {
    this._store.push(val);
  }
  pop(): T | undefined {
    return this._store.pop();
  }
  peek(): T | undefined {
    return this._store[0];
  }
}

@Injectable()
export class ConditionEngine {
  constructor() {}

  evaluate(
    message: MessageInterface,
    expression: Expression,
    values?: Stack<string>
  ): boolean {
    if (!values) {
      values = new Stack();
    }
    const expressionKeys = Object.keys(expression);
    const isOperand =
      expressionKeys.includes('value') || expressionKeys.includes('key');
    if (isOperand) {
      const operand = expression as Operand;
      if (operand.value !== undefined) {
        values.push(String(operand.value));
      } else {
        values.push(String(get(message, operand.key!)));
      }
    }
    const operator = expressionKeys[0];
    switch (operator) {
      case '$not': {
        const subExpression = (expression as NotOperator)[
          operator
        ] as Expression;
        this.evaluate(message, subExpression, values);
        const operandA = values.pop();
        values.push(this.applyOp(operator, operandA!));
        break;
      }
      case '$and': {
        const subExpressions = (expression as AndOperator)[
          operator
        ] as Array<Expression>;
        subExpressions.forEach(subExpression => {
          this.evaluate(message, subExpression, values);
        });
        for (let i = 0; i < subExpressions.length - 1; i++) {
          const operandA = values.pop();
          const operandB = values.pop();
          values.push(this.applyOp(operator, operandB!, operandA!));
        }
        break;
      }
      case '$or': {
        const subExpressions = (expression as OrOperator)[
          operator
        ] as Array<Expression>;
        subExpressions.forEach(subExpression => {
          this.evaluate(message, subExpression, values);
        });
        for (let i = 0; i < subExpressions.length - 1; i++) {
          const operandA = values.pop();
          const operandB = values.pop();
          values.push(this.applyOp(operator, operandB!, operandA!));
        }
        break;
      }
      case '$gt': {
        const subExpressions = (expression as GtOperator)[
          operator
        ] as Array<Expression>;
        subExpressions.forEach(subExpression => {
          this.evaluate(message, subExpression, values);
        });
        for (let i = 0; i < subExpressions.length - 1; i++) {
          const operandA = values.pop();
          const operandB = values.pop();
          values.push(this.applyOp(operator, operandB!, operandA!));
        }
        break;
      }
      case '$gte': {
        const subExpressions = (expression as GteOperator)[
          operator
        ] as Array<Expression>;
        subExpressions.forEach(subExpression => {
          this.evaluate(message, subExpression, values);
        });
        for (let i = 0; i < subExpressions.length - 1; i++) {
          const operandA = values.pop();
          const operandB = values.pop();
          values.push(this.applyOp(operator, operandB!, operandA!));
        }
        break;
      }
      case '$lt': {
        const subExpressions = (expression as LtOperator)[
          operator
        ] as Array<Expression>;

        subExpressions.forEach(subExpression => {
          this.evaluate(message, subExpression, values);
        });
        for (let i = 0; i < subExpressions.length - 1; i++) {
          const operandA = values.pop();
          const operandB = values.pop();
          values.push(this.applyOp(operator, operandB!, operandA!));
        }
        break;
      }
      case '$lte': {
        const subExpressions = (expression as LteOperator)[
          operator
        ] as Array<Expression>;
        subExpressions.forEach(subExpression => {
          this.evaluate(message, subExpression, values);
        });
        for (let i = 0; i < subExpressions.length - 1; i++) {
          const operandA = values.pop();
          const operandB = values.pop();
          values.push(this.applyOp(operator, operandB!, operandA!));
        }
        break;
      }
      case '$eq': {
        const subExpressions = (expression as EqOperator)[
          operator
        ] as Array<Expression>;
        subExpressions.forEach(subExpression => {
          this.evaluate(message, subExpression, values);
        });
        for (let i = 0; i < subExpressions.length - 1; i++) {
          const operandA = values.pop();
          const operandB = values.pop();
          values.push(this.applyOp(operator, operandB!, operandA!));
        }
        break;
      }
      case '$ne': {
        const subExpressions = (expression as NeOperator)[
          operator
        ] as Array<Expression>;
        subExpressions.forEach(subExpression => {
          this.evaluate(message, subExpression, values);
        });
        for (let i = 0; i < subExpressions.length - 1; i++) {
          const operandA = values.pop();
          const operandB = values.pop();
          values.push(this.applyOp(operator, operandB!, operandA!));
        }
        break;
      }
    }
    const evaluated = values.peek();
    return evaluated === 'false' ||
      evaluated === '0' ||
      evaluated === null ||
      evaluated === undefined
      ? false
      : true;
  }

  applyOp(op: string, a: string, b?: string): string {
    switch (op) {
      case '$not':
        return a === 'false' || a === '0' || a === null || a === undefined
          ? 'true'
          : 'false';
      case '$and': {
        const boolA =
          a === 'false' || a === '0' || a === null || a === undefined
            ? false
            : true;
        const boolB =
          b === 'false' || b === '0' || b === null || b === undefined
            ? false
            : true;
        return String(boolA && boolB);
      }
      case '$or': {
        const boolA =
          a === 'false' || a === '0' || a === null || a === undefined
            ? false
            : true;
        const boolB =
          b === 'false' || b === '0' || b === null || b === undefined
            ? false
            : true;
        return String(boolA || boolB);
      }
      case '$gte': {
        return parseInt(a) && parseInt(b!)
          ? String(Number(a) >= Number(b!))
          : String(a >= b!);
      }
      case '$gt':
        return parseInt(a) && parseInt(b!)
          ? String(Number(a) > Number(b!))
          : String(a > b!);
      case '$lte':
        return parseInt(a) && parseInt(b!)
          ? String(Number(a) <= Number(b!))
          : String(a <= b!);
      case '$lt':
        return parseInt(a) && parseInt(b!)
          ? String(Number(a) < Number(b!))
          : String(a < b!);
      case '$eq':
        return String(a === b!);
      case '$ne':
        return String(a !== b!);
      default:
        return '';
    }
  }
}
