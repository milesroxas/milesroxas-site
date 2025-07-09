import * as migration_20250704_215356 from './20250704_215356';
import * as migration_20250709_015705 from './20250709_015705';

export const migrations = [
  {
    up: migration_20250704_215356.up,
    down: migration_20250704_215356.down,
    name: '20250704_215356',
  },
  {
    up: migration_20250709_015705.up,
    down: migration_20250709_015705.down,
    name: '20250709_015705'
  },
];
