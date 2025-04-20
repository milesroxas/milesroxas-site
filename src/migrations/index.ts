import * as migration_20250420_233710 from './20250420_233710';

export const migrations = [
  {
    up: migration_20250420_233710.up,
    down: migration_20250420_233710.down,
    name: '20250420_233710'
  },
];
