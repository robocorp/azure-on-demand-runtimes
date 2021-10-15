import { AzureFunction, Context } from '@azure/functions';
import { buildVmConfigurationProvisioner } from '../src/operations/vmConfigurationProvision';
import { buildLogger } from '../src/services/Logger';
import { buildDefaultPasswordService } from '../src/services/PasswordService';
import { OnDemandRuntimeRequestStart, StartRobotRunParams } from '../src/types';

const activityFunction: AzureFunction = async function (
  context: Context,
  request: OnDemandRuntimeRequestStart
): Promise<StartRobotRunParams> {
  const logger = buildLogger(context.log, 'vmConfigurationProvider');
  const operation = buildVmConfigurationProvisioner({
    logger,
    passwordService: buildDefaultPasswordService(),
  });
  const result = await operation(request);
  return result;
};

export default activityFunction;
