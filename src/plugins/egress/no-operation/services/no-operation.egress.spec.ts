import {Test} from '@nestjs/testing';
import {EgressPluginInputInterface} from 'src/core/interfaces/egress.interface';

import {NoOperationEgress} from './no-operation.egress';

describe('NoOperation', () => {
  let noOperationAction: NoOperationEgress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [NoOperationEgress],
    }).compile();
    noOperationAction = moduleRef.get<NoOperationEgress>(NoOperationEgress);
  });

  it('should to be defined', () => {
    expect(noOperationAction).toBeDefined();
  });

  describe('operate', () => {
    it('should return same message when get valid message', async () => {
      const message: EgressPluginInputInterface = {
        action: undefined,
        message: {
          flowKey: 'test',
          payload: {a: '1234'},
        },
      };
      const result = await noOperationAction.operate(message);
      expect(result).toBeDefined();
      expect(result).toEqual({data: {}});
    });
  });
});
