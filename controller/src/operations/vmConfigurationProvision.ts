import { Logger } from '../services/Logger';
import { PasswordService } from '../services/PasswordService';
import { OnDemandRuntimeRequestStart, StartRobotRunParams } from '../types';

export interface Dependencies {
  passwordService: PasswordService;
  logger: Logger;
}

export const buildVmConfigurationProvisioner =
  (dependencies: Dependencies) =>
  async (
    request: OnDemandRuntimeRequestStart
  ): Promise<StartRobotRunParams> => {
    const part1 = request.runtimeId.split('-').pop()?.slice(-5);
    const part2 = Date.now().toString().slice(-4);

    if (!part1 || !part2) throw new Error('forming domain failed');

    return {
      linkToken: request.runtimeLinkToken,
      domain: `rt${part1}${part2}`,
      password: await dependencies.passwordService.generatePassword(),
      username: 'azureuser',
    };
  };
