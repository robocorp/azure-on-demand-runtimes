import { Logger } from '../services/Logger';
import { VMService } from '../services/VmService';
import { BootstrapVmParams } from '../types';

interface Dependencies {
  vmService: VMService;
  logger: Logger;
}

export const buildBoostrap =
  (dependencies: Dependencies) => async (args: BootstrapVmParams) => {
    const { username, password, domain } = args;
    const { vmService, logger } = dependencies;
    logger('run startup command');
    const commands = [
      '$RegPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon"',
      `Set-ItemProperty $RegPath "AutoAdminLogon" -Value "1" -type String `,
      `Set-ItemProperty $RegPath "DefaultUsername" -Value "${username}" -type String `,
      `Set-ItemProperty $RegPath "DefaultDomainName" -Value "${domain}" -type String`,
      `Set-ItemProperty $RegPath "DefaultPassword" -Value "${password}" -type String`,
      `schtasks.exe /create /TN rcagent /IT /RU "${username}" /SC ONLOGON  /TR "powershell.exe -file C:\\\\robocorp\\startup.ps1"`,
    ];

    logger('manipulating registry and setting up startup task for the machine');
    const res: any = await vmService.runCommand({
      name: domain,
      command: commands,
    });

    logger(res?.properties?.output?.value);

    logger('restarting vm');
    await vmService.restartVm({
      name: args.domain,
    });

    logger('boostrap complete');
  };
