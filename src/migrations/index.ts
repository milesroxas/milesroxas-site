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
import * as migration_20260929_172901_mcp_api_keys from './20260929_172901_mcp_api_keys';
import * as migration_20260930_140439_figures from './20260930_140439_figures';
import * as migration_20260930_154412_carousel_split from './20260930_154412_carousel_split';
import * as migration_20260930_170149_carousel_tabs from './20260930_170149_carousel_tabs';
import * as migration_20260930_181644_carousel_tabs_header from './20260930_181644_carousel_tabs_header';
import * as migration_20261001_232240_band_theme_roles from './20261001_232240_band_theme_roles';
import * as migration_20261002_000427_block_type_scale from './20261002_000427_block_type_scale';
import * as migration_20261004_142345_work_hero from './20261004_142345_work_hero';
import * as migration_20261004_144246_clients_taxonomy from './20261004_144246_clients_taxonomy';
import * as migration_20261004_184000_carousel_tabs_deck_style from './20261004_184000_carousel_tabs_deck_style';
import * as migration_20261006_203301_works_index_global from './20261006_203301_works_index_global';
import * as migration_20261007_163506_posts_external_source from './20261007_163506_posts_external_source';
import * as migration_20261007_191027_post_hero_editorial from './20261007_191027_post_hero_editorial';
import * as migration_20261007_195634_link_index_page from './20261007_195634_link_index_page';
import * as migration_20261007_214502_media_sizes_sweep from './20261007_214502_media_sizes_sweep';

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
    name: '20260929_162031_contact_page',
  },
  {
    up: migration_20260929_172901_mcp_api_keys.up,
    down: migration_20260929_172901_mcp_api_keys.down,
    name: '20260929_172901_mcp_api_keys',
  },
  {
    up: migration_20260930_140439_figures.up,
    down: migration_20260930_140439_figures.down,
    name: '20260930_140439_figures',
  },
  {
    up: migration_20260930_154412_carousel_split.up,
    down: migration_20260930_154412_carousel_split.down,
    name: '20260930_154412_carousel_split',
  },
  {
    up: migration_20260930_170149_carousel_tabs.up,
    down: migration_20260930_170149_carousel_tabs.down,
    name: '20260930_170149_carousel_tabs',
  },
  {
    up: migration_20260930_181644_carousel_tabs_header.up,
    down: migration_20260930_181644_carousel_tabs_header.down,
    name: '20260930_181644_carousel_tabs_header',
  },
  {
    up: migration_20261001_232240_band_theme_roles.up,
    down: migration_20261001_232240_band_theme_roles.down,
    name: '20261001_232240_band_theme_roles',
  },
  {
    up: migration_20261002_000427_block_type_scale.up,
    down: migration_20261002_000427_block_type_scale.down,
    name: '20261002_000427_block_type_scale',
  },
  {
    up: migration_20261004_142345_work_hero.up,
    down: migration_20261004_142345_work_hero.down,
    name: '20261004_142345_work_hero',
  },
  {
    up: migration_20261004_144246_clients_taxonomy.up,
    down: migration_20261004_144246_clients_taxonomy.down,
    name: '20261004_144246_clients_taxonomy',
  },
  {
    up: migration_20261004_184000_carousel_tabs_deck_style.up,
    down: migration_20261004_184000_carousel_tabs_deck_style.down,
    name: '20261004_184000_carousel_tabs_deck_style',
  },
  {
    up: migration_20261006_203301_works_index_global.up,
    down: migration_20261006_203301_works_index_global.down,
    name: '20261006_203301_works_index_global',
  },
  {
    up: migration_20261007_163506_posts_external_source.up,
    down: migration_20261007_163506_posts_external_source.down,
    name: '20261007_163506_posts_external_source',
  },
  {
    up: migration_20261007_191027_post_hero_editorial.up,
    down: migration_20261007_191027_post_hero_editorial.down,
    name: '20261007_191027_post_hero_editorial',
  },
  {
    up: migration_20261007_195634_link_index_page.up,
    down: migration_20261007_195634_link_index_page.down,
    name: '20261007_195634_link_index_page',
  },
  {
    up: migration_20261007_214502_media_sizes_sweep.up,
    down: migration_20261007_214502_media_sizes_sweep.down,
    name: '20261007_214502_media_sizes_sweep'
  },
];
