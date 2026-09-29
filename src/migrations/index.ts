import * as migration_20250801_201804 from './20250801_201804';
import * as migration_20251230_185302 from './20251230_185302';
import * as migration_20260102_220803 from './20260102_220803';
import * as migration_20260104_214351 from './20260104_214351';
import * as migration_20260108_181702 from './20260108_181702';
import * as migration_20260124_093816 from './20260124_093816';
import * as migration_20260216_150700 from './20260216_150700';
import * as migration_20260408_182902 from './20260408_182902';
import * as migration_20260408_202943 from './20260408_202943';
import * as migration_20260702_221932_remove_footer_global from './20260702_221932_remove_footer_global';
import * as migration_20260926_213954_payload_3_90_upgrade from './20260926_213954_payload_3_90_upgrade';
import * as migration_20260927_171656_streak_studio from './20260927_171656_streak_studio';
import * as migration_20260927_173548_sections_and_run from './20260927_173548_sections_and_run';
import * as migration_20260927_175225_opening_intro_contents from './20260927_175225_opening_intro_contents';
import * as migration_20260927_180824_ask from './20260927_180824_ask';
import * as migration_20260929_013625_ask_suggestions from './20260929_013625_ask_suggestions';
import * as migration_20260929_162031_contact_page from './20260929_162031_contact_page';

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
    name: '20260108_181702',
  },
  {
    up: migration_20260124_093816.up,
    down: migration_20260124_093816.down,
    name: '20260124_093816',
  },
  {
    up: migration_20260216_150700.up,
    down: migration_20260216_150700.down,
    name: '20260216_150700',
  },
  {
    up: migration_20260408_182902.up,
    down: migration_20260408_182902.down,
    name: '20260408_182902',
  },
  {
    up: migration_20260408_202943.up,
    down: migration_20260408_202943.down,
    name: '20260408_202943',
  },
  {
    up: migration_20260702_221932_remove_footer_global.up,
    down: migration_20260702_221932_remove_footer_global.down,
    name: '20260702_221932_remove_footer_global',
  },
  {
    up: migration_20260926_213954_payload_3_90_upgrade.up,
    down: migration_20260926_213954_payload_3_90_upgrade.down,
    name: '20260926_213954_payload_3_90_upgrade',
  },
  {
    up: migration_20260927_171656_streak_studio.up,
    down: migration_20260927_171656_streak_studio.down,
    name: '20260927_171656_streak_studio',
  },
  {
    up: migration_20260927_173548_sections_and_run.up,
    down: migration_20260927_173548_sections_and_run.down,
    name: '20260927_173548_sections_and_run',
  },
  {
    up: migration_20260927_175225_opening_intro_contents.up,
    down: migration_20260927_175225_opening_intro_contents.down,
    name: '20260927_175225_opening_intro_contents',
  },
  {
    up: migration_20260927_180824_ask.up,
    down: migration_20260927_180824_ask.down,
    name: '20260927_180824_ask',
  },
  {
    up: migration_20260929_013625_ask_suggestions.up,
    down: migration_20260929_013625_ask_suggestions.down,
    name: '20260929_013625_ask_suggestions',
  },
  {
    up: migration_20260929_162031_contact_page.up,
    down: migration_20260929_162031_contact_page.down,
    name: '20260929_162031_contact_page'
  },
];
