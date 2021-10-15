import * as df from 'durable-functions';
import { buildLogger } from '../src/services/Logger';
import {
  DynamicResources,
  OnDemandRuntimeRequestStart,
  OrchestrationEventTypes,
  StartRobotRunParams,
} from '../src/types';

const secondsFrom = (from: Date, seconds: number) =>
  new Date(from.getTime() + seconds * 1000);

const orchestrator = df.orchestrator(function* (context) {
  const logger = buildLogger(
    context.log,
    'orchestrator',
    context.df.isReplaying
  );

  const input: OnDemandRuntimeRequestStart = context.df.getInput();
  logger('initiating configuration provisioning');
  const vmConfiguration: StartRobotRunParams = yield context.df.callActivity(
    'vmConfigurationProvider',
    input
  );
  logger('initializing startup');

  const cancellation = context.df.waitForExternalEvent(
    OrchestrationEventTypes.STOP
  );

  const dynamicResoures = yield context.df.callActivity(
    'startup',
    vmConfiguration
  );

  logger('creation succeeded, initiating bootstrapping');
  const bootstrapTask = context.df.callActivity('bootstrap', vmConfiguration);
  yield context.df.Task.any([bootstrapTask, cancellation]);

  const timeout = context.df.createTimer(
    secondsFrom(context.df.currentUtcDateTime, input.maxLifetimeSeconds)
  );

  const timeoutOrCancellation = yield context.df.Task.any([
    timeout,
    cancellation,
  ]);
  if (timeoutOrCancellation === cancellation) {
    timeout.cancel();
  }

  logger('initiating teardown');
  yield context.df.callActivity('teardown', dynamicResoures);
});

export default orchestrator;
