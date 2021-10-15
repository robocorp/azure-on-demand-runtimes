import { AzureFunction, Context } from '@azure/functions';
import { buildBoostrap } from '../src/operations/bootstrap';
import { buildLogger } from '../src/services/Logger';
import { buildVmService } from '../src/services/VmService/buildVmService';

const activityFunction: AzureFunction = async function (
  context: Context,
  params
): Promise<void> {
  const logger = buildLogger(context.log, 'bootstrap');
  const operation = buildBoostrap({
    vmService: buildVmService(logger),
    logger,
  });

  await operation(params);
};

export default activityFunction;
