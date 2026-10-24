import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_transition_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement', 'prose');
  CREATE TYPE "public"."enum_home_transition_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_transition_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_home_transition_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_feature_heading_offset_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_blocks_feature_heading_offset_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_full_media_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_home_full_media_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_home_full_media_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_full_media_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_home_full_media_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_home_full_media_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_home_full_media_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_media_split_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_home_media_split_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_home_media_split_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_media_split_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_home_media_split_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_home_media_split_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_split_narrow_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_home_split_narrow_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_home_split_narrow_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_home_split_narrow_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_carousel_split_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_blocks_carousel_split_carousel_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_home_blocks_carousel_split_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_home_blocks_carousel_split_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_image_pair_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_image_pair_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_home_image_pair_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum_home_image_pair_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_split_offset_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_split_offset_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_home_split_offset_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_image_statement_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_image_statement_text_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_home_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum_home_image_statement_aspect_ratio" AS ENUM('responsive', '16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_home_image_statement_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_caption_size" AS ENUM('full', 'contained', 'inset', 'small');
  CREATE TYPE "public"."enum_home_caption_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_youtube_size" AS ENUM('full', 'contained', 'inset', 'small');
  CREATE TYPE "public"."enum_home_youtube_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_rich_text_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_rich_text_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_code_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum_home_chart_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_home_chart_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_diagram_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_home_diagram_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_faq_link_type" AS ENUM('reference', 'index', 'custom');
  CREATE TYPE "public"."enum_home_faq_link_index_page" AS ENUM('works', 'posts', 'contact', 'ask');
  CREATE TYPE "public"."enum_home_faq_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_faq_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_home_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_home_blocks_carousel_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_carousel_tabs_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_blocks_carousel_tabs_deck_style" AS ENUM('coverflow', 'stack');
  CREATE TYPE "public"."enum_home_blocks_carousel_tabs_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_home_blocks_carousel_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_home_blocks_carousel_tabs_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_feature_tabs_tabs_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_home_blocks_feature_tabs_tabs_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_home_blocks_feature_tabs_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_home_blocks_feature_tabs_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_insight_list_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_home_insight_list_layout" AS ENUM('side', 'stacked', 'ledger');
  CREATE TYPE "public"."enum_home_insight_list_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_home_insight_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_content_columns_sizes" AS ENUM('oneThird', 'half', 'twoThirds', 'fiveCols', 'full');
  CREATE TYPE "public"."enum_home_blocks_content_columns_content" AS ENUM('text', 'sectionHeading', 'work', 'post', 'media', 'slider', 'youTube');
  CREATE TYPE "public"."enum_home_blocks_content_columns_text_text_size" AS ENUM('sm', 'base', 'lg', 'xl', '2xl');
  CREATE TYPE "public"."enum_home_blocks_content_columns_text_link_type" AS ENUM('reference', 'index', 'custom');
  CREATE TYPE "public"."enum_home_blocks_content_columns_text_link_index_page" AS ENUM('works', 'posts', 'contact', 'ask');
  CREATE TYPE "public"."enum_home_blocks_content_columns_text_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_home_blocks_content_columns_section_heading_size" AS ENUM('base', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_content_columns_section_heading_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_home_blocks_content_columns_section_heading_style" AS ENUM('default', 'border', 'jumbo');
  CREATE TYPE "public"."enum_home_blocks_content_columns_work_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum_home_blocks_content_columns_work_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum_home_blocks_content_columns_post_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum_home_blocks_content_columns_post_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum_home_blocks_content_columns_slider_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_content_columns_slider_intro_content_size" AS ENUM('base', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_content_columns_slider_intro_content_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_home_blocks_content_columns_slider_style" AS ENUM('default', 'cropped', 'single');
  CREATE TYPE "public"."enum_home_blocks_content_columns_slider_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_content_columns_slider_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_content_columns_slider_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_content_columns_slider_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_content_columns_media_aspect_ratio" AS ENUM('square', 'landscape', 'portrait', 'original');
  CREATE TYPE "public"."enum_home_blocks_content_columns_media_caption_size" AS ENUM('normal', 'large', 'xl');
  CREATE TYPE "public"."enum_home_blocks_content_columns_you_tube_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
  CREATE TYPE "public"."enum_home_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_content_container_width" AS ENUM('contained', 'fullWidth');
  CREATE TYPE "public"."enum_home_blocks_content_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_content_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_content_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_content_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_section_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_section_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_home_section_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_home_blocks_slider_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_slider_intro_content_size" AS ENUM('base', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_slider_intro_content_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_home_blocks_slider_style" AS ENUM('default', 'cropped', 'single');
  CREATE TYPE "public"."enum_home_blocks_slider_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_slider_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_slider_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_slider_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_archive_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_archive_card_style" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum_home_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_home_blocks_archive_relation_to" AS ENUM('posts', 'works');
  CREATE TYPE "public"."enum_home_blocks_cta_links_link_type" AS ENUM('reference', 'index', 'custom');
  CREATE TYPE "public"."enum_home_blocks_cta_links_link_index_page" AS ENUM('works', 'posts', 'contact', 'ask');
  CREATE TYPE "public"."enum_home_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_home_blocks_form_block_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_form_block_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_form_block_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_form_block_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_form_block_intro_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_home_blocks_media_block_aspect_ratio" AS ENUM('landscape', 'square', 'portrait', 'original');
  CREATE TYPE "public"."enum_home_blocks_media_block_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_media_block_caption_layout" AS ENUM('center', 'left', 'right', 'split-left', 'split-right');
  CREATE TYPE "public"."enum_home_blocks_media_block_text_size" AS ENUM('sm', 'base', 'lg', 'xl', '2xl');
  CREATE TYPE "public"."enum_home_blocks_media_block_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_media_block_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_media_block_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_blocks_media_block_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum___home_v_transition_v_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement', 'prose');
  CREATE TYPE "public"."enum___home_v_transition_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_transition_v_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum___home_v_transition_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_feature_heading_offset_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum__home_v_blocks_feature_heading_offset_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_full_media_v_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum___home_v_full_media_v_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___home_v_full_media_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_full_media_v_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum___home_v_full_media_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___home_v_full_media_v_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___home_v_full_media_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_media_split_v_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum___home_v_media_split_v_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___home_v_media_split_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_media_split_v_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___home_v_media_split_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___home_v_media_split_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_split_narrow_v_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum___home_v_split_narrow_v_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___home_v_split_narrow_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___home_v_split_narrow_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_split_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_split_carousel_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_split_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_split_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_image_pair_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_image_pair_v_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___home_v_image_pair_v_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum___home_v_image_pair_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_split_offset_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_split_offset_v_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___home_v_split_offset_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_image_statement_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_image_statement_v_text_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___home_v_image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum___home_v_image_statement_v_aspect_ratio" AS ENUM('responsive', '16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___home_v_image_statement_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_caption_v_size" AS ENUM('full', 'contained', 'inset', 'small');
  CREATE TYPE "public"."enum___home_v_caption_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_youtube_v_size" AS ENUM('full', 'contained', 'inset', 'small');
  CREATE TYPE "public"."enum___home_v_youtube_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_rich_text_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_rich_text_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_code_v_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum___home_v_chart_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___home_v_chart_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_diagram_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___home_v_diagram_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_faq_v_link_type" AS ENUM('reference', 'index', 'custom');
  CREATE TYPE "public"."enum___home_v_faq_v_link_index_page" AS ENUM('works', 'posts', 'contact', 'ask');
  CREATE TYPE "public"."enum___home_v_faq_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_faq_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_tabs_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_tabs_deck_style" AS ENUM('coverflow', 'stack');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_tabs_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_tabs_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_feature_tabs_tabs_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum__home_v_blocks_feature_tabs_tabs_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum__home_v_blocks_feature_tabs_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum__home_v_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__home_v_blocks_feature_tabs_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_insight_list_v_text_size" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum___home_v_insight_list_v_layout" AS ENUM('side', 'stacked', 'ledger');
  CREATE TYPE "public"."enum___home_v_insight_list_v_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___home_v_insight_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_sizes" AS ENUM('oneThird', 'half', 'twoThirds', 'fiveCols', 'full');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_content" AS ENUM('text', 'sectionHeading', 'work', 'post', 'media', 'slider', 'youTube');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_text_text_size" AS ENUM('sm', 'base', 'lg', 'xl', '2xl');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_text_link_type" AS ENUM('reference', 'index', 'custom');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_text_link_index_page" AS ENUM('works', 'posts', 'contact', 'ask');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_text_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_section_heading_size" AS ENUM('base', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_section_heading_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_section_heading_style" AS ENUM('default', 'border', 'jumbo');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_work_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_work_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_post_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_post_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_slider_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_slider_intro_content_size" AS ENUM('base', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_slider_intro_content_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_slider_style" AS ENUM('default', 'cropped', 'single');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_slider_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_slider_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_slider_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_slider_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_media_aspect_ratio" AS ENUM('square', 'landscape', 'portrait', 'original');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_media_caption_size" AS ENUM('normal', 'large', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_you_tube_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
  CREATE TYPE "public"."enum__home_v_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_content_container_width" AS ENUM('contained', 'fullWidth');
  CREATE TYPE "public"."enum__home_v_blocks_content_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_content_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_content_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_content_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum___home_v_section_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_section_v_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___home_v_section_v_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum__home_v_blocks_slider_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_slider_intro_content_size" AS ENUM('base', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_slider_intro_content_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__home_v_blocks_slider_style" AS ENUM('default', 'cropped', 'single');
  CREATE TYPE "public"."enum__home_v_blocks_slider_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_slider_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_slider_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_slider_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_archive_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_archive_card_style" AS ENUM('card', 'featured');
  CREATE TYPE "public"."enum__home_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__home_v_blocks_archive_relation_to" AS ENUM('posts', 'works');
  CREATE TYPE "public"."enum__home_v_blocks_cta_links_link_type" AS ENUM('reference', 'index', 'custom');
  CREATE TYPE "public"."enum__home_v_blocks_cta_links_link_index_page" AS ENUM('works', 'posts', 'contact', 'ask');
  CREATE TYPE "public"."enum__home_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__home_v_blocks_form_block_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_form_block_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_form_block_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_form_block_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_form_block_intro_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__home_v_blocks_media_block_aspect_ratio" AS ENUM('landscape', 'square', 'portrait', 'original');
  CREATE TYPE "public"."enum__home_v_blocks_media_block_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_media_block_caption_layout" AS ENUM('center', 'left', 'right', 'split-left', 'split-right');
  CREATE TYPE "public"."enum__home_v_blocks_media_block_text_size" AS ENUM('sm', 'base', 'lg', 'xl', '2xl');
  CREATE TYPE "public"."enum__home_v_blocks_media_block_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_media_block_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_media_block_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_blocks_media_block_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "home_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"layout" "enum_home_transition_layout" DEFAULT 'offset',
  	"text_size" "enum_home_transition_text_size" DEFAULT 'small',
  	"heading_level" "enum_home_transition_heading_level" DEFAULT 'h2',
  	"theme" "enum_home_transition_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"text_size" "enum_home_blocks_feature_heading_offset_text_size" DEFAULT 'small',
  	"theme" "enum_home_blocks_feature_heading_offset_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_full_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"play_video" boolean DEFAULT false,
  	"video_id" integer,
  	"media_id" integer,
  	"visual_type" "enum_home_full_media_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_home_full_media_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"text_size" "enum_home_full_media_text_size" DEFAULT 'small',
  	"width" "enum_home_full_media_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_home_full_media_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum_home_full_media_content_position" DEFAULT 'left',
  	"theme" "enum_home_full_media_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_media_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"play_video" boolean DEFAULT false,
  	"video_id" integer,
  	"media_id" integer,
  	"visual_type" "enum_home_media_split_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_home_media_split_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"text_size" "enum_home_media_split_text_size" DEFAULT 'small',
  	"layout" "enum_home_media_split_layout" DEFAULT 'left',
  	"aspect_ratio" "enum_home_media_split_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum_home_media_split_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_split_narrow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"play_video" boolean DEFAULT false,
  	"video_id" integer,
  	"media_id" integer,
  	"visual_type" "enum_home_split_narrow_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_home_split_narrow_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"text_size" "enum_home_split_narrow_text_size" DEFAULT 'small',
  	"image_position" "enum_home_split_narrow_image_position" DEFAULT 'left',
  	"theme" "enum_home_split_narrow_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_carousel_split_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "home_blocks_carousel_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"text_size" "enum_home_blocks_carousel_split_text_size" DEFAULT 'small',
  	"carousel_position" "enum_home_blocks_carousel_split_carousel_position" DEFAULT 'right',
  	"slide_size" "enum_home_blocks_carousel_split_slide_size" DEFAULT 'full',
  	"show_arrows" boolean DEFAULT false,
  	"theme" "enum_home_blocks_carousel_split_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"text_size" "enum_home_image_pair_text_size" DEFAULT 'small',
  	"portrait_position" "enum_home_image_pair_portrait_position" DEFAULT 'left',
  	"text_position" "enum_home_image_pair_text_position" DEFAULT 'under-portrait',
  	"theme" "enum_home_image_pair_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_split_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"text_size" "enum_home_split_offset_text_size" DEFAULT 'small',
  	"caption_position" "enum_home_split_offset_caption_position" DEFAULT 'left',
  	"theme" "enum_home_split_offset_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" jsonb,
  	"text_size" "enum_home_image_statement_text_size" DEFAULT 'small',
  	"text_position" "enum_home_image_statement_text_position" DEFAULT 'left',
  	"image_width" "enum_home_image_statement_image_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_home_image_statement_aspect_ratio" DEFAULT 'responsive',
  	"theme" "enum_home_image_statement_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_caption" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"play_video" boolean DEFAULT false,
  	"video_id" integer,
  	"media_id" integer,
  	"caption_override" jsonb,
  	"size" "enum_home_caption_size",
  	"theme" "enum_home_caption_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_youtube" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum_home_youtube_size",
  	"theme" "enum_home_youtube_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"text_size" "enum_home_rich_text_text_size" DEFAULT 'small',
  	"theme" "enum_home_rich_text_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_home_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_home_chart_width" DEFAULT 'wide',
  	"theme" "enum_home_chart_theme" DEFAULT 'default',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_diagram" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_home_diagram_width" DEFAULT 'wide',
  	"theme" "enum_home_diagram_theme" DEFAULT 'default',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "home_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum_home_faq_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_index_page" "enum_home_faq_link_index_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"text_size" "enum_home_faq_text_size" DEFAULT 'small',
  	"theme" "enum_home_faq_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "home_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_home_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum_home_blocks_carousel_slide_size" DEFAULT 'full',
  	"theme" "enum_home_blocks_carousel_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_carousel_tabs_tabs_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "home_blocks_carousel_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "home_blocks_carousel_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"text_size" "enum_home_blocks_carousel_tabs_text_size" DEFAULT 'small',
  	"deck_style" "enum_home_blocks_carousel_tabs_deck_style" DEFAULT 'coverflow',
  	"slide_size" "enum_home_blocks_carousel_tabs_slide_size" DEFAULT 'full',
  	"show_arrows" boolean DEFAULT false,
  	"tab_size" "enum_home_blocks_carousel_tabs_tab_size" DEFAULT 'default',
  	"theme" "enum_home_blocks_carousel_tabs_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"visual_type" "enum_home_blocks_feature_tabs_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_home_blocks_feature_tabs_tabs_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "home_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text_size" "enum_home_blocks_feature_tabs_text_size" DEFAULT 'small',
  	"tab_size" "enum_home_blocks_feature_tabs_tab_size" DEFAULT 'default',
  	"theme" "enum_home_blocks_feature_tabs_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_insight_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "home_insight_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"text_size" "enum_home_insight_list_text_size" DEFAULT 'small',
  	"layout" "enum_home_insight_list_layout" DEFAULT 'side',
  	"mark_size" "enum_home_insight_list_mark_size" DEFAULT 'medium',
  	"theme" "enum_home_insight_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_content_columns_slider_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slide_image_id" integer,
  	"slide_caption" varchar
  );
  
  CREATE TABLE "home_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sizes" "enum_home_blocks_content_columns_sizes" DEFAULT 'oneThird',
  	"content" "enum_home_blocks_content_columns_content" DEFAULT 'text',
  	"text_rich_text" jsonb DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb,
  	"text_text_size" "enum_home_blocks_content_columns_text_text_size" DEFAULT 'base',
  	"text_enable_link" boolean,
  	"text_link_type" "enum_home_blocks_content_columns_text_link_type" DEFAULT 'reference',
  	"text_link_new_tab" boolean,
  	"text_link_index_page" "enum_home_blocks_content_columns_text_link_index_page",
  	"text_link_url" varchar,
  	"text_link_label" varchar,
  	"text_link_appearance" "enum_home_blocks_content_columns_text_link_appearance" DEFAULT 'default',
  	"section_heading_eyebrow" varchar,
  	"section_heading_content" jsonb DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb,
  	"section_heading_size" "enum_home_blocks_content_columns_section_heading_size" DEFAULT 'base',
  	"section_heading_align" "enum_home_blocks_content_columns_section_heading_align" DEFAULT 'left',
  	"section_heading_style" "enum_home_blocks_content_columns_section_heading_style" DEFAULT 'default',
  	"work_works_id" integer,
  	"work_aspect" "enum_home_blocks_content_columns_work_aspect" DEFAULT 'wide',
  	"work_variant" "enum_home_blocks_content_columns_work_variant" DEFAULT 'featured',
  	"post_posts_id" integer,
  	"post_aspect" "enum_home_blocks_content_columns_post_aspect" DEFAULT 'wide',
  	"post_variant" "enum_home_blocks_content_columns_post_variant" DEFAULT 'featured',
  	"slider_theme" "enum_home_blocks_content_columns_slider_theme" DEFAULT 'default',
  	"slider_intro_content_heading" varchar,
  	"slider_intro_content_subheading" varchar,
  	"slider_intro_content_size" "enum_home_blocks_content_columns_slider_intro_content_size" DEFAULT 'base',
  	"slider_intro_content_align" "enum_home_blocks_content_columns_slider_intro_content_align" DEFAULT 'left',
  	"slider_style" "enum_home_blocks_content_columns_slider_style" DEFAULT 'default',
  	"slider_space_pt" "enum_home_blocks_content_columns_slider_space_pt" DEFAULT 'md',
  	"slider_space_pb" "enum_home_blocks_content_columns_slider_space_pb" DEFAULT 'md',
  	"slider_space_mt" "enum_home_blocks_content_columns_slider_space_mt" DEFAULT 'none',
  	"slider_space_mb" "enum_home_blocks_content_columns_slider_space_mb" DEFAULT 'none',
  	"media_media_id" integer,
  	"media_aspect_ratio" "enum_home_blocks_content_columns_media_aspect_ratio" DEFAULT 'landscape',
  	"media_full_width" boolean DEFAULT false,
  	"media_caption_size" "enum_home_blocks_content_columns_media_caption_size" DEFAULT 'normal',
  	"you_tube_url" varchar,
  	"you_tube_aspect_ratio" "enum_home_blocks_content_columns_you_tube_aspect_ratio" DEFAULT 'landscape',
  	"you_tube_full_width" boolean DEFAULT false
  );
  
  CREATE TABLE "home_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_home_blocks_content_theme" DEFAULT 'default',
  	"container_width" "enum_home_blocks_content_container_width" DEFAULT 'contained',
  	"space_pt" "enum_home_blocks_content_space_pt" DEFAULT 'md',
  	"space_pb" "enum_home_blocks_content_space_pb" DEFAULT 'md',
  	"space_mt" "enum_home_blocks_content_space_mt" DEFAULT 'none',
  	"space_mb" "enum_home_blocks_content_space_mb" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum_home_section_theme" DEFAULT 'default',
  	"spacing" "enum_home_section_spacing" DEFAULT 'default',
  	"stack" "enum_home_section_stack" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_slider_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slide_image_id" integer,
  	"slide_caption" varchar
  );
  
  CREATE TABLE "home_blocks_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_home_blocks_slider_theme" DEFAULT 'default',
  	"intro_content_heading" varchar,
  	"intro_content_subheading" varchar,
  	"intro_content_size" "enum_home_blocks_slider_intro_content_size" DEFAULT 'base',
  	"intro_content_align" "enum_home_blocks_slider_intro_content_align" DEFAULT 'left',
  	"style" "enum_home_blocks_slider_style" DEFAULT 'default',
  	"space_pt" "enum_home_blocks_slider_space_pt" DEFAULT 'md',
  	"space_pb" "enum_home_blocks_slider_space_pb" DEFAULT 'md',
  	"space_mt" "enum_home_blocks_slider_space_mt" DEFAULT 'none',
  	"space_mb" "enum_home_blocks_slider_space_mb" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_home_blocks_archive_theme" DEFAULT 'default',
  	"card_style" "enum_home_blocks_archive_card_style" DEFAULT 'card',
  	"intro_content" jsonb,
  	"populate_by" "enum_home_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_home_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_home_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_index_page" "enum_home_blocks_cta_links_link_index_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_home_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "home_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"space_pt" "enum_home_blocks_form_block_space_pt" DEFAULT 'md',
  	"space_pb" "enum_home_blocks_form_block_space_pb" DEFAULT 'md',
  	"space_mt" "enum_home_blocks_form_block_space_mt" DEFAULT 'none',
  	"space_mb" "enum_home_blocks_form_block_space_mb" DEFAULT 'none',
  	"enable_intro" boolean,
  	"intro_align" "enum_home_blocks_form_block_intro_align" DEFAULT 'left',
  	"intro_content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"aspect_ratio" "enum_home_blocks_media_block_aspect_ratio" DEFAULT 'landscape',
  	"full_width" boolean DEFAULT false,
  	"theme" "enum_home_blocks_media_block_theme" DEFAULT 'default',
  	"show_caption" boolean DEFAULT true,
  	"caption_layout" "enum_home_blocks_media_block_caption_layout" DEFAULT 'center',
  	"rich_text" jsonb DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb,
  	"text_size" "enum_home_blocks_media_block_text_size" DEFAULT 'base',
  	"space_pt" "enum_home_blocks_media_block_space_pt" DEFAULT 'md',
  	"space_pb" "enum_home_blocks_media_block_space_pb" DEFAULT 'md',
  	"space_mt" "enum_home_blocks_media_block_space_mt" DEFAULT 'none',
  	"space_mb" "enum_home_blocks_media_block_space_mb" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Home',
  	"hero_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"meta_no_index" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"_status" "enum_home_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"works_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "__home_v_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"layout" "enum___home_v_transition_v_layout" DEFAULT 'offset',
  	"text_size" "enum___home_v_transition_v_text_size" DEFAULT 'small',
  	"heading_level" "enum___home_v_transition_v_heading_level" DEFAULT 'h2',
  	"theme" "enum___home_v_transition_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"text_size" "enum__home_v_blocks_feature_heading_offset_text_size" DEFAULT 'small',
  	"theme" "enum__home_v_blocks_feature_heading_offset_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_full_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"play_video" boolean DEFAULT false,
  	"video_id" integer,
  	"media_id" integer,
  	"visual_type" "enum___home_v_full_media_v_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum___home_v_full_media_v_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"text_size" "enum___home_v_full_media_v_text_size" DEFAULT 'small',
  	"width" "enum___home_v_full_media_v_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___home_v_full_media_v_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum___home_v_full_media_v_content_position" DEFAULT 'left',
  	"theme" "enum___home_v_full_media_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_media_split_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"play_video" boolean DEFAULT false,
  	"video_id" integer,
  	"media_id" integer,
  	"visual_type" "enum___home_v_media_split_v_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum___home_v_media_split_v_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"text_size" "enum___home_v_media_split_v_text_size" DEFAULT 'small',
  	"layout" "enum___home_v_media_split_v_layout" DEFAULT 'left',
  	"aspect_ratio" "enum___home_v_media_split_v_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum___home_v_media_split_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_split_narrow_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"play_video" boolean DEFAULT false,
  	"video_id" integer,
  	"media_id" integer,
  	"visual_type" "enum___home_v_split_narrow_v_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum___home_v_split_narrow_v_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"text_size" "enum___home_v_split_narrow_v_text_size" DEFAULT 'small',
  	"image_position" "enum___home_v_split_narrow_v_image_position" DEFAULT 'left',
  	"theme" "enum___home_v_split_narrow_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_carousel_split_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_carousel_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"text_size" "enum__home_v_blocks_carousel_split_text_size" DEFAULT 'small',
  	"carousel_position" "enum__home_v_blocks_carousel_split_carousel_position" DEFAULT 'right',
  	"slide_size" "enum__home_v_blocks_carousel_split_slide_size" DEFAULT 'full',
  	"show_arrows" boolean DEFAULT false,
  	"theme" "enum__home_v_blocks_carousel_split_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_image_pair_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"text_size" "enum___home_v_image_pair_v_text_size" DEFAULT 'small',
  	"portrait_position" "enum___home_v_image_pair_v_portrait_position" DEFAULT 'left',
  	"text_position" "enum___home_v_image_pair_v_text_position" DEFAULT 'under-portrait',
  	"theme" "enum___home_v_image_pair_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_split_offset_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"text_size" "enum___home_v_split_offset_v_text_size" DEFAULT 'small',
  	"caption_position" "enum___home_v_split_offset_v_caption_position" DEFAULT 'left',
  	"theme" "enum___home_v_split_offset_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" jsonb,
  	"text_size" "enum___home_v_image_statement_v_text_size" DEFAULT 'small',
  	"text_position" "enum___home_v_image_statement_v_text_position" DEFAULT 'left',
  	"image_width" "enum___home_v_image_statement_v_image_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___home_v_image_statement_v_aspect_ratio" DEFAULT 'responsive',
  	"theme" "enum___home_v_image_statement_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_caption_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"play_video" boolean DEFAULT false,
  	"video_id" integer,
  	"media_id" integer,
  	"caption_override" jsonb,
  	"size" "enum___home_v_caption_v_size",
  	"theme" "enum___home_v_caption_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_youtube_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum___home_v_youtube_v_size",
  	"theme" "enum___home_v_youtube_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_rich_text_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"text_size" "enum___home_v_rich_text_v_text_size" DEFAULT 'small',
  	"theme" "enum___home_v_rich_text_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_code_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum___home_v_code_v_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_chart_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___home_v_chart_v_width" DEFAULT 'wide',
  	"theme" "enum___home_v_chart_v_theme" DEFAULT 'default',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_diagram_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___home_v_diagram_v_width" DEFAULT 'wide',
  	"theme" "enum___home_v_diagram_v_theme" DEFAULT 'default',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_faq_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_faq_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum___home_v_faq_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_index_page" "enum___home_v_faq_v_link_index_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"text_size" "enum___home_v_faq_v_text_size" DEFAULT 'small',
  	"theme" "enum___home_v_faq_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__home_v_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum__home_v_blocks_carousel_slide_size" DEFAULT 'full',
  	"theme" "enum__home_v_blocks_carousel_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_carousel_tabs_tabs_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_carousel_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_carousel_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"text_size" "enum__home_v_blocks_carousel_tabs_text_size" DEFAULT 'small',
  	"deck_style" "enum__home_v_blocks_carousel_tabs_deck_style" DEFAULT 'coverflow',
  	"slide_size" "enum__home_v_blocks_carousel_tabs_slide_size" DEFAULT 'full',
  	"show_arrows" boolean DEFAULT false,
  	"tab_size" "enum__home_v_blocks_carousel_tabs_tab_size" DEFAULT 'default',
  	"theme" "enum__home_v_blocks_carousel_tabs_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"visual_type" "enum__home_v_blocks_feature_tabs_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum__home_v_blocks_feature_tabs_tabs_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text_size" "enum__home_v_blocks_feature_tabs_text_size" DEFAULT 'small',
  	"tab_size" "enum__home_v_blocks_feature_tabs_tab_size" DEFAULT 'default',
  	"theme" "enum__home_v_blocks_feature_tabs_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_insight_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_insight_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"text_size" "enum___home_v_insight_list_v_text_size" DEFAULT 'small',
  	"layout" "enum___home_v_insight_list_v_layout" DEFAULT 'side',
  	"mark_size" "enum___home_v_insight_list_v_mark_size" DEFAULT 'medium',
  	"theme" "enum___home_v_insight_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_content_columns_slider_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slide_image_id" integer,
  	"slide_caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"sizes" "enum__home_v_blocks_content_columns_sizes" DEFAULT 'oneThird',
  	"content" "enum__home_v_blocks_content_columns_content" DEFAULT 'text',
  	"text_rich_text" jsonb DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb,
  	"text_text_size" "enum__home_v_blocks_content_columns_text_text_size" DEFAULT 'base',
  	"text_enable_link" boolean,
  	"text_link_type" "enum__home_v_blocks_content_columns_text_link_type" DEFAULT 'reference',
  	"text_link_new_tab" boolean,
  	"text_link_index_page" "enum__home_v_blocks_content_columns_text_link_index_page",
  	"text_link_url" varchar,
  	"text_link_label" varchar,
  	"text_link_appearance" "enum__home_v_blocks_content_columns_text_link_appearance" DEFAULT 'default',
  	"section_heading_eyebrow" varchar,
  	"section_heading_content" jsonb DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb,
  	"section_heading_size" "enum__home_v_blocks_content_columns_section_heading_size" DEFAULT 'base',
  	"section_heading_align" "enum__home_v_blocks_content_columns_section_heading_align" DEFAULT 'left',
  	"section_heading_style" "enum__home_v_blocks_content_columns_section_heading_style" DEFAULT 'default',
  	"work_works_id" integer,
  	"work_aspect" "enum__home_v_blocks_content_columns_work_aspect" DEFAULT 'wide',
  	"work_variant" "enum__home_v_blocks_content_columns_work_variant" DEFAULT 'featured',
  	"post_posts_id" integer,
  	"post_aspect" "enum__home_v_blocks_content_columns_post_aspect" DEFAULT 'wide',
  	"post_variant" "enum__home_v_blocks_content_columns_post_variant" DEFAULT 'featured',
  	"slider_theme" "enum__home_v_blocks_content_columns_slider_theme" DEFAULT 'default',
  	"slider_intro_content_heading" varchar,
  	"slider_intro_content_subheading" varchar,
  	"slider_intro_content_size" "enum__home_v_blocks_content_columns_slider_intro_content_size" DEFAULT 'base',
  	"slider_intro_content_align" "enum__home_v_blocks_content_columns_slider_intro_content_align" DEFAULT 'left',
  	"slider_style" "enum__home_v_blocks_content_columns_slider_style" DEFAULT 'default',
  	"slider_space_pt" "enum__home_v_blocks_content_columns_slider_space_pt" DEFAULT 'md',
  	"slider_space_pb" "enum__home_v_blocks_content_columns_slider_space_pb" DEFAULT 'md',
  	"slider_space_mt" "enum__home_v_blocks_content_columns_slider_space_mt" DEFAULT 'none',
  	"slider_space_mb" "enum__home_v_blocks_content_columns_slider_space_mb" DEFAULT 'none',
  	"media_media_id" integer,
  	"media_aspect_ratio" "enum__home_v_blocks_content_columns_media_aspect_ratio" DEFAULT 'landscape',
  	"media_full_width" boolean DEFAULT false,
  	"media_caption_size" "enum__home_v_blocks_content_columns_media_caption_size" DEFAULT 'normal',
  	"you_tube_url" varchar,
  	"you_tube_aspect_ratio" "enum__home_v_blocks_content_columns_you_tube_aspect_ratio" DEFAULT 'landscape',
  	"you_tube_full_width" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__home_v_blocks_content_theme" DEFAULT 'default',
  	"container_width" "enum__home_v_blocks_content_container_width" DEFAULT 'contained',
  	"space_pt" "enum__home_v_blocks_content_space_pt" DEFAULT 'md',
  	"space_pb" "enum__home_v_blocks_content_space_pb" DEFAULT 'md',
  	"space_mt" "enum__home_v_blocks_content_space_mt" DEFAULT 'none',
  	"space_mb" "enum__home_v_blocks_content_space_mb" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_section_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum___home_v_section_v_theme" DEFAULT 'default',
  	"spacing" "enum___home_v_section_v_spacing" DEFAULT 'default',
  	"stack" "enum___home_v_section_v_stack" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_slider_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slide_image_id" integer,
  	"slide_caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__home_v_blocks_slider_theme" DEFAULT 'default',
  	"intro_content_heading" varchar,
  	"intro_content_subheading" varchar,
  	"intro_content_size" "enum__home_v_blocks_slider_intro_content_size" DEFAULT 'base',
  	"intro_content_align" "enum__home_v_blocks_slider_intro_content_align" DEFAULT 'left',
  	"style" "enum__home_v_blocks_slider_style" DEFAULT 'default',
  	"space_pt" "enum__home_v_blocks_slider_space_pt" DEFAULT 'md',
  	"space_pb" "enum__home_v_blocks_slider_space_pb" DEFAULT 'md',
  	"space_mt" "enum__home_v_blocks_slider_space_mt" DEFAULT 'none',
  	"space_mb" "enum__home_v_blocks_slider_space_mb" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__home_v_blocks_archive_theme" DEFAULT 'default',
  	"card_style" "enum__home_v_blocks_archive_card_style" DEFAULT 'card',
  	"intro_content" jsonb,
  	"populate_by" "enum__home_v_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__home_v_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__home_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_index_page" "enum__home_v_blocks_cta_links_link_index_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__home_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"space_pt" "enum__home_v_blocks_form_block_space_pt" DEFAULT 'md',
  	"space_pb" "enum__home_v_blocks_form_block_space_pb" DEFAULT 'md',
  	"space_mt" "enum__home_v_blocks_form_block_space_mt" DEFAULT 'none',
  	"space_mb" "enum__home_v_blocks_form_block_space_mb" DEFAULT 'none',
  	"enable_intro" boolean,
  	"intro_align" "enum__home_v_blocks_form_block_intro_align" DEFAULT 'left',
  	"intro_content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"aspect_ratio" "enum__home_v_blocks_media_block_aspect_ratio" DEFAULT 'landscape',
  	"full_width" boolean DEFAULT false,
  	"theme" "enum__home_v_blocks_media_block_theme" DEFAULT 'default',
  	"show_caption" boolean DEFAULT true,
  	"caption_layout" "enum__home_v_blocks_media_block_caption_layout" DEFAULT 'center',
  	"rich_text" jsonb DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb,
  	"text_size" "enum__home_v_blocks_media_block_text_size" DEFAULT 'base',
  	"space_pt" "enum__home_v_blocks_media_block_space_pt" DEFAULT 'md',
  	"space_pb" "enum__home_v_blocks_media_block_space_pb" DEFAULT 'md',
  	"space_mt" "enum__home_v_blocks_media_block_space_mt" DEFAULT 'none',
  	"space_mb" "enum__home_v_blocks_media_block_space_mb" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar DEFAULT 'Home',
  	"version_hero_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version__status" "enum__home_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_home_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"works_id" integer,
  	"categories_id" integer
  );
  
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "home_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "home_update" boolean DEFAULT false;
  ALTER TABLE "home_transition" ADD CONSTRAINT "home_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_heading_offset" ADD CONSTRAINT "home_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_full_media" ADD CONSTRAINT "home_full_media_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_full_media" ADD CONSTRAINT "home_full_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_full_media" ADD CONSTRAINT "home_full_media_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_full_media" ADD CONSTRAINT "home_full_media_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_full_media" ADD CONSTRAINT "home_full_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_media_split" ADD CONSTRAINT "home_media_split_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_media_split" ADD CONSTRAINT "home_media_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_media_split" ADD CONSTRAINT "home_media_split_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_media_split" ADD CONSTRAINT "home_media_split_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_media_split" ADD CONSTRAINT "home_media_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_split_narrow" ADD CONSTRAINT "home_split_narrow_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_split_narrow" ADD CONSTRAINT "home_split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_split_narrow" ADD CONSTRAINT "home_split_narrow_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_split_narrow" ADD CONSTRAINT "home_split_narrow_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_split_narrow" ADD CONSTRAINT "home_split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel_split_slides" ADD CONSTRAINT "home_blocks_carousel_split_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel_split_slides" ADD CONSTRAINT "home_blocks_carousel_split_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_carousel_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel_split" ADD CONSTRAINT "home_blocks_carousel_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_image_pair" ADD CONSTRAINT "home_image_pair_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_image_pair" ADD CONSTRAINT "home_image_pair_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_image_pair" ADD CONSTRAINT "home_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_split_offset" ADD CONSTRAINT "home_split_offset_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_split_offset" ADD CONSTRAINT "home_split_offset_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_split_offset" ADD CONSTRAINT "home_split_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_image_statement" ADD CONSTRAINT "home_image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_image_statement" ADD CONSTRAINT "home_image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_caption" ADD CONSTRAINT "home_caption_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_caption" ADD CONSTRAINT "home_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_caption" ADD CONSTRAINT "home_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_youtube" ADD CONSTRAINT "home_youtube_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rich_text" ADD CONSTRAINT "home_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_code" ADD CONSTRAINT "home_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_chart" ADD CONSTRAINT "home_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_diagram" ADD CONSTRAINT "home_diagram_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_faq_items" ADD CONSTRAINT "home_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_faq" ADD CONSTRAINT "home_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel_slides" ADD CONSTRAINT "home_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel_slides" ADD CONSTRAINT "home_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel" ADD CONSTRAINT "home_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel_tabs_tabs_slides" ADD CONSTRAINT "home_blocks_carousel_tabs_tabs_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel_tabs_tabs_slides" ADD CONSTRAINT "home_blocks_carousel_tabs_tabs_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_carousel_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel_tabs_tabs" ADD CONSTRAINT "home_blocks_carousel_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_carousel_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel_tabs" ADD CONSTRAINT "home_blocks_carousel_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "home_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_tabs_tabs" ADD CONSTRAINT "home_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_tabs_tabs" ADD CONSTRAINT "home_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_tabs_tabs" ADD CONSTRAINT "home_blocks_feature_tabs_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_tabs_tabs" ADD CONSTRAINT "home_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_tabs" ADD CONSTRAINT "home_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_insight_list_items" ADD CONSTRAINT "home_insight_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_insight_list_items" ADD CONSTRAINT "home_insight_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_insight_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_insight_list" ADD CONSTRAINT "home_insight_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_content_columns_slider_slides" ADD CONSTRAINT "home_blocks_content_columns_slider_slides_slide_image_id_media_id_fk" FOREIGN KEY ("slide_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_content_columns_slider_slides" ADD CONSTRAINT "home_blocks_content_columns_slider_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_content_columns" ADD CONSTRAINT "home_blocks_content_columns_work_works_id_works_id_fk" FOREIGN KEY ("work_works_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_content_columns" ADD CONSTRAINT "home_blocks_content_columns_post_posts_id_posts_id_fk" FOREIGN KEY ("post_posts_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_content_columns" ADD CONSTRAINT "home_blocks_content_columns_media_media_id_media_id_fk" FOREIGN KEY ("media_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_content_columns" ADD CONSTRAINT "home_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_content" ADD CONSTRAINT "home_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_section" ADD CONSTRAINT "home_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_slider_slides" ADD CONSTRAINT "home_blocks_slider_slides_slide_image_id_media_id_fk" FOREIGN KEY ("slide_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_slider_slides" ADD CONSTRAINT "home_blocks_slider_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_slider"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_slider" ADD CONSTRAINT "home_blocks_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_callout" ADD CONSTRAINT "home_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_archive" ADD CONSTRAINT "home_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_cta_links" ADD CONSTRAINT "home_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_cta" ADD CONSTRAINT "home_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_form_block" ADD CONSTRAINT "home_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_form_block" ADD CONSTRAINT "home_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_media_block" ADD CONSTRAINT "home_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_media_block" ADD CONSTRAINT "home_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_works_fk" FOREIGN KEY ("works_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_transition_v" ADD CONSTRAINT "__home_v_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_heading_offset" ADD CONSTRAINT "_home_v_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_full_media_v" ADD CONSTRAINT "__home_v_full_media_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_full_media_v" ADD CONSTRAINT "__home_v_full_media_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_full_media_v" ADD CONSTRAINT "__home_v_full_media_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_full_media_v" ADD CONSTRAINT "__home_v_full_media_v_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_full_media_v" ADD CONSTRAINT "__home_v_full_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_media_split_v" ADD CONSTRAINT "__home_v_media_split_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_media_split_v" ADD CONSTRAINT "__home_v_media_split_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_media_split_v" ADD CONSTRAINT "__home_v_media_split_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_media_split_v" ADD CONSTRAINT "__home_v_media_split_v_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_media_split_v" ADD CONSTRAINT "__home_v_media_split_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_split_narrow_v" ADD CONSTRAINT "__home_v_split_narrow_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_split_narrow_v" ADD CONSTRAINT "__home_v_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_split_narrow_v" ADD CONSTRAINT "__home_v_split_narrow_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_split_narrow_v" ADD CONSTRAINT "__home_v_split_narrow_v_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_split_narrow_v" ADD CONSTRAINT "__home_v_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel_split_slides" ADD CONSTRAINT "_home_v_blocks_carousel_split_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel_split_slides" ADD CONSTRAINT "_home_v_blocks_carousel_split_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_carousel_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel_split" ADD CONSTRAINT "_home_v_blocks_carousel_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_image_pair_v" ADD CONSTRAINT "__home_v_image_pair_v_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_image_pair_v" ADD CONSTRAINT "__home_v_image_pair_v_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_image_pair_v" ADD CONSTRAINT "__home_v_image_pair_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_split_offset_v" ADD CONSTRAINT "__home_v_split_offset_v_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_split_offset_v" ADD CONSTRAINT "__home_v_split_offset_v_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_split_offset_v" ADD CONSTRAINT "__home_v_split_offset_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_image_statement_v" ADD CONSTRAINT "__home_v_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_image_statement_v" ADD CONSTRAINT "__home_v_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_caption_v" ADD CONSTRAINT "__home_v_caption_v_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_caption_v" ADD CONSTRAINT "__home_v_caption_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_caption_v" ADD CONSTRAINT "__home_v_caption_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_youtube_v" ADD CONSTRAINT "__home_v_youtube_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_rich_text_v" ADD CONSTRAINT "__home_v_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_code_v" ADD CONSTRAINT "__home_v_code_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_chart_v" ADD CONSTRAINT "__home_v_chart_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_diagram_v" ADD CONSTRAINT "__home_v_diagram_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_faq_v_items" ADD CONSTRAINT "__home_v_faq_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_faq_v" ADD CONSTRAINT "__home_v_faq_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel_slides" ADD CONSTRAINT "_home_v_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel_slides" ADD CONSTRAINT "_home_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel" ADD CONSTRAINT "_home_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel_tabs_tabs_slides" ADD CONSTRAINT "_home_v_blocks_carousel_tabs_tabs_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel_tabs_tabs_slides" ADD CONSTRAINT "_home_v_blocks_carousel_tabs_tabs_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_carousel_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel_tabs_tabs" ADD CONSTRAINT "_home_v_blocks_carousel_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_carousel_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel_tabs" ADD CONSTRAINT "_home_v_blocks_carousel_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "_home_v_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_home_v_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_home_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_home_v_blocks_feature_tabs_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_home_v_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_tabs" ADD CONSTRAINT "_home_v_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_insight_list_v_items" ADD CONSTRAINT "__home_v_insight_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_insight_list_v_items" ADD CONSTRAINT "__home_v_insight_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_insight_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_insight_list_v" ADD CONSTRAINT "__home_v_insight_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_content_columns_slider_slides" ADD CONSTRAINT "_home_v_blocks_content_columns_slider_slides_slide_image_id_media_id_fk" FOREIGN KEY ("slide_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_content_columns_slider_slides" ADD CONSTRAINT "_home_v_blocks_content_columns_slider_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_content_columns" ADD CONSTRAINT "_home_v_blocks_content_columns_work_works_id_works_id_fk" FOREIGN KEY ("work_works_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_content_columns" ADD CONSTRAINT "_home_v_blocks_content_columns_post_posts_id_posts_id_fk" FOREIGN KEY ("post_posts_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_content_columns" ADD CONSTRAINT "_home_v_blocks_content_columns_media_media_id_media_id_fk" FOREIGN KEY ("media_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_content_columns" ADD CONSTRAINT "_home_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_content" ADD CONSTRAINT "_home_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_section_v" ADD CONSTRAINT "__home_v_section_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_slider_slides" ADD CONSTRAINT "_home_v_blocks_slider_slides_slide_image_id_media_id_fk" FOREIGN KEY ("slide_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_slider_slides" ADD CONSTRAINT "_home_v_blocks_slider_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_slider"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_slider" ADD CONSTRAINT "_home_v_blocks_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_callout" ADD CONSTRAINT "_home_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_archive" ADD CONSTRAINT "_home_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_cta_links" ADD CONSTRAINT "_home_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_cta" ADD CONSTRAINT "_home_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_form_block" ADD CONSTRAINT "_home_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_form_block" ADD CONSTRAINT "_home_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_media_block" ADD CONSTRAINT "_home_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_media_block" ADD CONSTRAINT "_home_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_works_fk" FOREIGN KEY ("works_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_transition_order_idx" ON "home_transition" USING btree ("_order");
  CREATE INDEX "home_transition_parent_id_idx" ON "home_transition" USING btree ("_parent_id");
  CREATE INDEX "home_transition_path_idx" ON "home_transition" USING btree ("_path");
  CREATE INDEX "home_blocks_feature_heading_offset_order_idx" ON "home_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "home_blocks_feature_heading_offset_parent_id_idx" ON "home_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_heading_offset_path_idx" ON "home_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "home_full_media_order_idx" ON "home_full_media" USING btree ("_order");
  CREATE INDEX "home_full_media_parent_id_idx" ON "home_full_media" USING btree ("_parent_id");
  CREATE INDEX "home_full_media_path_idx" ON "home_full_media" USING btree ("_path");
  CREATE INDEX "home_full_media_video_idx" ON "home_full_media" USING btree ("video_id");
  CREATE INDEX "home_full_media_media_idx" ON "home_full_media" USING btree ("media_id");
  CREATE INDEX "home_full_media_shader_shader_studio_idx" ON "home_full_media" USING btree ("shader_studio_id");
  CREATE INDEX "home_full_media_shader_shader_poster_media_idx" ON "home_full_media" USING btree ("shader_poster_media_id");
  CREATE INDEX "home_media_split_order_idx" ON "home_media_split" USING btree ("_order");
  CREATE INDEX "home_media_split_parent_id_idx" ON "home_media_split" USING btree ("_parent_id");
  CREATE INDEX "home_media_split_path_idx" ON "home_media_split" USING btree ("_path");
  CREATE INDEX "home_media_split_video_idx" ON "home_media_split" USING btree ("video_id");
  CREATE INDEX "home_media_split_media_idx" ON "home_media_split" USING btree ("media_id");
  CREATE INDEX "home_media_split_shader_shader_studio_idx" ON "home_media_split" USING btree ("shader_studio_id");
  CREATE INDEX "home_media_split_shader_shader_poster_media_idx" ON "home_media_split" USING btree ("shader_poster_media_id");
  CREATE INDEX "home_split_narrow_order_idx" ON "home_split_narrow" USING btree ("_order");
  CREATE INDEX "home_split_narrow_parent_id_idx" ON "home_split_narrow" USING btree ("_parent_id");
  CREATE INDEX "home_split_narrow_path_idx" ON "home_split_narrow" USING btree ("_path");
  CREATE INDEX "home_split_narrow_video_idx" ON "home_split_narrow" USING btree ("video_id");
  CREATE INDEX "home_split_narrow_media_idx" ON "home_split_narrow" USING btree ("media_id");
  CREATE INDEX "home_split_narrow_shader_shader_studio_idx" ON "home_split_narrow" USING btree ("shader_studio_id");
  CREATE INDEX "home_split_narrow_shader_shader_poster_media_idx" ON "home_split_narrow" USING btree ("shader_poster_media_id");
  CREATE INDEX "home_blocks_carousel_split_slides_order_idx" ON "home_blocks_carousel_split_slides" USING btree ("_order");
  CREATE INDEX "home_blocks_carousel_split_slides_parent_id_idx" ON "home_blocks_carousel_split_slides" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_carousel_split_slides_media_idx" ON "home_blocks_carousel_split_slides" USING btree ("media_id");
  CREATE INDEX "home_blocks_carousel_split_order_idx" ON "home_blocks_carousel_split" USING btree ("_order");
  CREATE INDEX "home_blocks_carousel_split_parent_id_idx" ON "home_blocks_carousel_split" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_carousel_split_path_idx" ON "home_blocks_carousel_split" USING btree ("_path");
  CREATE INDEX "home_image_pair_order_idx" ON "home_image_pair" USING btree ("_order");
  CREATE INDEX "home_image_pair_parent_id_idx" ON "home_image_pair" USING btree ("_parent_id");
  CREATE INDEX "home_image_pair_path_idx" ON "home_image_pair" USING btree ("_path");
  CREATE INDEX "home_image_pair_portrait_media_idx" ON "home_image_pair" USING btree ("portrait_media_id");
  CREATE INDEX "home_image_pair_landscape_media_idx" ON "home_image_pair" USING btree ("landscape_media_id");
  CREATE INDEX "home_split_offset_order_idx" ON "home_split_offset" USING btree ("_order");
  CREATE INDEX "home_split_offset_parent_id_idx" ON "home_split_offset" USING btree ("_parent_id");
  CREATE INDEX "home_split_offset_path_idx" ON "home_split_offset" USING btree ("_path");
  CREATE INDEX "home_split_offset_large_media_idx" ON "home_split_offset" USING btree ("large_media_id");
  CREATE INDEX "home_split_offset_small_media_idx" ON "home_split_offset" USING btree ("small_media_id");
  CREATE INDEX "home_image_statement_order_idx" ON "home_image_statement" USING btree ("_order");
  CREATE INDEX "home_image_statement_parent_id_idx" ON "home_image_statement" USING btree ("_parent_id");
  CREATE INDEX "home_image_statement_path_idx" ON "home_image_statement" USING btree ("_path");
  CREATE INDEX "home_image_statement_media_idx" ON "home_image_statement" USING btree ("media_id");
  CREATE INDEX "home_caption_order_idx" ON "home_caption" USING btree ("_order");
  CREATE INDEX "home_caption_parent_id_idx" ON "home_caption" USING btree ("_parent_id");
  CREATE INDEX "home_caption_path_idx" ON "home_caption" USING btree ("_path");
  CREATE INDEX "home_caption_video_idx" ON "home_caption" USING btree ("video_id");
  CREATE INDEX "home_caption_media_idx" ON "home_caption" USING btree ("media_id");
  CREATE INDEX "home_youtube_order_idx" ON "home_youtube" USING btree ("_order");
  CREATE INDEX "home_youtube_parent_id_idx" ON "home_youtube" USING btree ("_parent_id");
  CREATE INDEX "home_youtube_path_idx" ON "home_youtube" USING btree ("_path");
  CREATE INDEX "home_rich_text_order_idx" ON "home_rich_text" USING btree ("_order");
  CREATE INDEX "home_rich_text_parent_id_idx" ON "home_rich_text" USING btree ("_parent_id");
  CREATE INDEX "home_rich_text_path_idx" ON "home_rich_text" USING btree ("_path");
  CREATE INDEX "home_code_order_idx" ON "home_code" USING btree ("_order");
  CREATE INDEX "home_code_parent_id_idx" ON "home_code" USING btree ("_parent_id");
  CREATE INDEX "home_code_path_idx" ON "home_code" USING btree ("_path");
  CREATE INDEX "home_chart_order_idx" ON "home_chart" USING btree ("_order");
  CREATE INDEX "home_chart_parent_id_idx" ON "home_chart" USING btree ("_parent_id");
  CREATE INDEX "home_chart_path_idx" ON "home_chart" USING btree ("_path");
  CREATE INDEX "home_diagram_order_idx" ON "home_diagram" USING btree ("_order");
  CREATE INDEX "home_diagram_parent_id_idx" ON "home_diagram" USING btree ("_parent_id");
  CREATE INDEX "home_diagram_path_idx" ON "home_diagram" USING btree ("_path");
  CREATE INDEX "home_faq_items_order_idx" ON "home_faq_items" USING btree ("_order");
  CREATE INDEX "home_faq_items_parent_id_idx" ON "home_faq_items" USING btree ("_parent_id");
  CREATE INDEX "home_faq_order_idx" ON "home_faq" USING btree ("_order");
  CREATE INDEX "home_faq_parent_id_idx" ON "home_faq" USING btree ("_parent_id");
  CREATE INDEX "home_faq_path_idx" ON "home_faq" USING btree ("_path");
  CREATE INDEX "home_blocks_carousel_slides_order_idx" ON "home_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "home_blocks_carousel_slides_parent_id_idx" ON "home_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_carousel_slides_media_idx" ON "home_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "home_blocks_carousel_order_idx" ON "home_blocks_carousel" USING btree ("_order");
  CREATE INDEX "home_blocks_carousel_parent_id_idx" ON "home_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_carousel_path_idx" ON "home_blocks_carousel" USING btree ("_path");
  CREATE INDEX "home_blocks_carousel_tabs_tabs_slides_order_idx" ON "home_blocks_carousel_tabs_tabs_slides" USING btree ("_order");
  CREATE INDEX "home_blocks_carousel_tabs_tabs_slides_parent_id_idx" ON "home_blocks_carousel_tabs_tabs_slides" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_carousel_tabs_tabs_slides_media_idx" ON "home_blocks_carousel_tabs_tabs_slides" USING btree ("media_id");
  CREATE INDEX "home_blocks_carousel_tabs_tabs_order_idx" ON "home_blocks_carousel_tabs_tabs" USING btree ("_order");
  CREATE INDEX "home_blocks_carousel_tabs_tabs_parent_id_idx" ON "home_blocks_carousel_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_carousel_tabs_order_idx" ON "home_blocks_carousel_tabs" USING btree ("_order");
  CREATE INDEX "home_blocks_carousel_tabs_parent_id_idx" ON "home_blocks_carousel_tabs" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_carousel_tabs_path_idx" ON "home_blocks_carousel_tabs" USING btree ("_path");
  CREATE INDEX "home_blocks_feature_tabs_tabs_items_order_idx" ON "home_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "home_blocks_feature_tabs_tabs_items_parent_id_idx" ON "home_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_tabs_tabs_order_idx" ON "home_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "home_blocks_feature_tabs_tabs_parent_id_idx" ON "home_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_tabs_tabs_media_idx" ON "home_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "home_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "home_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "home_blocks_feature_tabs_tabs_shader_shader_poster_media_idx" ON "home_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "home_blocks_feature_tabs_order_idx" ON "home_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "home_blocks_feature_tabs_parent_id_idx" ON "home_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_tabs_path_idx" ON "home_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "home_insight_list_items_order_idx" ON "home_insight_list_items" USING btree ("_order");
  CREATE INDEX "home_insight_list_items_parent_id_idx" ON "home_insight_list_items" USING btree ("_parent_id");
  CREATE INDEX "home_insight_list_items_media_idx" ON "home_insight_list_items" USING btree ("media_id");
  CREATE INDEX "home_insight_list_order_idx" ON "home_insight_list" USING btree ("_order");
  CREATE INDEX "home_insight_list_parent_id_idx" ON "home_insight_list" USING btree ("_parent_id");
  CREATE INDEX "home_insight_list_path_idx" ON "home_insight_list" USING btree ("_path");
  CREATE INDEX "home_blocks_content_columns_slider_slides_order_idx" ON "home_blocks_content_columns_slider_slides" USING btree ("_order");
  CREATE INDEX "home_blocks_content_columns_slider_slides_parent_id_idx" ON "home_blocks_content_columns_slider_slides" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_content_columns_slider_slides_slide_slide_im_idx" ON "home_blocks_content_columns_slider_slides" USING btree ("slide_image_id");
  CREATE INDEX "home_blocks_content_columns_order_idx" ON "home_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "home_blocks_content_columns_parent_id_idx" ON "home_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_content_columns_work_work_works_idx" ON "home_blocks_content_columns" USING btree ("work_works_id");
  CREATE INDEX "home_blocks_content_columns_post_post_posts_idx" ON "home_blocks_content_columns" USING btree ("post_posts_id");
  CREATE INDEX "home_blocks_content_columns_media_media_media_idx" ON "home_blocks_content_columns" USING btree ("media_media_id");
  CREATE INDEX "home_blocks_content_order_idx" ON "home_blocks_content" USING btree ("_order");
  CREATE INDEX "home_blocks_content_parent_id_idx" ON "home_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_content_path_idx" ON "home_blocks_content" USING btree ("_path");
  CREATE INDEX "home_section_order_idx" ON "home_section" USING btree ("_order");
  CREATE INDEX "home_section_parent_id_idx" ON "home_section" USING btree ("_parent_id");
  CREATE INDEX "home_section_path_idx" ON "home_section" USING btree ("_path");
  CREATE INDEX "home_blocks_slider_slides_order_idx" ON "home_blocks_slider_slides" USING btree ("_order");
  CREATE INDEX "home_blocks_slider_slides_parent_id_idx" ON "home_blocks_slider_slides" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_slider_slides_slide_slide_image_idx" ON "home_blocks_slider_slides" USING btree ("slide_image_id");
  CREATE INDEX "home_blocks_slider_order_idx" ON "home_blocks_slider" USING btree ("_order");
  CREATE INDEX "home_blocks_slider_parent_id_idx" ON "home_blocks_slider" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_slider_path_idx" ON "home_blocks_slider" USING btree ("_path");
  CREATE INDEX "home_blocks_callout_order_idx" ON "home_blocks_callout" USING btree ("_order");
  CREATE INDEX "home_blocks_callout_parent_id_idx" ON "home_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_callout_path_idx" ON "home_blocks_callout" USING btree ("_path");
  CREATE INDEX "home_blocks_archive_order_idx" ON "home_blocks_archive" USING btree ("_order");
  CREATE INDEX "home_blocks_archive_parent_id_idx" ON "home_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_archive_path_idx" ON "home_blocks_archive" USING btree ("_path");
  CREATE INDEX "home_blocks_cta_links_order_idx" ON "home_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "home_blocks_cta_links_parent_id_idx" ON "home_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_cta_order_idx" ON "home_blocks_cta" USING btree ("_order");
  CREATE INDEX "home_blocks_cta_parent_id_idx" ON "home_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_cta_path_idx" ON "home_blocks_cta" USING btree ("_path");
  CREATE INDEX "home_blocks_form_block_order_idx" ON "home_blocks_form_block" USING btree ("_order");
  CREATE INDEX "home_blocks_form_block_parent_id_idx" ON "home_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_form_block_path_idx" ON "home_blocks_form_block" USING btree ("_path");
  CREATE INDEX "home_blocks_form_block_form_idx" ON "home_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "home_blocks_media_block_order_idx" ON "home_blocks_media_block" USING btree ("_order");
  CREATE INDEX "home_blocks_media_block_parent_id_idx" ON "home_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_media_block_path_idx" ON "home_blocks_media_block" USING btree ("_path");
  CREATE INDEX "home_blocks_media_block_media_idx" ON "home_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "home_hero_hero_media_idx" ON "home" USING btree ("hero_media_id");
  CREATE INDEX "home_meta_meta_image_idx" ON "home" USING btree ("meta_image_id");
  CREATE INDEX "home__status_idx" ON "home" USING btree ("_status");
  CREATE INDEX "home_rels_order_idx" ON "home_rels" USING btree ("order");
  CREATE INDEX "home_rels_parent_idx" ON "home_rels" USING btree ("parent_id");
  CREATE INDEX "home_rels_path_idx" ON "home_rels" USING btree ("path");
  CREATE INDEX "home_rels_pages_id_idx" ON "home_rels" USING btree ("pages_id");
  CREATE INDEX "home_rels_posts_id_idx" ON "home_rels" USING btree ("posts_id");
  CREATE INDEX "home_rels_works_id_idx" ON "home_rels" USING btree ("works_id");
  CREATE INDEX "home_rels_categories_id_idx" ON "home_rels" USING btree ("categories_id");
  CREATE INDEX "__home_v_transition_v_order_idx" ON "__home_v_transition_v" USING btree ("_order");
  CREATE INDEX "__home_v_transition_v_parent_id_idx" ON "__home_v_transition_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_transition_v_path_idx" ON "__home_v_transition_v" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_feature_heading_offset_order_idx" ON "_home_v_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_feature_heading_offset_parent_id_idx" ON "_home_v_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_feature_heading_offset_path_idx" ON "_home_v_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "__home_v_full_media_v_order_idx" ON "__home_v_full_media_v" USING btree ("_order");
  CREATE INDEX "__home_v_full_media_v_parent_id_idx" ON "__home_v_full_media_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_full_media_v_path_idx" ON "__home_v_full_media_v" USING btree ("_path");
  CREATE INDEX "__home_v_full_media_v_video_idx" ON "__home_v_full_media_v" USING btree ("video_id");
  CREATE INDEX "__home_v_full_media_v_media_idx" ON "__home_v_full_media_v" USING btree ("media_id");
  CREATE INDEX "__home_v_full_media_v_shader_shader_studio_idx" ON "__home_v_full_media_v" USING btree ("shader_studio_id");
  CREATE INDEX "__home_v_full_media_v_shader_shader_poster_media_idx" ON "__home_v_full_media_v" USING btree ("shader_poster_media_id");
  CREATE INDEX "__home_v_media_split_v_order_idx" ON "__home_v_media_split_v" USING btree ("_order");
  CREATE INDEX "__home_v_media_split_v_parent_id_idx" ON "__home_v_media_split_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_media_split_v_path_idx" ON "__home_v_media_split_v" USING btree ("_path");
  CREATE INDEX "__home_v_media_split_v_video_idx" ON "__home_v_media_split_v" USING btree ("video_id");
  CREATE INDEX "__home_v_media_split_v_media_idx" ON "__home_v_media_split_v" USING btree ("media_id");
  CREATE INDEX "__home_v_media_split_v_shader_shader_studio_idx" ON "__home_v_media_split_v" USING btree ("shader_studio_id");
  CREATE INDEX "__home_v_media_split_v_shader_shader_poster_media_idx" ON "__home_v_media_split_v" USING btree ("shader_poster_media_id");
  CREATE INDEX "__home_v_split_narrow_v_order_idx" ON "__home_v_split_narrow_v" USING btree ("_order");
  CREATE INDEX "__home_v_split_narrow_v_parent_id_idx" ON "__home_v_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_split_narrow_v_path_idx" ON "__home_v_split_narrow_v" USING btree ("_path");
  CREATE INDEX "__home_v_split_narrow_v_video_idx" ON "__home_v_split_narrow_v" USING btree ("video_id");
  CREATE INDEX "__home_v_split_narrow_v_media_idx" ON "__home_v_split_narrow_v" USING btree ("media_id");
  CREATE INDEX "__home_v_split_narrow_v_shader_shader_studio_idx" ON "__home_v_split_narrow_v" USING btree ("shader_studio_id");
  CREATE INDEX "__home_v_split_narrow_v_shader_shader_poster_media_idx" ON "__home_v_split_narrow_v" USING btree ("shader_poster_media_id");
  CREATE INDEX "_home_v_blocks_carousel_split_slides_order_idx" ON "_home_v_blocks_carousel_split_slides" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_carousel_split_slides_parent_id_idx" ON "_home_v_blocks_carousel_split_slides" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_carousel_split_slides_media_idx" ON "_home_v_blocks_carousel_split_slides" USING btree ("media_id");
  CREATE INDEX "_home_v_blocks_carousel_split_order_idx" ON "_home_v_blocks_carousel_split" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_carousel_split_parent_id_idx" ON "_home_v_blocks_carousel_split" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_carousel_split_path_idx" ON "_home_v_blocks_carousel_split" USING btree ("_path");
  CREATE INDEX "__home_v_image_pair_v_order_idx" ON "__home_v_image_pair_v" USING btree ("_order");
  CREATE INDEX "__home_v_image_pair_v_parent_id_idx" ON "__home_v_image_pair_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_image_pair_v_path_idx" ON "__home_v_image_pair_v" USING btree ("_path");
  CREATE INDEX "__home_v_image_pair_v_portrait_media_idx" ON "__home_v_image_pair_v" USING btree ("portrait_media_id");
  CREATE INDEX "__home_v_image_pair_v_landscape_media_idx" ON "__home_v_image_pair_v" USING btree ("landscape_media_id");
  CREATE INDEX "__home_v_split_offset_v_order_idx" ON "__home_v_split_offset_v" USING btree ("_order");
  CREATE INDEX "__home_v_split_offset_v_parent_id_idx" ON "__home_v_split_offset_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_split_offset_v_path_idx" ON "__home_v_split_offset_v" USING btree ("_path");
  CREATE INDEX "__home_v_split_offset_v_large_media_idx" ON "__home_v_split_offset_v" USING btree ("large_media_id");
  CREATE INDEX "__home_v_split_offset_v_small_media_idx" ON "__home_v_split_offset_v" USING btree ("small_media_id");
  CREATE INDEX "__home_v_image_statement_v_order_idx" ON "__home_v_image_statement_v" USING btree ("_order");
  CREATE INDEX "__home_v_image_statement_v_parent_id_idx" ON "__home_v_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_image_statement_v_path_idx" ON "__home_v_image_statement_v" USING btree ("_path");
  CREATE INDEX "__home_v_image_statement_v_media_idx" ON "__home_v_image_statement_v" USING btree ("media_id");
  CREATE INDEX "__home_v_caption_v_order_idx" ON "__home_v_caption_v" USING btree ("_order");
  CREATE INDEX "__home_v_caption_v_parent_id_idx" ON "__home_v_caption_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_caption_v_path_idx" ON "__home_v_caption_v" USING btree ("_path");
  CREATE INDEX "__home_v_caption_v_video_idx" ON "__home_v_caption_v" USING btree ("video_id");
  CREATE INDEX "__home_v_caption_v_media_idx" ON "__home_v_caption_v" USING btree ("media_id");
  CREATE INDEX "__home_v_youtube_v_order_idx" ON "__home_v_youtube_v" USING btree ("_order");
  CREATE INDEX "__home_v_youtube_v_parent_id_idx" ON "__home_v_youtube_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_youtube_v_path_idx" ON "__home_v_youtube_v" USING btree ("_path");
  CREATE INDEX "__home_v_rich_text_v_order_idx" ON "__home_v_rich_text_v" USING btree ("_order");
  CREATE INDEX "__home_v_rich_text_v_parent_id_idx" ON "__home_v_rich_text_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_rich_text_v_path_idx" ON "__home_v_rich_text_v" USING btree ("_path");
  CREATE INDEX "__home_v_code_v_order_idx" ON "__home_v_code_v" USING btree ("_order");
  CREATE INDEX "__home_v_code_v_parent_id_idx" ON "__home_v_code_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_code_v_path_idx" ON "__home_v_code_v" USING btree ("_path");
  CREATE INDEX "__home_v_chart_v_order_idx" ON "__home_v_chart_v" USING btree ("_order");
  CREATE INDEX "__home_v_chart_v_parent_id_idx" ON "__home_v_chart_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_chart_v_path_idx" ON "__home_v_chart_v" USING btree ("_path");
  CREATE INDEX "__home_v_diagram_v_order_idx" ON "__home_v_diagram_v" USING btree ("_order");
  CREATE INDEX "__home_v_diagram_v_parent_id_idx" ON "__home_v_diagram_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_diagram_v_path_idx" ON "__home_v_diagram_v" USING btree ("_path");
  CREATE INDEX "__home_v_faq_v_items_order_idx" ON "__home_v_faq_v_items" USING btree ("_order");
  CREATE INDEX "__home_v_faq_v_items_parent_id_idx" ON "__home_v_faq_v_items" USING btree ("_parent_id");
  CREATE INDEX "__home_v_faq_v_order_idx" ON "__home_v_faq_v" USING btree ("_order");
  CREATE INDEX "__home_v_faq_v_parent_id_idx" ON "__home_v_faq_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_faq_v_path_idx" ON "__home_v_faq_v" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_carousel_slides_order_idx" ON "_home_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_carousel_slides_parent_id_idx" ON "_home_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_carousel_slides_media_idx" ON "_home_v_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "_home_v_blocks_carousel_order_idx" ON "_home_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_carousel_parent_id_idx" ON "_home_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_carousel_path_idx" ON "_home_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_carousel_tabs_tabs_slides_order_idx" ON "_home_v_blocks_carousel_tabs_tabs_slides" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_carousel_tabs_tabs_slides_parent_id_idx" ON "_home_v_blocks_carousel_tabs_tabs_slides" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_carousel_tabs_tabs_slides_media_idx" ON "_home_v_blocks_carousel_tabs_tabs_slides" USING btree ("media_id");
  CREATE INDEX "_home_v_blocks_carousel_tabs_tabs_order_idx" ON "_home_v_blocks_carousel_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_carousel_tabs_tabs_parent_id_idx" ON "_home_v_blocks_carousel_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_carousel_tabs_order_idx" ON "_home_v_blocks_carousel_tabs" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_carousel_tabs_parent_id_idx" ON "_home_v_blocks_carousel_tabs" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_carousel_tabs_path_idx" ON "_home_v_blocks_carousel_tabs" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_items_order_idx" ON "_home_v_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_items_parent_id_idx" ON "_home_v_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_order_idx" ON "_home_v_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_parent_id_idx" ON "_home_v_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_media_idx" ON "_home_v_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "_home_v_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_shader_shader_poster_me_idx" ON "_home_v_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "_home_v_blocks_feature_tabs_order_idx" ON "_home_v_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_feature_tabs_parent_id_idx" ON "_home_v_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_feature_tabs_path_idx" ON "_home_v_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "__home_v_insight_list_v_items_order_idx" ON "__home_v_insight_list_v_items" USING btree ("_order");
  CREATE INDEX "__home_v_insight_list_v_items_parent_id_idx" ON "__home_v_insight_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__home_v_insight_list_v_items_media_idx" ON "__home_v_insight_list_v_items" USING btree ("media_id");
  CREATE INDEX "__home_v_insight_list_v_order_idx" ON "__home_v_insight_list_v" USING btree ("_order");
  CREATE INDEX "__home_v_insight_list_v_parent_id_idx" ON "__home_v_insight_list_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_insight_list_v_path_idx" ON "__home_v_insight_list_v" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_content_columns_slider_slides_order_idx" ON "_home_v_blocks_content_columns_slider_slides" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_content_columns_slider_slides_parent_id_idx" ON "_home_v_blocks_content_columns_slider_slides" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_content_columns_slider_slides_slide_slide_idx" ON "_home_v_blocks_content_columns_slider_slides" USING btree ("slide_image_id");
  CREATE INDEX "_home_v_blocks_content_columns_order_idx" ON "_home_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_content_columns_parent_id_idx" ON "_home_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_content_columns_work_work_works_idx" ON "_home_v_blocks_content_columns" USING btree ("work_works_id");
  CREATE INDEX "_home_v_blocks_content_columns_post_post_posts_idx" ON "_home_v_blocks_content_columns" USING btree ("post_posts_id");
  CREATE INDEX "_home_v_blocks_content_columns_media_media_media_idx" ON "_home_v_blocks_content_columns" USING btree ("media_media_id");
  CREATE INDEX "_home_v_blocks_content_order_idx" ON "_home_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_content_parent_id_idx" ON "_home_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_content_path_idx" ON "_home_v_blocks_content" USING btree ("_path");
  CREATE INDEX "__home_v_section_v_order_idx" ON "__home_v_section_v" USING btree ("_order");
  CREATE INDEX "__home_v_section_v_parent_id_idx" ON "__home_v_section_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_section_v_path_idx" ON "__home_v_section_v" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_slider_slides_order_idx" ON "_home_v_blocks_slider_slides" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_slider_slides_parent_id_idx" ON "_home_v_blocks_slider_slides" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_slider_slides_slide_slide_image_idx" ON "_home_v_blocks_slider_slides" USING btree ("slide_image_id");
  CREATE INDEX "_home_v_blocks_slider_order_idx" ON "_home_v_blocks_slider" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_slider_parent_id_idx" ON "_home_v_blocks_slider" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_slider_path_idx" ON "_home_v_blocks_slider" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_callout_order_idx" ON "_home_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_callout_parent_id_idx" ON "_home_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_callout_path_idx" ON "_home_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_archive_order_idx" ON "_home_v_blocks_archive" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_archive_parent_id_idx" ON "_home_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_archive_path_idx" ON "_home_v_blocks_archive" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_cta_links_order_idx" ON "_home_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_cta_links_parent_id_idx" ON "_home_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_cta_order_idx" ON "_home_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_cta_parent_id_idx" ON "_home_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_cta_path_idx" ON "_home_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_form_block_order_idx" ON "_home_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_form_block_parent_id_idx" ON "_home_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_form_block_path_idx" ON "_home_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_form_block_form_idx" ON "_home_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_home_v_blocks_media_block_order_idx" ON "_home_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_media_block_parent_id_idx" ON "_home_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_media_block_path_idx" ON "_home_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_media_block_media_idx" ON "_home_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_home_v_version_hero_version_hero_media_idx" ON "_home_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_home_v_version_meta_version_meta_image_idx" ON "_home_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_latest_idx" ON "_home_v" USING btree ("latest");
  CREATE INDEX "_home_v_autosave_idx" ON "_home_v" USING btree ("autosave");
  CREATE INDEX "_home_v_rels_order_idx" ON "_home_v_rels" USING btree ("order");
  CREATE INDEX "_home_v_rels_parent_idx" ON "_home_v_rels" USING btree ("parent_id");
  CREATE INDEX "_home_v_rels_path_idx" ON "_home_v_rels" USING btree ("path");
  CREATE INDEX "_home_v_rels_pages_id_idx" ON "_home_v_rels" USING btree ("pages_id");
  CREATE INDEX "_home_v_rels_posts_id_idx" ON "_home_v_rels" USING btree ("posts_id");
  CREATE INDEX "_home_v_rels_works_id_idx" ON "_home_v_rels" USING btree ("works_id");
  CREATE INDEX "_home_v_rels_categories_id_idx" ON "_home_v_rels" USING btree ("categories_id");`)

  // The home page moves from the Pages document `home` to the Home global, as published.
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    depth: 0,
    draft: false,
    limit: 1,
    pagination: false,
    req,
  })
  const page = docs[0]
  if (page) {
    await payload.updateGlobal({
      slug: 'home',
      data: {
        title: page.title,
        hero: { media: page.hero.media as number },
        layout: page.layout as never,
        meta: page.meta,
        publishedAt: page.publishedAt,
        _status: 'published',
      },
      draft: false,
      depth: 0,
      context: { disableRevalidate: true },
      req,
    })
    await payload.delete({
      collection: 'pages',
      id: page.id,
      context: { disableRevalidate: true },
      req,
    })
  }

  // `home` leaves the hero type enums; no other document used it.
  await db.execute(sql`
   UPDATE "pages" SET "hero_type" = 'none' WHERE "hero_type" = 'home';
   UPDATE "_pages_v" SET "version_hero_type" = 'none' WHERE "version_hero_type" = 'home';
   UPDATE "posts" SET "hero_type" = 'none' WHERE "hero_type" = 'home';
   UPDATE "_posts_v" SET "version_hero_type" = 'none' WHERE "version_hero_type" = 'home';`)

  // The generated enum recreation, after the data no longer holds `home`.
  await db.execute(sql`
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum_pages_hero_type";
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::"public"."enum_pages_hero_type";
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE "public"."enum_pages_hero_type" USING "hero_type"::"public"."enum_pages_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE "public"."enum__pages_v_version_hero_type" USING "version_hero_type"::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "posts" ALTER COLUMN "hero_type" SET DATA TYPE text;
  ALTER TABLE "posts" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum_posts_hero_type";
  CREATE TYPE "public"."enum_posts_hero_type" AS ENUM('none', 'editorial', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "posts" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::"public"."enum_posts_hero_type";
  ALTER TABLE "posts" ALTER COLUMN "hero_type" SET DATA TYPE "public"."enum_posts_hero_type" USING "hero_type"::"public"."enum_posts_hero_type";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_hero_type" SET DATA TYPE text;
  ALTER TABLE "_posts_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum__posts_v_version_hero_type";
  CREATE TYPE "public"."enum__posts_v_version_hero_type" AS ENUM('none', 'editorial', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "_posts_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::"public"."enum__posts_v_version_hero_type";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_hero_type" SET DATA TYPE "public"."enum__posts_v_version_hero_type" USING "version_hero_type"::"public"."enum__posts_v_version_hero_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_hero_type" ADD VALUE 'home' BEFORE 'highImpact';
  ALTER TYPE "public"."enum__pages_v_version_hero_type" ADD VALUE 'home' BEFORE 'highImpact';
  ALTER TYPE "public"."enum_posts_hero_type" ADD VALUE 'home' BEFORE 'highImpact';
  ALTER TYPE "public"."enum__posts_v_version_hero_type" ADD VALUE 'home' BEFORE 'highImpact';
  DROP TABLE "home_transition" CASCADE;
  DROP TABLE "home_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "home_full_media" CASCADE;
  DROP TABLE "home_media_split" CASCADE;
  DROP TABLE "home_split_narrow" CASCADE;
  DROP TABLE "home_blocks_carousel_split_slides" CASCADE;
  DROP TABLE "home_blocks_carousel_split" CASCADE;
  DROP TABLE "home_image_pair" CASCADE;
  DROP TABLE "home_split_offset" CASCADE;
  DROP TABLE "home_image_statement" CASCADE;
  DROP TABLE "home_caption" CASCADE;
  DROP TABLE "home_youtube" CASCADE;
  DROP TABLE "home_rich_text" CASCADE;
  DROP TABLE "home_code" CASCADE;
  DROP TABLE "home_chart" CASCADE;
  DROP TABLE "home_diagram" CASCADE;
  DROP TABLE "home_faq_items" CASCADE;
  DROP TABLE "home_faq" CASCADE;
  DROP TABLE "home_blocks_carousel_slides" CASCADE;
  DROP TABLE "home_blocks_carousel" CASCADE;
  DROP TABLE "home_blocks_carousel_tabs_tabs_slides" CASCADE;
  DROP TABLE "home_blocks_carousel_tabs_tabs" CASCADE;
  DROP TABLE "home_blocks_carousel_tabs" CASCADE;
  DROP TABLE "home_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "home_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "home_blocks_feature_tabs" CASCADE;
  DROP TABLE "home_insight_list_items" CASCADE;
  DROP TABLE "home_insight_list" CASCADE;
  DROP TABLE "home_blocks_content_columns_slider_slides" CASCADE;
  DROP TABLE "home_blocks_content_columns" CASCADE;
  DROP TABLE "home_blocks_content" CASCADE;
  DROP TABLE "home_section" CASCADE;
  DROP TABLE "home_blocks_slider_slides" CASCADE;
  DROP TABLE "home_blocks_slider" CASCADE;
  DROP TABLE "home_blocks_callout" CASCADE;
  DROP TABLE "home_blocks_archive" CASCADE;
  DROP TABLE "home_blocks_cta_links" CASCADE;
  DROP TABLE "home_blocks_cta" CASCADE;
  DROP TABLE "home_blocks_form_block" CASCADE;
  DROP TABLE "home_blocks_media_block" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_rels" CASCADE;
  DROP TABLE "__home_v_transition_v" CASCADE;
  DROP TABLE "_home_v_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "__home_v_full_media_v" CASCADE;
  DROP TABLE "__home_v_media_split_v" CASCADE;
  DROP TABLE "__home_v_split_narrow_v" CASCADE;
  DROP TABLE "_home_v_blocks_carousel_split_slides" CASCADE;
  DROP TABLE "_home_v_blocks_carousel_split" CASCADE;
  DROP TABLE "__home_v_image_pair_v" CASCADE;
  DROP TABLE "__home_v_split_offset_v" CASCADE;
  DROP TABLE "__home_v_image_statement_v" CASCADE;
  DROP TABLE "__home_v_caption_v" CASCADE;
  DROP TABLE "__home_v_youtube_v" CASCADE;
  DROP TABLE "__home_v_rich_text_v" CASCADE;
  DROP TABLE "__home_v_code_v" CASCADE;
  DROP TABLE "__home_v_chart_v" CASCADE;
  DROP TABLE "__home_v_diagram_v" CASCADE;
  DROP TABLE "__home_v_faq_v_items" CASCADE;
  DROP TABLE "__home_v_faq_v" CASCADE;
  DROP TABLE "_home_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_home_v_blocks_carousel" CASCADE;
  DROP TABLE "_home_v_blocks_carousel_tabs_tabs_slides" CASCADE;
  DROP TABLE "_home_v_blocks_carousel_tabs_tabs" CASCADE;
  DROP TABLE "_home_v_blocks_carousel_tabs" CASCADE;
  DROP TABLE "_home_v_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "_home_v_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "_home_v_blocks_feature_tabs" CASCADE;
  DROP TABLE "__home_v_insight_list_v_items" CASCADE;
  DROP TABLE "__home_v_insight_list_v" CASCADE;
  DROP TABLE "_home_v_blocks_content_columns_slider_slides" CASCADE;
  DROP TABLE "_home_v_blocks_content_columns" CASCADE;
  DROP TABLE "_home_v_blocks_content" CASCADE;
  DROP TABLE "__home_v_section_v" CASCADE;
  DROP TABLE "_home_v_blocks_slider_slides" CASCADE;
  DROP TABLE "_home_v_blocks_slider" CASCADE;
  DROP TABLE "_home_v_blocks_callout" CASCADE;
  DROP TABLE "_home_v_blocks_archive" CASCADE;
  DROP TABLE "_home_v_blocks_cta_links" CASCADE;
  DROP TABLE "_home_v_blocks_cta" CASCADE;
  DROP TABLE "_home_v_blocks_form_block" CASCADE;
  DROP TABLE "_home_v_blocks_media_block" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TABLE "_home_v_rels" CASCADE;
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "home_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "home_update";
  DROP TYPE "public"."enum_home_transition_layout";
  DROP TYPE "public"."enum_home_transition_text_size";
  DROP TYPE "public"."enum_home_transition_heading_level";
  DROP TYPE "public"."enum_home_transition_theme";
  DROP TYPE "public"."enum_home_blocks_feature_heading_offset_text_size";
  DROP TYPE "public"."enum_home_blocks_feature_heading_offset_theme";
  DROP TYPE "public"."enum_home_full_media_visual_type";
  DROP TYPE "public"."enum_home_full_media_shader_origin";
  DROP TYPE "public"."enum_home_full_media_text_size";
  DROP TYPE "public"."enum_home_full_media_width";
  DROP TYPE "public"."enum_home_full_media_aspect_ratio";
  DROP TYPE "public"."enum_home_full_media_content_position";
  DROP TYPE "public"."enum_home_full_media_theme";
  DROP TYPE "public"."enum_home_media_split_visual_type";
  DROP TYPE "public"."enum_home_media_split_shader_origin";
  DROP TYPE "public"."enum_home_media_split_text_size";
  DROP TYPE "public"."enum_home_media_split_layout";
  DROP TYPE "public"."enum_home_media_split_aspect_ratio";
  DROP TYPE "public"."enum_home_media_split_theme";
  DROP TYPE "public"."enum_home_split_narrow_visual_type";
  DROP TYPE "public"."enum_home_split_narrow_shader_origin";
  DROP TYPE "public"."enum_home_split_narrow_text_size";
  DROP TYPE "public"."enum_home_split_narrow_image_position";
  DROP TYPE "public"."enum_home_split_narrow_theme";
  DROP TYPE "public"."enum_home_blocks_carousel_split_text_size";
  DROP TYPE "public"."enum_home_blocks_carousel_split_carousel_position";
  DROP TYPE "public"."enum_home_blocks_carousel_split_slide_size";
  DROP TYPE "public"."enum_home_blocks_carousel_split_theme";
  DROP TYPE "public"."enum_home_image_pair_text_size";
  DROP TYPE "public"."enum_home_image_pair_portrait_position";
  DROP TYPE "public"."enum_home_image_pair_text_position";
  DROP TYPE "public"."enum_home_image_pair_theme";
  DROP TYPE "public"."enum_home_split_offset_text_size";
  DROP TYPE "public"."enum_home_split_offset_caption_position";
  DROP TYPE "public"."enum_home_split_offset_theme";
  DROP TYPE "public"."enum_home_image_statement_text_size";
  DROP TYPE "public"."enum_home_image_statement_text_position";
  DROP TYPE "public"."enum_home_image_statement_image_width";
  DROP TYPE "public"."enum_home_image_statement_aspect_ratio";
  DROP TYPE "public"."enum_home_image_statement_theme";
  DROP TYPE "public"."enum_home_caption_size";
  DROP TYPE "public"."enum_home_caption_theme";
  DROP TYPE "public"."enum_home_youtube_size";
  DROP TYPE "public"."enum_home_youtube_theme";
  DROP TYPE "public"."enum_home_rich_text_text_size";
  DROP TYPE "public"."enum_home_rich_text_theme";
  DROP TYPE "public"."enum_home_code_language";
  DROP TYPE "public"."enum_home_chart_width";
  DROP TYPE "public"."enum_home_chart_theme";
  DROP TYPE "public"."enum_home_diagram_width";
  DROP TYPE "public"."enum_home_diagram_theme";
  DROP TYPE "public"."enum_home_faq_link_type";
  DROP TYPE "public"."enum_home_faq_link_index_page";
  DROP TYPE "public"."enum_home_faq_text_size";
  DROP TYPE "public"."enum_home_faq_theme";
  DROP TYPE "public"."enum_home_blocks_carousel_width";
  DROP TYPE "public"."enum_home_blocks_carousel_slide_size";
  DROP TYPE "public"."enum_home_blocks_carousel_theme";
  DROP TYPE "public"."enum_home_blocks_carousel_tabs_text_size";
  DROP TYPE "public"."enum_home_blocks_carousel_tabs_deck_style";
  DROP TYPE "public"."enum_home_blocks_carousel_tabs_slide_size";
  DROP TYPE "public"."enum_home_blocks_carousel_tabs_tab_size";
  DROP TYPE "public"."enum_home_blocks_carousel_tabs_theme";
  DROP TYPE "public"."enum_home_blocks_feature_tabs_tabs_visual_type";
  DROP TYPE "public"."enum_home_blocks_feature_tabs_tabs_shader_origin";
  DROP TYPE "public"."enum_home_blocks_feature_tabs_text_size";
  DROP TYPE "public"."enum_home_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum_home_blocks_feature_tabs_theme";
  DROP TYPE "public"."enum_home_insight_list_text_size";
  DROP TYPE "public"."enum_home_insight_list_layout";
  DROP TYPE "public"."enum_home_insight_list_mark_size";
  DROP TYPE "public"."enum_home_insight_list_theme";
  DROP TYPE "public"."enum_home_blocks_content_columns_sizes";
  DROP TYPE "public"."enum_home_blocks_content_columns_content";
  DROP TYPE "public"."enum_home_blocks_content_columns_text_text_size";
  DROP TYPE "public"."enum_home_blocks_content_columns_text_link_type";
  DROP TYPE "public"."enum_home_blocks_content_columns_text_link_index_page";
  DROP TYPE "public"."enum_home_blocks_content_columns_text_link_appearance";
  DROP TYPE "public"."enum_home_blocks_content_columns_section_heading_size";
  DROP TYPE "public"."enum_home_blocks_content_columns_section_heading_align";
  DROP TYPE "public"."enum_home_blocks_content_columns_section_heading_style";
  DROP TYPE "public"."enum_home_blocks_content_columns_work_aspect";
  DROP TYPE "public"."enum_home_blocks_content_columns_work_variant";
  DROP TYPE "public"."enum_home_blocks_content_columns_post_aspect";
  DROP TYPE "public"."enum_home_blocks_content_columns_post_variant";
  DROP TYPE "public"."enum_home_blocks_content_columns_slider_theme";
  DROP TYPE "public"."enum_home_blocks_content_columns_slider_intro_content_size";
  DROP TYPE "public"."enum_home_blocks_content_columns_slider_intro_content_align";
  DROP TYPE "public"."enum_home_blocks_content_columns_slider_style";
  DROP TYPE "public"."enum_home_blocks_content_columns_slider_space_pt";
  DROP TYPE "public"."enum_home_blocks_content_columns_slider_space_pb";
  DROP TYPE "public"."enum_home_blocks_content_columns_slider_space_mt";
  DROP TYPE "public"."enum_home_blocks_content_columns_slider_space_mb";
  DROP TYPE "public"."enum_home_blocks_content_columns_media_aspect_ratio";
  DROP TYPE "public"."enum_home_blocks_content_columns_media_caption_size";
  DROP TYPE "public"."enum_home_blocks_content_columns_you_tube_aspect_ratio";
  DROP TYPE "public"."enum_home_blocks_content_theme";
  DROP TYPE "public"."enum_home_blocks_content_container_width";
  DROP TYPE "public"."enum_home_blocks_content_space_pt";
  DROP TYPE "public"."enum_home_blocks_content_space_pb";
  DROP TYPE "public"."enum_home_blocks_content_space_mt";
  DROP TYPE "public"."enum_home_blocks_content_space_mb";
  DROP TYPE "public"."enum_home_section_theme";
  DROP TYPE "public"."enum_home_section_spacing";
  DROP TYPE "public"."enum_home_section_stack";
  DROP TYPE "public"."enum_home_blocks_slider_theme";
  DROP TYPE "public"."enum_home_blocks_slider_intro_content_size";
  DROP TYPE "public"."enum_home_blocks_slider_intro_content_align";
  DROP TYPE "public"."enum_home_blocks_slider_style";
  DROP TYPE "public"."enum_home_blocks_slider_space_pt";
  DROP TYPE "public"."enum_home_blocks_slider_space_pb";
  DROP TYPE "public"."enum_home_blocks_slider_space_mt";
  DROP TYPE "public"."enum_home_blocks_slider_space_mb";
  DROP TYPE "public"."enum_home_blocks_archive_theme";
  DROP TYPE "public"."enum_home_blocks_archive_card_style";
  DROP TYPE "public"."enum_home_blocks_archive_populate_by";
  DROP TYPE "public"."enum_home_blocks_archive_relation_to";
  DROP TYPE "public"."enum_home_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_home_blocks_cta_links_link_index_page";
  DROP TYPE "public"."enum_home_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_home_blocks_form_block_space_pt";
  DROP TYPE "public"."enum_home_blocks_form_block_space_pb";
  DROP TYPE "public"."enum_home_blocks_form_block_space_mt";
  DROP TYPE "public"."enum_home_blocks_form_block_space_mb";
  DROP TYPE "public"."enum_home_blocks_form_block_intro_align";
  DROP TYPE "public"."enum_home_blocks_media_block_aspect_ratio";
  DROP TYPE "public"."enum_home_blocks_media_block_theme";
  DROP TYPE "public"."enum_home_blocks_media_block_caption_layout";
  DROP TYPE "public"."enum_home_blocks_media_block_text_size";
  DROP TYPE "public"."enum_home_blocks_media_block_space_pt";
  DROP TYPE "public"."enum_home_blocks_media_block_space_pb";
  DROP TYPE "public"."enum_home_blocks_media_block_space_mt";
  DROP TYPE "public"."enum_home_blocks_media_block_space_mb";
  DROP TYPE "public"."enum_home_status";
  DROP TYPE "public"."enum___home_v_transition_v_layout";
  DROP TYPE "public"."enum___home_v_transition_v_text_size";
  DROP TYPE "public"."enum___home_v_transition_v_heading_level";
  DROP TYPE "public"."enum___home_v_transition_v_theme";
  DROP TYPE "public"."enum__home_v_blocks_feature_heading_offset_text_size";
  DROP TYPE "public"."enum__home_v_blocks_feature_heading_offset_theme";
  DROP TYPE "public"."enum___home_v_full_media_v_visual_type";
  DROP TYPE "public"."enum___home_v_full_media_v_shader_origin";
  DROP TYPE "public"."enum___home_v_full_media_v_text_size";
  DROP TYPE "public"."enum___home_v_full_media_v_width";
  DROP TYPE "public"."enum___home_v_full_media_v_aspect_ratio";
  DROP TYPE "public"."enum___home_v_full_media_v_content_position";
  DROP TYPE "public"."enum___home_v_full_media_v_theme";
  DROP TYPE "public"."enum___home_v_media_split_v_visual_type";
  DROP TYPE "public"."enum___home_v_media_split_v_shader_origin";
  DROP TYPE "public"."enum___home_v_media_split_v_text_size";
  DROP TYPE "public"."enum___home_v_media_split_v_layout";
  DROP TYPE "public"."enum___home_v_media_split_v_aspect_ratio";
  DROP TYPE "public"."enum___home_v_media_split_v_theme";
  DROP TYPE "public"."enum___home_v_split_narrow_v_visual_type";
  DROP TYPE "public"."enum___home_v_split_narrow_v_shader_origin";
  DROP TYPE "public"."enum___home_v_split_narrow_v_text_size";
  DROP TYPE "public"."enum___home_v_split_narrow_v_image_position";
  DROP TYPE "public"."enum___home_v_split_narrow_v_theme";
  DROP TYPE "public"."enum__home_v_blocks_carousel_split_text_size";
  DROP TYPE "public"."enum__home_v_blocks_carousel_split_carousel_position";
  DROP TYPE "public"."enum__home_v_blocks_carousel_split_slide_size";
  DROP TYPE "public"."enum__home_v_blocks_carousel_split_theme";
  DROP TYPE "public"."enum___home_v_image_pair_v_text_size";
  DROP TYPE "public"."enum___home_v_image_pair_v_portrait_position";
  DROP TYPE "public"."enum___home_v_image_pair_v_text_position";
  DROP TYPE "public"."enum___home_v_image_pair_v_theme";
  DROP TYPE "public"."enum___home_v_split_offset_v_text_size";
  DROP TYPE "public"."enum___home_v_split_offset_v_caption_position";
  DROP TYPE "public"."enum___home_v_split_offset_v_theme";
  DROP TYPE "public"."enum___home_v_image_statement_v_text_size";
  DROP TYPE "public"."enum___home_v_image_statement_v_text_position";
  DROP TYPE "public"."enum___home_v_image_statement_v_image_width";
  DROP TYPE "public"."enum___home_v_image_statement_v_aspect_ratio";
  DROP TYPE "public"."enum___home_v_image_statement_v_theme";
  DROP TYPE "public"."enum___home_v_caption_v_size";
  DROP TYPE "public"."enum___home_v_caption_v_theme";
  DROP TYPE "public"."enum___home_v_youtube_v_size";
  DROP TYPE "public"."enum___home_v_youtube_v_theme";
  DROP TYPE "public"."enum___home_v_rich_text_v_text_size";
  DROP TYPE "public"."enum___home_v_rich_text_v_theme";
  DROP TYPE "public"."enum___home_v_code_v_language";
  DROP TYPE "public"."enum___home_v_chart_v_width";
  DROP TYPE "public"."enum___home_v_chart_v_theme";
  DROP TYPE "public"."enum___home_v_diagram_v_width";
  DROP TYPE "public"."enum___home_v_diagram_v_theme";
  DROP TYPE "public"."enum___home_v_faq_v_link_type";
  DROP TYPE "public"."enum___home_v_faq_v_link_index_page";
  DROP TYPE "public"."enum___home_v_faq_v_text_size";
  DROP TYPE "public"."enum___home_v_faq_v_theme";
  DROP TYPE "public"."enum__home_v_blocks_carousel_width";
  DROP TYPE "public"."enum__home_v_blocks_carousel_slide_size";
  DROP TYPE "public"."enum__home_v_blocks_carousel_theme";
  DROP TYPE "public"."enum__home_v_blocks_carousel_tabs_text_size";
  DROP TYPE "public"."enum__home_v_blocks_carousel_tabs_deck_style";
  DROP TYPE "public"."enum__home_v_blocks_carousel_tabs_slide_size";
  DROP TYPE "public"."enum__home_v_blocks_carousel_tabs_tab_size";
  DROP TYPE "public"."enum__home_v_blocks_carousel_tabs_theme";
  DROP TYPE "public"."enum__home_v_blocks_feature_tabs_tabs_visual_type";
  DROP TYPE "public"."enum__home_v_blocks_feature_tabs_tabs_shader_origin";
  DROP TYPE "public"."enum__home_v_blocks_feature_tabs_text_size";
  DROP TYPE "public"."enum__home_v_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum__home_v_blocks_feature_tabs_theme";
  DROP TYPE "public"."enum___home_v_insight_list_v_text_size";
  DROP TYPE "public"."enum___home_v_insight_list_v_layout";
  DROP TYPE "public"."enum___home_v_insight_list_v_mark_size";
  DROP TYPE "public"."enum___home_v_insight_list_v_theme";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_sizes";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_content";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_text_text_size";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_text_link_type";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_text_link_index_page";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_text_link_appearance";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_section_heading_size";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_section_heading_align";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_section_heading_style";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_work_aspect";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_work_variant";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_post_aspect";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_post_variant";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_slider_theme";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_slider_intro_content_size";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_slider_intro_content_align";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_slider_style";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_slider_space_pt";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_slider_space_pb";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_slider_space_mt";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_slider_space_mb";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_media_aspect_ratio";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_media_caption_size";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_you_tube_aspect_ratio";
  DROP TYPE "public"."enum__home_v_blocks_content_theme";
  DROP TYPE "public"."enum__home_v_blocks_content_container_width";
  DROP TYPE "public"."enum__home_v_blocks_content_space_pt";
  DROP TYPE "public"."enum__home_v_blocks_content_space_pb";
  DROP TYPE "public"."enum__home_v_blocks_content_space_mt";
  DROP TYPE "public"."enum__home_v_blocks_content_space_mb";
  DROP TYPE "public"."enum___home_v_section_v_theme";
  DROP TYPE "public"."enum___home_v_section_v_spacing";
  DROP TYPE "public"."enum___home_v_section_v_stack";
  DROP TYPE "public"."enum__home_v_blocks_slider_theme";
  DROP TYPE "public"."enum__home_v_blocks_slider_intro_content_size";
  DROP TYPE "public"."enum__home_v_blocks_slider_intro_content_align";
  DROP TYPE "public"."enum__home_v_blocks_slider_style";
  DROP TYPE "public"."enum__home_v_blocks_slider_space_pt";
  DROP TYPE "public"."enum__home_v_blocks_slider_space_pb";
  DROP TYPE "public"."enum__home_v_blocks_slider_space_mt";
  DROP TYPE "public"."enum__home_v_blocks_slider_space_mb";
  DROP TYPE "public"."enum__home_v_blocks_archive_theme";
  DROP TYPE "public"."enum__home_v_blocks_archive_card_style";
  DROP TYPE "public"."enum__home_v_blocks_archive_populate_by";
  DROP TYPE "public"."enum__home_v_blocks_archive_relation_to";
  DROP TYPE "public"."enum__home_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__home_v_blocks_cta_links_link_index_page";
  DROP TYPE "public"."enum__home_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__home_v_blocks_form_block_space_pt";
  DROP TYPE "public"."enum__home_v_blocks_form_block_space_pb";
  DROP TYPE "public"."enum__home_v_blocks_form_block_space_mt";
  DROP TYPE "public"."enum__home_v_blocks_form_block_space_mb";
  DROP TYPE "public"."enum__home_v_blocks_form_block_intro_align";
  DROP TYPE "public"."enum__home_v_blocks_media_block_aspect_ratio";
  DROP TYPE "public"."enum__home_v_blocks_media_block_theme";
  DROP TYPE "public"."enum__home_v_blocks_media_block_caption_layout";
  DROP TYPE "public"."enum__home_v_blocks_media_block_text_size";
  DROP TYPE "public"."enum__home_v_blocks_media_block_space_pt";
  DROP TYPE "public"."enum__home_v_blocks_media_block_space_pb";
  DROP TYPE "public"."enum__home_v_blocks_media_block_space_mt";
  DROP TYPE "public"."enum__home_v_blocks_media_block_space_mb";
  DROP TYPE "public"."enum__home_v_version_status";`)
}
