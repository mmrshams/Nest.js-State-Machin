import {Test, TestingModule} from '@nestjs/testing';
import {
  NormalizerPluginInputInterface,
  ZIIF,
} from 'src/core/interfaces/normalizer.interface';

import {ZIIFNormalizer} from './ziif.normalizer';

describe('ZIIFNormalizer Service', () => {
  let ziifNormalizer: ZIIFNormalizer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZIIFNormalizer],
    }).compile();

    ziifNormalizer = module.get<ZIIFNormalizer>(ZIIFNormalizer);
  });

  it('should be defined', () => {
    expect(ziifNormalizer).toBeDefined();
  });

  describe('parse', () => {
    const json = {
      firstname: 'jane',
      lastname: 'doe',
      age: 13,
      grade: '5',
      isActive: true,
      isBanned: 'true',
      friends: ['john', 'jane', 'jack'],
      friendAges: ['14', '13', '11'],
      complexArray: ['14', 15, 'hello', true, {}],
      todo: [
        {
          id: 2312,
          label: 'a-12',
        },
        {id: 2313, label: 'a-13', code: 123},
      ],
      done: [{id: 2314, label: 'a-14'}],
      information: {
        profile: {
          ssn: 'jane',
          zipCode: 'doe',
        },
        passport: '5215A',
      },
      address: {
        lat: 23.42,
        long: 43.12,
      },
    };

    it('should return empty payload  with non-existing key', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'non-existing',
            as: 'normalize',
          },
        ] as Array<ZIIF>,
      };

      const {data, errors} = await ziifNormalizer.normalize(message);
      expect(data).toEqual({});
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(0);
    });

    it('should return valid data with primitive parsing on single object', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'payload.firstname',
            as: 'Firstname',
          },
          {
            key: 'payload.age',
            as: 'Age',
          },
          {
            key: 'payload.isActive',
            as: 'Active',
          },
        ] as Array<ZIIF>,
      };

      const {data, errors} = await ziifNormalizer.normalize(message);
      expect(data).toEqual({
        Firstname: 'jane',
        Age: 13,
        Active: true,
      });
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(0);
    });

    it('should return valid data with simple object on single object', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'payload.address',
            as: 'Address',
          },
        ] as Array<ZIIF>,
      };

      const {data, errors} = await ziifNormalizer.normalize(message);
      expect(data).toEqual({
        Address: {
          lat: 23.42,
          long: 43.12,
        },
      });
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(0);
    });

    it('should return valid data with complex object on single object', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'payload.information',
            as: 'Info',
          },
        ] as Array<ZIIF>,
      };

      const {data, errors} = await ziifNormalizer.normalize(message);
      expect(data).toEqual({
        Info: {
          profile: {
            ssn: 'jane',
            zipCode: 'doe',
          },
          passport: '5215A',
        },
      });
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(0);
    });

    it('should return valid data with complex object and innerNormalizer on single object', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'payload.information',
            as: 'Info',
            innerNormalizers: [
              {
                key: 'profile',
                as: 'Profile',
                innerNormalizers: [
                  {
                    key: 'ssn',
                    as: 'SocialSecurity',
                  },
                ],
              },
            ],
          },
        ] as Array<ZIIF>,
      };

      const {data, errors} = await ziifNormalizer.normalize(message);
      expect(data).toEqual({
        Info: {
          Profile: {
            SocialSecurity: 'jane',
          },
        },
      });
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(0);
    });

    it('should  return valid data with primitive array parsing on single object', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'payload.friends',
            as: 'Friends',
          },
        ] as Array<ZIIF>,
      };
      const {data, errors} = await ziifNormalizer.normalize(message);
      expect(data).toEqual({
        Friends: ['john', 'jane', 'jack'],
      });
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(0);
    });

    it('should return valid data with complex array parsing on single object', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'payload.todo',
            as: 'Todo',
            innerNormalizers: [
              {
                key: 'id',
                as: 'Id',
              },
              {
                key: 'label',
                as: 'Label',
              },
            ],
          },
        ] as Array<ZIIF>,
      };

      const {data, errors} = await ziifNormalizer.normalize(message);

      expect(data).toEqual({
        Todo: [
          {
            Id: 2312,
            Label: 'a-12',
          },
          {Id: 2313, Label: 'a-13'},
        ],
      });
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(0);
    });

    it('should return valid data with primitive parsing and validation on single object', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'payload.firstname',
            as: 'Firstname',
            validation: {
              type: 'string',
            },
          },
          {
            key: 'payload.lastname',
            as: 'Lastname',
          },
          {
            key: 'payload.age',
            as: 'Age',
            validation: {
              type: 'number',
            },
          },
          {
            key: 'payload.isActive',
            as: 'Active',
            validation: {
              type: 'boolean',
            },
          },
        ] as Array<ZIIF>,
      };

      const {data, errors} = await ziifNormalizer.normalize(message);
      expect(data).toEqual({
        Firstname: 'jane',
        Lastname: 'doe',
        Age: 13,
        Active: true,
      });
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(0);
    });

    it('should  return valid data with primitive parsing and typechecking on single object', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'payload.firstname',
            as: 'Firstname',
            validation: {
              type: 'number',
            },
          },
          {
            key: 'payload.lastname',
            as: 'Lastname',
          },
          {
            key: 'payload.grade',
            as: 'Grade',
            validation: {
              type: 'number',
            },
          },
          {
            key: 'payload.isBanned',
            as: 'Banned',
            validation: {
              type: 'boolean',
            },
          },
        ] as Array<ZIIF>,
      };

      const {data, errors} = await ziifNormalizer.normalize(message);
      expect(data).toEqual({
        Lastname: 'doe',
      });
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(3);
    });

    it('should  return valid data with complex array parsing and typechecking on single object', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'payload.complexArray',
            as: 'ComplexArray',
            validation: {
              type: 'number',
            },
          },
        ] as Array<ZIIF>,
      };
      const {data, errors} = await ziifNormalizer.normalize(message);
      expect(data).toEqual({
        ComplexArray: [15],
      });
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(4);
    });

    it('should  return valid data with simple and typecasting on single object', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'payload.firstname',
            as: 'Firstname',
            castTo: 'number',
            prioritizeCast: true,
          },
          {
            key: 'payload.age',
            as: 'Age',
            castTo: 'string',
            prioritizeCast: true,
          },
          {
            key: 'payload.isActive',
            as: 'Active',
            castTo: 'number',
            prioritizeCast: true,
          },
        ] as Array<ZIIF>,
      };

      const {data, errors} = await ziifNormalizer.normalize(message);
      expect(data).toEqual({
        Firstname: NaN,
        Age: '13',
        Active: 1,
      });
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(0);
    });

    it('should  return valid data with simple array and typecasting on single object', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'payload.todo',
            as: 'Todo',
            innerNormalizers: [
              {
                key: 'id',
                as: 'Id',
                castTo: 'string',
                prioritizeCast: true,
              },
              {
                key: 'label',
                as: 'Label',
                castTo: 'number',
                prioritizeCast: true,
              },
            ],
          },
        ] as Array<ZIIF>,
      };

      const {data, errors} = await ziifNormalizer.normalize(message);
      expect(data).toEqual({
        Todo: [
          {
            Id: '2312',
            Label: NaN,
          },
          {Id: '2313', Label: NaN},
        ],
      });
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(0);
    });

    it('should return valid data with complex array parsing and typecasting on single object', async () => {
      const message: NormalizerPluginInputInterface = {
        message: {
          flowKey: 'test',
          payload: json,
        },
        normalizer: [
          {
            key: 'payload.firstname',
            as: 'Firstname',
            validation: {
              type: 'number',
            },
            castTo: 'number',
          },
          {
            key: 'payload.age',
            as: 'Age',
            castTo: 'string',
            validation: {
              type: 'string',
            },
            prioritizeCast: true,
          },
          {
            key: 'payload.isActive',
            as: 'Active',
            castTo: 'number',
            validation: {
              type: 'number',
            },
            prioritizeCast: false,
          },
        ] as Array<ZIIF>,
      };

      const {data, errors} = await ziifNormalizer.normalize(message);
      expect(data).toEqual({
        Age: '13',
      });
      expect(errors).toBeDefined();
      expect(errors).toHaveLength(2);
    });
  });
});
