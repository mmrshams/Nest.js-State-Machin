import {Inject, Injectable} from '@nestjs/common';
import * as fs from 'fs';
import {CONFIG} from 'src/common/constants/constants';
import {Config} from 'src/common/interfaces/config.interface';
import {validate} from 'src/common/utils/class-validator.util';

import {FlowInterface} from '../../interfaces/flow.interface';

@Injectable()
export class LoaderService {
  private readonly flows: Record<string, FlowInterface> = {};
  private readonly transformers: Record<string, Function> = {};
  constructor(@Inject(CONFIG) private readonly config: Config) {}

  async loadFlows() {
    // TODO: env enable/disable plugin
    const flows = fs.readdirSync(`${this.config.FLOWS_DIR}`);
    for (const flow of flows as Array<string>) {
      if (flow.includes('-'))
        throw new Error(
          `Flow folder shouldn't contain "-" character, please replace with "_"`
        );
      const flowPath = `${this.config.FLOWS_DIR}/${flow}`;
      const transformerDir = `${flowPath}/transformers`;

      const json = JSON.parse(
        fs.readFileSync(`${flowPath}/${flow}.json`).toString()
      );
      if (!(json instanceof Array)) {
        throw new Error('Flows must be an Array');
      }

      const validatedFlows = validate<FlowInterface>(
        json.map((i: Record<string, unknown>) => new FlowInterface(i)),
        FlowInterface,
        {convert: false, noDefaults: true, stripUnknown: false}
      );

      for (const validatedFlow of validatedFlows as Array<FlowInterface>) {
        if (this.flows[`${validatedFlow.key}`]) {
          throw new Error(
            `Duplicate flow key at: flow:${flow} - key:${validatedFlow.key}`
          );
        }
        // TODO: collector array should validate all flows exists or not
        this.flows[`${validatedFlow.key}`] = validatedFlow;
        const groupedTransformers: Record<string, Array<string>> = {};

        validatedFlow.transformers?.forEach(transformer => {
          const nameSegments = transformer.split('_');
          const transformerName = nameSegments[nameSegments.length - 2];
          const functionName = nameSegments[nameSegments.length - 1];
          if (!groupedTransformers[transformerName]) {
            groupedTransformers[transformerName] = [];
          }
          groupedTransformers[transformerName].push(functionName);
        });

        Object.entries(groupedTransformers).forEach(
          ([transformerName, functionName]) => {
            const filePath = `${transformerDir}/${transformerName}.transformer.js`;
            if (!fs.existsSync(filePath)) {
              throw new Error(
                `Transformer: ${transformerName} not found in flow: ${validatedFlow.key}`
              );
            }
            const functions = require(filePath);
            if (!functions[`${functionName}`]) {
              throw new Error(
                `Transformer function: ${transformerName} not found in transformer: ${transformerName}`
              );
            }
            this.transformers[`${flow}_${transformerName}_${functionName}`] =
              functions[`${functionName}`];
          }
        );
      }
    }
  }

  async loadProtos() {
    // const protoPaths = fs.readdirSync(this.config.PROTOS_PATH);
    // const grpcs: Array<string> = [];
    // const protos: Record<string, protoLoader.AnyDefinition> = {};
    // for (const protoPath of protoPaths) {
    //   const packageDefinition = protoLoader.loadSync(
    //     `${this.config.PROTOS_PATH}/${protoPath}`
    //   );
    //   const packageObject = grpc.loadPackageDefinition(packageDefinition);
    //   Object.entries(packageDefinition).forEach(([messageName, message]) => {
    //     const messageKeys = Object.keys(message);
    //     if (messageKeys.includes('format')) {
    //       return (protos[messageName] = message);
    //     }
    //     return messageKeys.forEach(methodName => {
    //       grpcs.push(
    //         `${messageName}.${
    //           methodName.charAt(0).toLocaleLowerCase() + methodName.slice(1)
    //         }`
    //       );
    //     });
    //   });
    // }
  }

  getFlows(): Array<FlowInterface> {
    return Object.entries(this.flows).map(([key, value]) => value);
  }

  getFlow(key: string): FlowInterface {
    if (!this.flows[`${key}`]) {
      throw new Error(`Flow with key ${key} not found`);
    }
    return this.flows[`${key}`];
  }

  getTransformer(transformerName: string): Function {
    if (!this.transformers[`${transformerName}`]) {
      throw new Error(`Transformer with name ${transformerName} not found`);
    }
    return this.transformers[`${transformerName}`];
  }
}
