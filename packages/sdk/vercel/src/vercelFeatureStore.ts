import { EdgeConfigClient } from '@vercel/edge-config';
import type {
  DataKind,
  LDLogger,
  LDFeatureStore,
  LDFeatureStoreDataStorage,
  LDFeatureStoreItem,
  LDFeatureStoreKindData,
  interfaces,
} from '@launchdarkly/js-server-sdk-common-edge';
import { noop } from '@launchdarkly/js-server-sdk-common-edge';
// import { SerializedItemDescriptor } from '@launchdarkly/js-server-sdk-common/dist/api/interfaces';

interface VercelStorage {
  [namespace: string]: {
    [key: string]: {
      version: number;
      deleted?: boolean;
    };
  };
}

class VercelFeatureStore implements interfaces.PersistentDataStore {
  private edgeConfig: EdgeConfigClient;

  private configKey: string;

  private logger: LDLogger;

  constructor(edgeConfig: EdgeConfigClient, sdkKey: string, logger: LDLogger) {
    this.edgeConfig = edgeConfig;
    this.configKey = `LD-Env-${sdkKey}`;
    this.logger = logger;
  }

  init(
    allData: interfaces.KindKeyedStore<interfaces.PersistentStoreDataKind>,
    callback: () => void
  ): void {
    callback();
  }

  async get(
    kind: interfaces.PersistentStoreDataKind,
    key: string,
    callback: (descriptor: interfaces.SerializedItemDescriptor | undefined) => void
  ): Promise<void> {
    this.logger.debug(`Requesting ${key} from ${this.configKey}`);
    try {
      const config = await this.edgeConfig.get(this.configKey);
      if (config === null) {
        this.logger.error('Feature data not found in Edge Config.');
        callback(undefined);
        return;
      }
      const kindKey = kind.namespace === 'features' ? 'flags' : kind.namespace;
      const storage = config as VercelStorage;
      const serializedItem = JSON.stringify(storage[kindKey][key]);

      const descriptor: interfaces.SerializedItemDescriptor = {
        version: storage[kindKey][key].version,
        deleted: storage[kindKey][key].deleted,
        serializedItem,
      };
      // const item = config as LDFeatureStoreItem;
      callback(descriptor);
    } catch (err) {
      this.logger.error(err);
      callback(undefined);
    }
  }

  getAll(
    kind: interfaces.PersistentStoreDataKind,
    callback: (
      descriptors: KeyedItem<string, interfaces.SerializedItemDescriptor>[] | undefined
    ) => void
  ): void {
    throw new Error('Method not implemented.');
  }

  upsert(
    kind: interfaces.PersistentStoreDataKind,
    key: string,
    descriptor: interfaces.SerializedItemDescriptor,
    callback: (
      err?: Error | undefined,
      updatedDescriptor?: interfaces.SerializedItemDescriptor | undefined
    ) => void
  ): void {
    throw new Error('Method not implemented.');
  }

  initialized(callback: (isInitialized: boolean) => void): void {
    throw new Error('Method not implemented.');
  }

  close(): void {
    throw new Error('Method not implemented.');
  }

  getDescription(): string {
    throw new Error('Method not implemented.');
  }

  // async get(
  //   kind: DataKind,
  //   flagKey: string,
  //   callback: (res: LDFeatureStoreItem | null) => void
  // ): Promise<void> {
  //   this.logger.debug(`Requesting ${flagKey} from ${this.configKey}`);
  //   try {
  //     const config = await this.edgeConfig.get(this.configKey);
  //     if (config === null) {
  //       this.logger.error('Feature data not found in Edge Config.');
  //     }
  //     const kindKey = kind.namespace === 'features' ? 'flags' : kind.namespace;
  //     const item = config as LDFeatureStoreItem;
  //     callback(item[kindKey][flagKey]);
  //   } catch (err) {
  //     this.logger.error(err);
  //     callback(null);
  //   }
  // }

  // async all(kind: DataKind, callback: (res: LDFeatureStoreKindData) => void = noop): Promise<void> {
  //   const kindKey = kind.namespace === 'features' ? 'flags' : kind.namespace;
  //   this.logger.debug(`Requesting all ${kindKey} data from Edge Config.`);
  //   try {
  //     const config = await this.edgeConfig.get(this.configKey);
  //     if (config === null) {
  //       this.logger.error('Feature data not found in Edge Config.');
  //     }
  //     const item = config as LDFeatureStoreItem;
  //     callback(item[kindKey]);
  //   } catch (err) {
  //     this.logger.error(err);
  //     callback({});
  //   }
  // }

  // async initialized(callback: (isInitialized: boolean) => void = noop): Promise<void> {
  //   const config = await this.edgeConfig.get(this.configKey);
  //   const result = config !== null;
  //   this.logger.debug(`Is ${this.configKey} initialized? ${result}`);
  //   callback(result);
  // }

  // init(allData: LDFeatureStoreDataStorage, callback: () => void): void {
  //   callback();
  // }

  // getDescription(): string {
  //   return 'Vercel Edge Config';
  // }

  // // unused
  // close = noop;

  // delete = noop;

  // upsert = noop;
}

export default VercelFeatureStore;
