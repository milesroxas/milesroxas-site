import * as migration_20250801_201804 from './20250801_201804'
import * as migration_20251230_185302 from './20251230_185302'

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
]
