import * as migration_20250801_201804 from './20250801_201804';

export const migrations = [
  {
    up: migration_20250801_201804.up,
    down: migration_20250801_201804.down,
    name: '20250801_201804'
  },
];
