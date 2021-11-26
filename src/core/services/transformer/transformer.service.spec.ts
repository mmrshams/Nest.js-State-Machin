import {Test} from '@nestjs/testing';

import {TransformerService} from './transformer.service';
import {MessageInterface} from 'src/core/interfaces/message.interface';
import {FlowInterface} from '../../interfaces/flow.interface';
import {LoaderService} from '../loader/loader.service';

class LoaderServiceMock {
  getFlow(key: string): FlowInterface {
    return {
      key: 'testFlow',
      transformers: ['convertToString', 'randomObject', 'randomArray'],
      conditions: [],
      normalizer: {
        ziif: [],
      },
    };
  }

  getTransformer(transformerName: string): Function {
    const transformers: Record<string, Function> = {
      convertToString: function convertToString(message: any) {
        const {arg} = message.payload;
        // 2
        return arg.toString();
      },
      randomObject: function randomObject(message: any) {
        //123
        return {
          a: 'testValue',
          b: {
            c: 'innerTestValue',
          },
        };
      },
      randomArray: function randomObject() {
        return [1, 2, 3];
      },
    };
    return transformers[transformerName];
  }
}

const loaderServiceMock = {
  provide: LoaderService,
  useClass: LoaderServiceMock,
};

describe('TransformerService', () => {
  let transformerService: TransformerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [loaderServiceMock, TransformerService],
    }).compile();
    transformerService = moduleRef.get<TransformerService>(TransformerService);
  });

  describe('harvest', () => {
    it('should be defined', () => {
      expect(transformerService).toBeDefined();
    });

    it('should  return data when convertToString transformer is called with arg', async () => {
      const message = {
        flowKey: 'testFlow',
        payload: {
          arg: 3123323,
          noUsed: 'notUsed',
        },
      } as MessageInterface;
      const result = await transformerService.transform(message);
      expect(result).toBeDefined();
    });

    it('should throw error when convertToString transformer is called with no arg', async () => {
      const message = {
        flowKey: 'testFlow',
        payload: {
          Inputs: {
            noUsed: 'notUsed',
          },
        },
      } as MessageInterface;
      expect(async () => {
        await transformerService.transform(message);
      }).rejects.toThrowError(Error);
    });

    // TODO: must use typeSafe interfaces
    // it('should throw error when convertToString transformer is called with no matching arg Type', async () => {
    //   const message = {
    //     flowKey: 'testFlow',
    //     payload: {
    //       arg: {},
    //     },
    //   } as HarvestMessage;
    //      expect(async () => {
    //  await harvesterService.harvest(message);
    // }).rejects.toThrowError(Error);
    // });
  });
});
