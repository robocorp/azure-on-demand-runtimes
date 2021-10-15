import { VirtualMachine } from '@azure/arm-compute/esm/models';
import { CreateInterfaceResponse } from './services/NetworkService';

export interface BootstrapVmParams {
  username: string;
  password: string;
  domain: string;
}

export interface StartRobotRunParams extends BootstrapVmParams {
  linkToken: string;
}

export interface DynamicResources {
  virtualMachine: VirtualMachine;
  networkResources: CreateInterfaceResponse;
}

export type BodyType = Record<string, unknown>;

export interface HttpResponse {
  status: number;
  body?: BodyType;
}

export enum onDemandRuntimeRequestType {
  START = 'start',
  STATUS = 'status',
  STOP = 'stop',
}
export interface OnDemandRuntimeRequestStart {
  type: onDemandRuntimeRequestType.START;
  workspaceId: string;
  runtimeLinkToken: string;
  runtimeId: string;
  maxLifetimeSeconds: number;
}

export interface OnDemandRuntimeRequestStatus {
  type: onDemandRuntimeRequestType.STATUS;
}

export interface OnDemandRuntimeRequestStop {
  type: onDemandRuntimeRequestType.STOP;
  workspaceId: string;
  runtimeId: string;
}

export interface OnDemandRuntimeRequestStatusResponse {
  version: string;
  status: string;
}

export type OnDemandRuntimeRequest =
  | OnDemandRuntimeRequestStart
  | OnDemandRuntimeRequestStatus
  | OnDemandRuntimeRequestStop;

export enum OrchestrationEventTypes {
  STOP = 'STOP',
}
