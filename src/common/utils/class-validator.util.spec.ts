import 'reflect-metadata';

import * as joi from 'joiful';

import {validate} from './class-validator.util';

class TestClass {
  constructor(data: Partial<TestClass>) {
    Object.assign(this, data);
  }

  @(joi.string().email().required())
  email!: string;

  @(joi.number().integer().required())
  phoneNumber!: number;
}

describe('ClassValidatorUtil', () => {
  describe('validate', () => {
    it('should return error on empty object', () => {
      const obj = {};
      expect(() => validate<TestClass>(obj, TestClass)).toThrowError(Error);
    });

    it('should return type safe validated object ', () => {
      const obj = {
        email: 'jon.dow@somewhere.com',
        phoneNumber: 412,
      };
      const validatedObject = validate<TestClass>(obj, TestClass);
      expect(validatedObject).toEqual({
        email: 'jon.dow@somewhere.com',
        phoneNumber: 412,
      });
      expect(validatedObject).toBeInstanceOf(TestClass);
    });

    it('should return type safe validated object with casted values', () => {
      const obj = {
        email: 'jon.dow@somewhere.com',
        phoneNumber: '412',
      };
      const validatedObject = validate<TestClass>(obj, TestClass, {
        convert: true,
        noDefaults: false,
        stripUnknown: true,
      });
      expect(validatedObject).toEqual({
        email: 'jon.dow@somewhere.com',
        phoneNumber: 412,
      });
      expect(validatedObject).toBeInstanceOf(TestClass);
    });

    it('should remove extra keys from validated object ', () => {
      const obj = {
        email: 'jon.dow@somewhere.com',
        phoneNumber: 412,
        hello: '123',
      };
      const validatedObject = validate<TestClass>(obj, TestClass);
      expect(validatedObject).toEqual({
        email: 'jon.dow@somewhere.com',
        phoneNumber: 412,
      });
      expect(validatedObject).toBeInstanceOf(TestClass);
    });

    it('should throw error when validation is missing ', () => {
      const obj = {
        email: 'jon.dow@somewhere.com',
      };
      expect(() => validate<TestClass>(obj, TestClass)).toThrowError(Error);
    });

    it('should return empty when using an empty Array ', () => {
      const obj: Array<unknown> = [];
      const validatedObject = validate<TestClass>(obj, TestClass);
      expect(validatedObject).toBeInstanceOf(Array);
      expect(validatedObject).toEqual([]);
    });

    it('should return validated array', () => {
      const obj: Array<unknown> = [
        {
          email: 'jon.dow@somewhere.com',
          phoneNumber: 412,
        },
      ];
      const validatedObject = validate<TestClass>(obj, TestClass);
      expect(validatedObject).toEqual([
        {
          email: 'jon.dow@somewhere.com',
          phoneNumber: 412,
        },
      ]);
      expect(validatedObject).toBeInstanceOf(Array);
      expect((validatedObject as Array<unknown>)[0]).toBeInstanceOf(TestClass);
    });

    it('should return validated array with casted values', () => {
      const obj: Array<unknown> = [
        {
          email: 'jon.dow@somewhere.com',
          phoneNumber: '412',
        },
      ];
      const validatedObject = validate<TestClass>(obj, TestClass, {
        convert: true,
        noDefaults: true,
        stripUnknown: true,
      });
      expect(validatedObject).toEqual([
        {
          email: 'jon.dow@somewhere.com',
          phoneNumber: 412,
        },
      ]);
      expect(validatedObject).toBeInstanceOf(Array);
      expect((validatedObject as Array<unknown>)[0]).toBeInstanceOf(TestClass);
    });

    it('should throw error when not all elements match validations ', () => {
      const obj: Array<unknown> = [
        {
          email: 'jon.dow@somewhere.com',
          phoneNumber: 412,
        },
        {
          email: 'jon.dow@somewhere.com',
          phoneNumber: '412',
        },
      ];
      expect(() => validate<TestClass>(obj, TestClass)).toThrowError(Error);
    });

    it('should throw error when array contains empty element', () => {
      const obj: Array<unknown> = [
        {
          email: 'jon.dow@somewhere.com',
          phoneNumber: 412,
        },
        {},
      ];
      expect(() => validate<TestClass>(obj, TestClass)).toThrowError(Error);
    });
  });
});
