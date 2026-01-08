import * as migration_20250801_201804 from './20250801_201804';
import * as migration_20251230_185302 from './20251230_185302';
import * as migration_20260102_220803 from './20260102_220803';
import * as migration_20260104_214351 from './20260104_214351';
import * as migration_20260108_181702 from './20260108_181702';

export const migrations = [
  {
    up: migration_20250801_201804.up,
    down: migration_20250801_201804.down,
    name: '20250801_201804',
  },
  {
    up: migration_20251230_185302.up,
    down: migration_20251230_185302.down,
    name: '20251230_185302',
  },
  {
    up: migration_20260102_220803.up,
    down: migration_20260102_220803.down,
    name: '20260102_220803',
  },
  {
    up: migration_20260104_214351.up,
    down: migration_20260104_214351.down,
    name: '20260104_214351',
  },
  {
    up: migration_20260108_181702.up,
    down: migration_20260108_181702.down,
    name: '20260108_181702'
  },
];
