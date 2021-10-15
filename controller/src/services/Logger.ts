export type Logger = (...args: any[]) => void;
const globalIdentifier =
  process.env.INSTALLATION_NAME ?? 'cluster-controller-logs';
/*
This Kusto - query can be used in application insights to log spesifically what this function app is doing.
Seeing this otherwise is bit tricky because the durable function setup is rather verbose on all manner of lifecycle messages

  union traces
  | union exceptions
  | where timestamp > ago(30m)
  | order by timestamp asc
  | filter message has "cluster-controller-logs"
  | project
      timestamp,
      message = iff(message != '', message, iff(innermostMessage != '', innermostMessage, customDimensions.['prop__{OriginalFormat}']))  
*/

export const buildLogger = (
  logFunction: Logger,
  localIdentifier: string,
  noop = false
) => {
  return (...args: any[]) => {
    if (noop) {
      return;
    }
    logFunction(`[${globalIdentifier}:${localIdentifier}]`, ...args);
  };
};
