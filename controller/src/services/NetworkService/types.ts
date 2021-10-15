import {
  NetworkInterface,
  PublicIPAddress,
} from '@azure/arm-network/esm/models';

export interface CreateInterfaceParams {
  vmName: string;
}

export interface CreateInterfaceResponse {
  interfaces: NetworkInterface[];
  publicIps: PublicIPAddress[];
}

export interface NetworkService {
  /**
   * create network interfaces for the virtual machines to use
   */
  createNetworkInterfaces(
    args: CreateInterfaceParams
  ): Promise<CreateInterfaceResponse>;
  destroyNetworkInterfaces(resource: CreateInterfaceResponse): Promise<void>;
}
