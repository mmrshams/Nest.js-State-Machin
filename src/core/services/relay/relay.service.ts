import {Injectable} from '@nestjs/common';
import {get, merge} from 'lodash';
import {Selector} from 'src/common/interfaces/log.interface';
import {ConditionEngine} from 'src/common/utils/condition-engine.util';
import {LoggerService} from 'src/common/utils/logger.util';
import {MessageInterface} from 'src/core/interfaces/message.interface';
import {RelayResultInterface} from 'src/core/interfaces/relay.interface';

import {LoaderService} from '../loader/loader.service';

@Injectable()
export class RelayService {
  constructor(
    private readonly logger: LoggerService,
    private readonly loaderService: LoaderService,
    private readonly conditionEngine: ConditionEngine
  ) {}

  async relay(message: MessageInterface): Promise<RelayResultInterface> {
    const {flowKey} = message;
    const flow = this.loaderService.getFlow(flowKey);

    let terminate = false;
    let isAsync = false;
    const nextFlowKeys = [];

    for (const condition of flow.conditions) {
      const evaluatedCondition = this.conditionEngine.evaluate(
        message,
        condition.expression
      );
      if (evaluatedCondition && condition.nextFlowKey) {
        nextFlowKeys.push({
          nextFlowKey: condition.nextFlowKey,
          as: condition.as,
          isAsync: !!condition.isAsync,
        });
      }

      isAsync = !!condition.isAsync;
      terminate =
        terminate || (evaluatedCondition && condition && !!condition.terminal);

      const conditionState = evaluatedCondition ? 'success' : 'fail';
      if (condition.logs && condition.logs[conditionState]) {
        const {description, selectors, tag, level} = condition.logs[
          conditionState
        ];
        const logData = ((selectors as Array<Selector>) || []).map(
          ({key, as}) => {
            return {[as]: get(message, key)};
          }
        );

        const logLevel = level || (evaluatedCondition ? 'log' : 'warn');
        this.logger.log({
          level: logLevel,
          data: merge(
            {tag, contextId: message.contextId, message: description},
            ...logData
          ),
          context: 'RelayCondition',
        });
      }
    }

    return {nextFlowKeys, terminate, isAsync};
  }
}
