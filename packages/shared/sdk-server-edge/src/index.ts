/**
 * This is the internal API reference for the common code shared between
 * LaunchDarkly Edge SDKs.
 *
 * Do not use this package directly in a cloud worker.
 *
 */
import type { Info } from '@launchdarkly/js-server-sdk-common';
import { LDClient, EdgeFeatureStore, EdgeProvider } from './api';
import validateOptions, { LDOptions, LDOptionsInternal } from './utils/validateOptions';

export * from '@launchdarkly/js-server-sdk-common';
export { EdgeFeatureStore };
export type { LDClient, LDOptions, EdgeProvider };

/**
 * Do not use this function directly.
 *
 * This is an internal API to be used directly only by LaunchDarkly Edge SDKs.
 */
export const init = (sdkKey: string, platformInfo: Info, options: LDOptionsInternal) => {
  // this throws if options are invalid
  validateOptions(sdkKey, options);

  return new LDClient(sdkKey, platformInfo, options);
};
