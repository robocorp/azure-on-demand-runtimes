import { HttpResponse } from './types';

export const buildAzureResponse = (httpResponse: HttpResponse) => {
  return {
    status: httpResponse.status,
    body: httpResponse.body,
  };
};
