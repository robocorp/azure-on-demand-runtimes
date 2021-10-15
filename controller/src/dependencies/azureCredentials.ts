import { ManagedIdentityCredential } from '@azure/identity';

export const credentials = new ManagedIdentityCredential(
  process.env.IDENTITY_ID!
);
