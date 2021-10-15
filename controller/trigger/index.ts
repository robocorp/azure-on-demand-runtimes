import { AzureFunction, Context } from '@azure/functions';
import * as df from 'durable-functions';
import { buildAzureResponse } from '../src/buildAzureResponse';
import { buildValidateRequest } from '../src/operations/validateRequest';
import { HmacRequest } from '../src/services/Hmac/types';
import { buildLogger } from '../src/services/Logger';
import { buildDefaultSecretService } from '../src/services/SecretsService/buildDefaultSecretService';
import {
  OnDemandRuntimeRequest,
  onDemandRuntimeRequestType,
  OrchestrationEventTypes,
} from '../src/types';

const parseHmacRequest = (context: Context): HmacRequest => {
  const req = context.req;
  if (!req) {
    throw new Error('request not found');
  }
  if (!req.headers) {
    throw new Error('no headers');
  }
  if (!req.rawBody) {
    throw new Error('no raw body');
  }
  if (!req.method) {
    throw new Error('no request method');
  }

  return {
    headers: req.headers,
    method: req.method,
    queryString: '',
    rawBody: req.rawBody,
    // TODO this is hardcoded, it's a bit troublesome to parse this from the azure function context as it has the fully qualified request url
    uri: '/api/trigger',
  };
};

const triggerCustomCluster: AzureFunction = async (context) => {
  const logger = buildLogger(context.log, 'trigger');
  const request = context.req?.body as OnDemandRuntimeRequest | undefined;
  const client = df.getClient(context);

  const validate = buildValidateRequest({
    logger,
    secretService: buildDefaultSecretService(logger),
  });

  try {
    const hmacRequest = parseHmacRequest(context);
    await validate(hmacRequest);
  } catch (error) {
    logger('verifying request failed', error);
    return buildAzureResponse({
      status: 400,
    });
  }

  switch (request?.type) {
    case onDemandRuntimeRequestType.START: {
      logger(
        `starting runtime ${request.runtimeId} in workspace ${request.workspaceId}`
      );
      await client.startNew('orchestrator', request.runtimeId, request);
      return buildAzureResponse({
        status: 201,
      });
    }

    case onDemandRuntimeRequestType.STATUS:
      return buildAzureResponse({
        status: 200,
      });

    case onDemandRuntimeRequestType.STOP:
      try {
        logger(
          `stopping runtime ${request.runtimeId} in workspace ${request.workspaceId}`
        );
        await client.raiseEvent(
          request.runtimeId,
          OrchestrationEventTypes.STOP,
          request
        );
        return buildAzureResponse({
          status: 200,
        });
      } catch (error) {
        logger('stop failed', error);
        return buildAzureResponse({
          status: 500,
          body: {
            error: error.message,
          },
        });
      }

    default:
      return buildAzureResponse({
        status: 400,
      });
  }
};

export default triggerCustomCluster;
