import { AzureFunction, Context } from '@azure/functions';
import { buildTeardown } from '../src/operations/teardown';
import { buildLogger } from '../src/services/Logger';
import { buildNetworkService } from '../src/services/NetworkService';
import { buildVmService } from '../src/services/VmService/buildVmService';
import { DynamicResources } from '../src/types';

const activityFunction: AzureFunction = async function (
  context: Context,
  params: DynamicResources
): Promise<void> {
  const logger = buildLogger(context.log, 'teardown');
  const operation = buildTeardown({
    networkService: buildNetworkService(logger),
    vmService: buildVmService(logger),
    logger,
  });

  await operation(params);
};

export default activityFunction;
