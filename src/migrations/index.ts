import * as migration_20250420_233710 from './20250420_233710';
import * as migration_20250423_151516 from './20250423_151516';

export const migrations = [
  {
    up: migration_20250420_233710.up,
    down: migration_20250420_233710.down,
    name: '20250420_233710',
  },
  {
    up: migration_20250423_151516.up,
    down: migration_20250423_151516.down,
    name: '20250423_151516'
  },
];
