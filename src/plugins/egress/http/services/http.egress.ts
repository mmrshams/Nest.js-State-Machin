import {Inject, Injectable} from '@nestjs/common';
import {AxiosInstance} from 'axios';
import * as fs from 'fs';
import * as ejs from 'ejs';
import {Config} from 'src/common/interfaces/config.interface';
import xmlParser from 'xml2js';
import {HTTPAction} from 'src/core/interfaces/egress-action.interface';
import {
  EgressPluginInputInterface,
  EgressPluginResultInterface,
} from 'src/core/interfaces/egress.interface';

import {EgressPluginInterface} from '../../../interfaces/egress-plugin.interface';
import {LoggerService} from 'src/common/utils/logger.util';

@Injectable()
export class HTTPEgress implements EgressPluginInterface {
  constructor(
    protected readonly config: Config,
    @Inject('Axios') protected readonly axios: AxiosInstance,
    private readonly logger: LoggerService
  ) {}

  async operate({
    action,
    message,
  }: EgressPluginInputInterface): Promise<EgressPluginResultInterface> {
    const httpAction = action as HTTPAction;
    const {body, headers, url} = this.createRequest({message, action});
    const rawRequest = {
      url,
      headers,
      data: body,
      method: httpAction.requestMethod,
      timeout: httpAction.timeout,
    };
    try {
      const requestStartTime = new Date().getTime();
      // TODO: wrap the axios request in promise
      const {
        data: responseBody,
        headers: responseHeaders,
        status,
      } = await this.axios({
        url,
        headers,
        data: body,
        method: httpAction.requestMethod,
        timeout: httpAction.timeout,
      });

      const requestEndTime = new Date().getTime();
      // ms the total request
      const took = requestEndTime - requestStartTime;
      const rawResponse = {
        data: responseBody,
        headers: responseHeaders,
        status,
      };
      let parsed = responseBody;
      if (httpAction.parseAs === 'XML') {
        const parser = new xmlParser.Parser();
        parsed = await parser.parseStringPromise(responseBody);
      }

      const meta = {responseHeaders, status, took, sentAt: requestStartTime};

      this.logger.log({
        level: 'log',
        context: 'Egress',
        data: {...meta, contextId: message.contextId, url: url},
      });

      if (httpAction.logRawResponse || this.config.HTTP_LOG_ALL) {
        this.logger.log({
          level: 'warn',
          context: 'EgressRawData',
          data: {
            rawRequest: rawRequest,
            rawResponse: rawResponse,
            contextId: message.contextId,
            correlationId: message.correlationId,
          },
        });
      }

      return {
        meta,
        data: parsed,
      };
    } catch (error) {
      this.logger.log({
        level: 'warn',
        context: 'ErrorEgressRawData',
        data: {
          rawRequest: rawRequest,
          error: JSON.stringify(error),
          contextId: message.contextId,
          correlationId: message.correlationId,
        },
      });

      return {data: {}, error};
    }
  }

  createRequest({
    action,
    message,
  }: EgressPluginInputInterface): {
    url: string;
    body?: string;
    headers?: string;
  } {
    const httpAction = action as HTTPAction;
    const flowName = httpAction.urlTemplate.split('.')[0];

    const bodyFilePath = `${this.config.FLOWS_PATH}/${flowName}/templates/${httpAction.bodyTemplate}`;
    const headerFilePath = `${this.config.FLOWS_PATH}/${flowName}/templates/${httpAction.headerTemplate}`;
    const urlFilePath = `${this.config.FLOWS_PATH}/${flowName}/templates/${httpAction.urlTemplate}`;
    if (!fs.existsSync(headerFilePath)) {
      throw new Error(
        `Header Template file ${httpAction.headerTemplate} not found!`
      );
    }
    if (!fs.existsSync(urlFilePath)) {
      throw new Error(`URL Template file ${httpAction.urlTemplate} not found!`);
    }

    let body, headers;
    if (httpAction.bodyTemplate) {
      // TODO: cache in memory
      const bodyFile = fs.readFileSync(bodyFilePath).toString();
      body = ejs.render(bodyFile, message).trim();
    }

    if (httpAction.headerTemplate) {
      // TODO: cache in memory
      const headerFile = fs.readFileSync(headerFilePath).toString();
      headers = ejs.render(headerFile, message).trim();
      headers = JSON.parse(headers);
    }

    // TODO: cache in memory
    const urlFile = fs.readFileSync(urlFilePath).toString();
    const url = ejs.render(urlFile, message).trim();

    return {
      body,
      headers,
      url,
    };
  }
}
