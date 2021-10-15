import { ComputeManagementClient } from '@azure/arm-compute';
import { VirtualMachine } from '@azure/arm-compute/esm/models';
import { NetworkInterface } from '@azure/arm-network/esm/models';
import { ApplicationError } from '../../ApplicationError';
import { delay } from '../../delay';
import { BootstrapVmParams } from '../../types';
import { Logger } from '../Logger';
import { autologon } from './autologon';

interface WithLinkToken {
  linkToken: string;
}

interface WithName {
  name: string;
}

interface WithNetworkInterfaces {
  networkInterfaces: NetworkInterface[];
}

export type RunCommandArguments = WithName & { command: string[] };

export type StartVmArguments = WithLinkToken &
  WithNetworkInterfaces &
  BootstrapVmParams;

interface VMServiceContext {
  computeClient: ComputeManagementClient;
  vmResourceGroupName: string;
  customImageResourceGroupName: string;
  customImageId: string;
  region: string;
  logger: Logger;
}

export class VMService {
  constructor(protected context: VMServiceContext) {}

  async destroyVM(vm: VirtualMachine) {
    const { computeClient, vmResourceGroupName, logger } = this.context;

    logger(`deleting vm ${vm.name}`);
    await computeClient.virtualMachines.deleteMethod(
      vmResourceGroupName,
      vm.name!
    );

    await delay(500);
    const disks: string[] =
      vm.storageProfile!.dataDisks!.map((it) => it.name!) ?? [];
    disks.push(vm.storageProfile!.osDisk!.name!);
    const diskDeleteOps = disks.map((it) => {
      logger(`deleting disk ${it}`);
      return computeClient.disks.deleteMethod(vmResourceGroupName, it);
    });
    const res = await Promise.all(diskDeleteOps);
    logger(res);
  }

  protected getVirtualMachineConfig = async (
    args: StartVmArguments
  ): Promise<VirtualMachine> => {
    const { region, logger } = this.context;
    logger('get virtual machine configuration');

    const virtualMachine: VirtualMachine = {
      location: region,
      networkProfile: {
        networkInterfaces: args.networkInterfaces,
      },
      hardwareProfile: {
        vmSize: 'Standard_D2_v2',
      },
      storageProfile: {
        imageReference: {
          id: this.context.customImageId,
        },
      },
      osProfile: {
        computerName: args.domain,
        // TODO fetch these from secrets dynamically
        adminUsername: args.username,
        adminPassword: args.password,
        customData: this.buildCustomDataString({
          RC_WORKER_LINK_TOKEN: args.linkToken,
          RC_WORKER_NAME: args.domain,
        }),
      },
    };

    logger('new vm configuration formulated');
    return virtualMachine;
  };

  protected buildCustomDataString(args: Record<string, string>): string {
    const jsonString = JSON.stringify(args);
    const buffer = Buffer.from(jsonString);
    return buffer.toString('base64');
  }

  async startVM(args: StartVmArguments) {
    const { computeClient, vmResourceGroupName, logger } = this.context;
    const virtualMachine = await this.getVirtualMachineConfig(args);
    logger(`start VM with name ${args.domain}`);
    const res = await computeClient.virtualMachines.createOrUpdate(
      vmResourceGroupName,
      args.domain,
      virtualMachine
    );

    if (res._response.status !== 200) {
      throw new ApplicationError({
        code: 'VM_CREATION_FAILED',
        message: 'could not create a virtual machine',
      });
    }

    return res;
  }

  async runCommand(args: RunCommandArguments) {
    const { computeClient, vmResourceGroupName, logger } = this.context;
    const command = args.command;
    logger(`running command ${command} against ${args.name}`);
    const res = await computeClient.virtualMachines.runCommand(
      vmResourceGroupName,
      args.name,
      {
        commandId: 'RunPowerShellScript',
        script: command,
      }
    );
    if (res._response.status !== 200) {
      throw new Error('invoking command failed');
    }
    return res;
  }

  async restartVm(args: WithName) {
    const { computeClient, vmResourceGroupName, logger } = this.context;
    logger(`restarting VM ${args.name}`);
    await computeClient.virtualMachines.restart(vmResourceGroupName, args.name);
  }
}
