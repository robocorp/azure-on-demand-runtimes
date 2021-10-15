const errorCodes = [
  'VM_IMAGE_NOT_FOUND',
  'VM_CREATION_FAILED',
  'VM_INIT_FAILED',
  'VM_STOP_FAILED',
  'NIC_CREATION_FAILED',
  'NIC_DELETION_FAILED',
  'UNKNOWN_ERROR',
] as const;

export type ApplicationErrorCode = typeof errorCodes[number];

export interface ApplicationErrorConfig {
  message?: string;
  code: ApplicationErrorCode;
}

export class ApplicationError extends Error {
  constructor(config: ApplicationErrorConfig) {
    super(config.message);
    this.code = config.code;
  }

  code: string;
  status: number;
}
