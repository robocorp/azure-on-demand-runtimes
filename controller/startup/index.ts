import { AzureFunction, Context } from '@azure/functions';
import { buildStartRobotRun } from '../src/operations/startRobotRun';
import { buildLogger } from '../src/services/Logger';
import { buildNetworkService } from '../src/services/NetworkService';
import { buildVmService } from '../src/services/VmService/buildVmService';
import { DynamicResources, StartRobotRunParams } from '../src/types';

const activityFunction: AzureFunction = async function (
  context: Context,
  params: StartRobotRunParams
): Promise<DynamicResources> {
  const logger = buildLogger(context.log, 'startup');
  const operation = buildStartRobotRun({
    networkService: buildNetworkService(logger),
    vmService: buildVmService(logger),
    logger,
  });

  const res = await operation(params);
  return res;
};

export default activityFunction;
