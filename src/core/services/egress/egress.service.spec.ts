import {Test} from '@nestjs/testing';
import {EgressInterface} from 'src/core/interfaces/egress.interface';
import {HTTPEgress} from 'src/plugins/egress/http/services/http.egress';
import {MongodbAggregateEgress} from 'src/plugins/egress/mongodb/services/aggregate/aggregate-mongodb.egress';
import {MongodbInsertEgress} from 'src/plugins/egress/mongodb/services/insert/insert-mongodb.egress';
import {MongodbUpsertEgress} from 'src/plugins/egress/mongodb/services/upsert/upsert-mongodb.egress';
import {NoOperationEgress} from 'src/plugins/egress/no-operation/services/no-operation.egress';

import {FlowInterface} from '../../interfaces/flow.interface';
import {LoaderService} from '../loader/loader.service';
import {EgressService} from './egress.service';

class SendKafkaEgress {
  async operate(): Promise<void> {}
}

class LoaderServiceMock {
  getFlow(key: string): FlowInterface {
    return {
      key: 'testFlow',
      transformers: ['convertToString', 'randomObject', 'randomArray'],
      normalizer: {
        ziif: [],
      },
      conditions: [],
    };
  }
  getTransformer(transformerName: string): Function {
    const transformers: Record<string, Function> = {
      convertToString: function convertToString(arg: number) {
        return arg.toString();
      },
      randomObject: function randomObject(arg: string) {
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

class EgressMock {
  operate(key: unknown): unknown {
    return 'ok';
  }
}

const MongodbUpsertEgressMock = {
  provide: MongodbUpsertEgress,
  useClass: EgressMock,
};
const MongodbInsertEgressMock = {
  provide: MongodbInsertEgress,
  useClass: EgressMock,
};
const MongodbAggregateEgressMock = {
  provide: MongodbAggregateEgress,
  useClass: EgressMock,
};
const NoOperationEgressMock = {
  provide: NoOperationEgress,
  useClass: EgressMock,
};

const httpEgressMock = {
  provide: HTTPEgress,
  useClass: EgressMock,
};

const loaderServiceMock = {
  provide: LoaderService,
  useClass: LoaderServiceMock,
};

describe('LoaderService', () => {
  let operatorService: EgressService;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EgressService,
        loaderServiceMock,
        SendKafkaEgress,
        MongodbAggregateEgressMock,
        MongodbUpsertEgressMock,
        MongodbInsertEgressMock,
        NoOperationEgressMock,
        httpEgressMock,
      ],
    }).compile();
    operatorService = moduleRef.get<EgressService>(EgressService);
  });

  it('should be defined', () => {
    expect(operatorService).toBeDefined();
  });

  describe('operate', () => {
    it('should be return payload with noAction', async () => {
      const message = {
        flowKey: 'testFlows-12345',
        payload: {
          Inputs: {
            name: 'John',
          },
        },
      } as EgressInterface;
      expect(async () => {
        await operatorService.operate(message);
      }).rejects.toThrowError(Error);
    });
  });
});
