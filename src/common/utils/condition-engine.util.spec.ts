import {Test} from '@nestjs/testing';
import {Expression} from 'src/core/interfaces/condition.interface';

import {ConditionEngine} from './condition-engine.util';

describe('ClassValidatorUtil', () => {
  let conditionEngine: ConditionEngine;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ConditionEngine],
    }).compile();
    conditionEngine = moduleRef.get<ConditionEngine>(ConditionEngine);
  });

  describe('evaluate', () => {
    it('should return false with {$gte: [{value: 32}, {value: 52}]} ', async () => {
      const expression = {$gte: [{value: 32}, {value: 52}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return true with {$gte: [{value: 10}, {value: 5}]} ', async () => {
      const expression = {$gte: [{value: 10}, {value: 5}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return true with {$gte: [{value: 52}, {value: 52}]} ', async () => {
      const expression = {$gte: [{value: 52}, {value: 52}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return true with {$gte: [{value: 62}, {value: 52}]} ', async () => {
      const expression = {$gte: [{value: '62'}, {value: '52'}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return false with {$gt: [{value: 32}, {value: 52}]} ', async () => {
      const expression = {$gt: [{value: 32}, {value: 52}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return false with {$gt: [{value: 52}, {value: 52}]} ', async () => {
      const expression = {$gt: [{value: 52}, {value: 52}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return false with {$gt: [{value: 62}, {value: 52}]} ', async () => {
      const expression = {$gt: [{value: 62}, {value: 52}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return true with {$lte: [{value: 32}, {value: 52}]} ', async () => {
      const expression = {$lte: [{value: 10}, {value: 5}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return true with {$lte: [{value: 32}, {value: 52}]} ', async () => {
      const expression = {$lte: [{value: 32}, {value: 52}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return true with {$lte: [{value: 52}, {value: 52}]} ', async () => {
      const expression = {$lte: [{value: 52}, {value: 52}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return false with {$lte: [{value: 62}, {value: 52}]} ', async () => {
      const expression = {$lte: [{value: 62}, {value: 52}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return true with {$lt: [{value: 32}, {value: 52}]} ', async () => {
      const expression = {$lt: [{value: 32}, {value: 52}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return false with {$lt: [{value: 52}, {value: 52}]} ', async () => {
      const expression = {$lt: [{value: 52}, {value: 52}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return false with {$lt: [{value: 62}, {value: 52}]} ', async () => {
      const expression = {$lt: [{value: 62}, {value: 52}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return true with {$eq: [{value: "jack"}, {value: "john"}]} ', async () => {
      const expression = {
        $eq: [{value: 'jack'}, {value: 'john'}],
      } as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return true with {$eq: [{value: "jack"}, {value: "jack"}]} ', async () => {
      const expression = {
        $eq: [{value: 'jack'}, {value: 'jack'}],
      } as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return false with {$eq: [{value: true}, {value: false}]} ', async () => {
      const expression = {
        $eq: [{value: true}, {value: false}],
      } as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return true with {$eq: [{value: true}, {value: true}]} ', async () => {
      const expression = {
        $eq: [{value: true}, {value: true}],
      } as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return true with {$eq: [{value: 22}, {value: 22}]} ', async () => {
      const expression = {$eq: [{value: 22}, {value: 22}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return true with {$eq: [{value: 22}, {value: 23}]} ', async () => {
      const expression = {$eq: [{value: 22}, {value: 23}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return true with {$ne: [{value: "jack"}, {value: "john"}]} ', async () => {
      const expression = {
        $ne: [{value: 'jack'}, {value: 'john'}],
      } as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return false with {$ne: [{value: "jack"}, {value: "jack"}]} ', async () => {
      const expression = {
        $ne: [{value: 'jack'}, {value: 'jack'}],
      } as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return false with {$ne: [{value: true}, {value: false}]} ', async () => {
      const expression = {
        $eq: [{value: true}, {value: false}],
      } as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return true with {$ne: [{value: true}, {value: true}]} ', async () => {
      const expression = {
        $eq: [{value: true}, {value: true}],
      } as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return false with {$ne: [{value: 22}, {value: 22}]} ', async () => {
      const expression = {$ne: [{value: 22}, {value: 22}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return true with {$ne: [{value: 22}, {value: 23}]} ', async () => {
      const expression = {$ne: [{value: 22}, {value: 23}]} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return true with {$not: {value: 0}} ', async () => {
      const expression = {$not: {value: 0}} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return false with {$not: {value: 1}} ', async () => {
      const expression = {$not: {value: 1}} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return true with {$not: {value: false}} ', async () => {
      const expression = {$not: {value: false}} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });

    it('should return false with {$not: {value: true}} ', async () => {
      const expression = {$not: {value: true}} as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeFalsy();
    });

    it('should return true with complex expression} ', async () => {
      const expression = {
        $not: {
          $and: [
            {
              $or: [
                {$gte: [{value: 32}, {value: 52}]},
                {$lt: [{value: 82}, {value: 94}]},
              ],
            },
            {
              $eq: [
                {$lte: [{value: 12}, {value: 62}]},
                {$gt: [{value: 24}, {value: 72}]},
              ],
            },
            {$ne: [{value: true}, {$not: {value: false}}]},
            {value: true},
          ],
        },
      } as Expression;
      const result = conditionEngine.evaluate(
        {flowKey: 'test', contextId: 'test_context', payload: {}},
        expression
      );
      expect(result).toBeTruthy();
    });
  });
});
