import * as migration_20250420_124049 from './20250420_124049';

export const migrations = [
  {
    up: migration_20250420_124049.up,
    down: migration_20250420_124049.down,
    name: '20250420_124049'
  },
];
