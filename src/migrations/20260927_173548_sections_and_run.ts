import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_transition_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement', 'prose');
  CREATE TYPE "public"."enum_pages_transition_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_transition_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_pages_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_pages_blocks_feature_heading_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_full_media_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_pages_full_media_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_visual_surface" AS ENUM('auto', 'dark', 'light');
  CREATE TYPE "public"."enum_leak_hover_targets" AS ENUM('interactive', 'marked');
  CREATE TYPE "public"."enum_pages_full_media_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_pages_full_media_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_pages_full_media_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_full_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_media_split_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_pages_media_split_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_pages_media_split_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_media_split_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_pages_media_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_split_narrow_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_pages_split_narrow_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_pages_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_split_narrow_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_image_pair_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_image_pair_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum_pages_image_pair_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_split_offset_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_split_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_image_statement_text_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_image_statement_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_pages_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum_pages_image_statement_aspect_ratio" AS ENUM('responsive', '16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_pages_image_statement_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_caption_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_pages_caption_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_youtube_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_pages_youtube_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_rich_text_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_code_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum_pages_faq_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_faq_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_pages_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_pages_blocks_carousel_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_tabs_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_tabs_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_insight_list_layout" AS ENUM('side', 'stacked', 'ledger');
  CREATE TYPE "public"."enum_pages_insight_list_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_pages_insight_list_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_section_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum_pages_section_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_pages_section_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___pages_v_transition_v_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement', 'prose');
  CREATE TYPE "public"."enum___pages_v_transition_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_transition_v_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_heading_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_full_media_v_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum___pages_v_full_media_v_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___pages_v_full_media_v_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum___pages_v_full_media_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___pages_v_full_media_v_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___pages_v_full_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_media_split_v_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum___pages_v_media_split_v_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___pages_v_media_split_v_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___pages_v_media_split_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___pages_v_media_split_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_split_narrow_v_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum___pages_v_split_narrow_v_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___pages_v_split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___pages_v_split_narrow_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_image_pair_v_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___pages_v_image_pair_v_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum___pages_v_image_pair_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_split_offset_v_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___pages_v_split_offset_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_image_statement_v_text_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___pages_v_image_statement_v_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum___pages_v_image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum___pages_v_image_statement_v_aspect_ratio" AS ENUM('responsive', '16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___pages_v_image_statement_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_caption_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___pages_v_caption_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_youtube_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___pages_v_youtube_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_rich_text_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_code_v_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum___pages_v_faq_v_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum___pages_v_faq_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_insight_list_v_layout" AS ENUM('side', 'stacked', 'ledger');
  CREATE TYPE "public"."enum___pages_v_insight_list_v_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___pages_v_insight_list_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_section_v_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum___pages_v_section_v_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___pages_v_section_v_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_posts_transition_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement', 'prose');
  CREATE TYPE "public"."enum_posts_transition_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_transition_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_posts_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_posts_blocks_feature_heading_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_full_media_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_posts_full_media_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_posts_full_media_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_posts_full_media_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_posts_full_media_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_full_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_media_split_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_posts_media_split_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_posts_media_split_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_media_split_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_posts_media_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_split_narrow_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_posts_split_narrow_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_posts_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_split_narrow_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_image_pair_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_image_pair_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum_posts_image_pair_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_split_offset_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_split_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_image_statement_text_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_image_statement_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_posts_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum_posts_image_statement_aspect_ratio" AS ENUM('responsive', '16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_posts_image_statement_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_caption_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_posts_caption_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_youtube_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_posts_youtube_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_rich_text_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_code_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum_posts_faq_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_posts_faq_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_posts_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_posts_blocks_carousel_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_blocks_feature_tabs_tabs_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_posts_blocks_feature_tabs_tabs_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_posts_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_posts_blocks_feature_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_insight_list_layout" AS ENUM('side', 'stacked', 'ledger');
  CREATE TYPE "public"."enum_posts_insight_list_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_posts_insight_list_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_sizes" AS ENUM('oneThird', 'half', 'twoThirds', 'fiveCols', 'full');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_content" AS ENUM('text', 'sectionHeading', 'work', 'post', 'media', 'slider', 'youTube');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_text_text_size" AS ENUM('sm', 'base', 'lg', 'xl', '2xl');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_text_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_text_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_section_heading_size" AS ENUM('base', 'lg', 'xl');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_section_heading_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_section_heading_style" AS ENUM('default', 'border', 'jumbo');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_work_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_work_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_post_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_post_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_slider_theme" AS ENUM('system', 'light', 'dark');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_slider_intro_content_size" AS ENUM('base', 'lg', 'xl');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_slider_intro_content_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_slider_style" AS ENUM('default', 'cropped', 'single');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_slider_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_slider_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_slider_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_slider_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_media_aspect_ratio" AS ENUM('square', 'landscape', 'portrait', 'original');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_media_caption_size" AS ENUM('normal', 'large', 'xl');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_you_tube_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
  CREATE TYPE "public"."enum_posts_blocks_content_theme" AS ENUM('system', 'light', 'dark');
  CREATE TYPE "public"."enum_posts_blocks_content_container_width" AS ENUM('contained', 'fullWidth');
  CREATE TYPE "public"."enum_posts_blocks_content_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_posts_blocks_content_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_posts_blocks_content_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_posts_blocks_content_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_posts_section_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum_posts_section_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_posts_section_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___posts_v_transition_v_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement', 'prose');
  CREATE TYPE "public"."enum___posts_v_transition_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_transition_v_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__posts_v_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum__posts_v_blocks_feature_heading_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_full_media_v_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum___posts_v_full_media_v_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___posts_v_full_media_v_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum___posts_v_full_media_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___posts_v_full_media_v_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_full_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_media_split_v_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum___posts_v_media_split_v_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___posts_v_media_split_v_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_media_split_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___posts_v_media_split_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_split_narrow_v_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum___posts_v_split_narrow_v_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___posts_v_split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_split_narrow_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_image_pair_v_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_image_pair_v_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum___posts_v_image_pair_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_split_offset_v_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_split_offset_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_image_statement_v_text_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_image_statement_v_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum___posts_v_image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum___posts_v_image_statement_v_aspect_ratio" AS ENUM('responsive', '16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___posts_v_image_statement_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_caption_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___posts_v_caption_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_youtube_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___posts_v_youtube_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_rich_text_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_code_v_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum___posts_v_faq_v_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum___posts_v_faq_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__posts_v_blocks_feature_tabs_tabs_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum__posts_v_blocks_feature_tabs_tabs_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum__posts_v_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__posts_v_blocks_feature_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_insight_list_v_layout" AS ENUM('side', 'stacked', 'ledger');
  CREATE TYPE "public"."enum___posts_v_insight_list_v_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___posts_v_insight_list_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_sizes" AS ENUM('oneThird', 'half', 'twoThirds', 'fiveCols', 'full');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_content" AS ENUM('text', 'sectionHeading', 'work', 'post', 'media', 'slider', 'youTube');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_text_text_size" AS ENUM('sm', 'base', 'lg', 'xl', '2xl');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_text_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_text_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_section_heading_size" AS ENUM('base', 'lg', 'xl');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_section_heading_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_section_heading_style" AS ENUM('default', 'border', 'jumbo');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_work_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_work_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_post_aspect" AS ENUM('wide', 'square', 'portrait');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_post_variant" AS ENUM('featured', 'card');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_slider_theme" AS ENUM('system', 'light', 'dark');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_slider_intro_content_size" AS ENUM('base', 'lg', 'xl');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_slider_intro_content_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_slider_style" AS ENUM('default', 'cropped', 'single');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_slider_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_slider_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_slider_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_slider_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_media_aspect_ratio" AS ENUM('square', 'landscape', 'portrait', 'original');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_media_caption_size" AS ENUM('normal', 'large', 'xl');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_you_tube_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
  CREATE TYPE "public"."enum__posts_v_blocks_content_theme" AS ENUM('system', 'light', 'dark');
  CREATE TYPE "public"."enum__posts_v_blocks_content_container_width" AS ENUM('contained', 'fullWidth');
  CREATE TYPE "public"."enum__posts_v_blocks_content_space_pt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__posts_v_blocks_content_space_pb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__posts_v_blocks_content_space_mt" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__posts_v_blocks_content_space_mb" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum___posts_v_section_v_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum___posts_v_section_v_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___posts_v_section_v_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_works_transition_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement', 'prose');
  CREATE TYPE "public"."enum_works_transition_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_transition_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_works_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_works_blocks_feature_heading_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_full_media_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_works_full_media_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_works_full_media_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_works_full_media_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_works_full_media_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_works_full_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_media_split_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_works_media_split_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_works_media_split_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_works_media_split_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_works_media_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_split_narrow_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_works_split_narrow_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_works_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_works_split_narrow_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_image_pair_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_works_image_pair_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum_works_image_pair_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_split_offset_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_works_split_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_image_statement_text_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_works_image_statement_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_works_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum_works_image_statement_aspect_ratio" AS ENUM('responsive', '16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_works_image_statement_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_caption_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_works_caption_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_youtube_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_works_youtube_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_rich_text_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_code_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum_works_faq_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_works_faq_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_works_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_works_blocks_carousel_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_blocks_feature_tabs_tabs_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_works_blocks_feature_tabs_tabs_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_works_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_works_blocks_feature_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_insight_list_layout" AS ENUM('side', 'stacked', 'ledger');
  CREATE TYPE "public"."enum_works_insight_list_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_works_insight_list_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_works_section_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum_works_section_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_works_section_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___works_v_transition_v_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement', 'prose');
  CREATE TYPE "public"."enum___works_v_transition_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_transition_v_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__works_v_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum__works_v_blocks_feature_heading_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_full_media_v_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum___works_v_full_media_v_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___works_v_full_media_v_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum___works_v_full_media_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___works_v_full_media_v_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___works_v_full_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_media_split_v_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum___works_v_media_split_v_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___works_v_media_split_v_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___works_v_media_split_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___works_v_media_split_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_split_narrow_v_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum___works_v_split_narrow_v_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___works_v_split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___works_v_split_narrow_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_image_pair_v_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___works_v_image_pair_v_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum___works_v_image_pair_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_split_offset_v_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___works_v_split_offset_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_image_statement_v_text_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___works_v_image_statement_v_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum___works_v_image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum___works_v_image_statement_v_aspect_ratio" AS ENUM('responsive', '16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___works_v_image_statement_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_caption_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___works_v_caption_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_youtube_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___works_v_youtube_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_rich_text_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_code_v_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum___works_v_faq_v_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum___works_v_faq_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__works_v_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum__works_v_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__works_v_blocks_carousel_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__works_v_blocks_feature_tabs_tabs_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum__works_v_blocks_feature_tabs_tabs_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum__works_v_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__works_v_blocks_feature_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_insight_list_v_layout" AS ENUM('side', 'stacked', 'ledger');
  CREATE TYPE "public"."enum___works_v_insight_list_v_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___works_v_insight_list_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___works_v_section_v_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum___works_v_section_v_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___works_v_section_v_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TABLE "pages_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum_pages_transition_layout" DEFAULT 'offset',
  	"theme" "enum_pages_transition_theme" DEFAULT 'light',
  	"heading_level" "enum_pages_transition_heading_level" DEFAULT 'h2',
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"body_size" "enum_pages_blocks_feature_heading_offset_body_size" DEFAULT 'medium',
  	"theme" "enum_pages_blocks_feature_heading_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_full_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum_pages_full_media_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_pages_full_media_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"width" "enum_pages_full_media_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_pages_full_media_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum_pages_full_media_content_position" DEFAULT 'left',
  	"theme" "enum_pages_full_media_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_media_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum_pages_media_split_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_pages_media_split_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"layout" "enum_pages_media_split_layout" DEFAULT 'left',
  	"aspect_ratio" "enum_pages_media_split_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum_pages_media_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_split_narrow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum_pages_split_narrow_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_pages_split_narrow_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"image_position" "enum_pages_split_narrow_image_position" DEFAULT 'left',
  	"theme" "enum_pages_split_narrow_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"portrait_position" "enum_pages_image_pair_portrait_position" DEFAULT 'left',
  	"text_position" "enum_pages_image_pair_text_position" DEFAULT 'under-portrait',
  	"theme" "enum_pages_image_pair_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_split_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"caption_position" "enum_pages_split_offset_caption_position" DEFAULT 'left',
  	"theme" "enum_pages_split_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" jsonb,
  	"text_position" "enum_pages_image_statement_text_position" DEFAULT 'left',
  	"text_size" "enum_pages_image_statement_text_size" DEFAULT 'default',
  	"image_width" "enum_pages_image_statement_image_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_pages_image_statement_aspect_ratio" DEFAULT 'responsive',
  	"theme" "enum_pages_image_statement_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_caption" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum_pages_caption_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"theme" "enum_pages_caption_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_youtube" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum_pages_youtube_size" DEFAULT 'full',
  	"theme" "enum_pages_youtube_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum_pages_rich_text_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_pages_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "pages_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum_pages_faq_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum_pages_faq_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_pages_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum_pages_blocks_carousel_slide_size" DEFAULT 'full',
  	"theme" "enum_pages_blocks_carousel_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"visual_type" "enum_pages_blocks_feature_tabs_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_pages_blocks_feature_tabs_tabs_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tab_size" "enum_pages_blocks_feature_tabs_tab_size" DEFAULT 'default',
  	"theme" "enum_pages_blocks_feature_tabs_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_insight_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_insight_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_pages_insight_list_layout" DEFAULT 'side',
  	"mark_size" "enum_pages_insight_list_mark_size" DEFAULT 'medium',
  	"theme" "enum_pages_insight_list_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum_pages_section_theme" DEFAULT 'inherit',
  	"spacing" "enum_pages_section_spacing" DEFAULT 'default',
  	"stack" "enum_pages_section_stack" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum___pages_v_transition_v_layout" DEFAULT 'offset',
  	"theme" "enum___pages_v_transition_v_theme" DEFAULT 'light',
  	"heading_level" "enum___pages_v_transition_v_heading_level" DEFAULT 'h2',
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"body_size" "enum__pages_v_blocks_feature_heading_offset_body_size" DEFAULT 'medium',
  	"theme" "enum__pages_v_blocks_feature_heading_offset_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_full_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum___pages_v_full_media_v_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum___pages_v_full_media_v_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"width" "enum___pages_v_full_media_v_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___pages_v_full_media_v_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum___pages_v_full_media_v_content_position" DEFAULT 'left',
  	"theme" "enum___pages_v_full_media_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_media_split_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum___pages_v_media_split_v_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum___pages_v_media_split_v_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"layout" "enum___pages_v_media_split_v_layout" DEFAULT 'left',
  	"aspect_ratio" "enum___pages_v_media_split_v_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum___pages_v_media_split_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_split_narrow_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum___pages_v_split_narrow_v_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum___pages_v_split_narrow_v_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"image_position" "enum___pages_v_split_narrow_v_image_position" DEFAULT 'left',
  	"theme" "enum___pages_v_split_narrow_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_image_pair_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"portrait_position" "enum___pages_v_image_pair_v_portrait_position" DEFAULT 'left',
  	"text_position" "enum___pages_v_image_pair_v_text_position" DEFAULT 'under-portrait',
  	"theme" "enum___pages_v_image_pair_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_split_offset_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"caption_position" "enum___pages_v_split_offset_v_caption_position" DEFAULT 'left',
  	"theme" "enum___pages_v_split_offset_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" jsonb,
  	"text_position" "enum___pages_v_image_statement_v_text_position" DEFAULT 'left',
  	"text_size" "enum___pages_v_image_statement_v_text_size" DEFAULT 'default',
  	"image_width" "enum___pages_v_image_statement_v_image_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___pages_v_image_statement_v_aspect_ratio" DEFAULT 'responsive',
  	"theme" "enum___pages_v_image_statement_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_caption_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum___pages_v_caption_v_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"theme" "enum___pages_v_caption_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_youtube_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum___pages_v_youtube_v_size" DEFAULT 'full',
  	"theme" "enum___pages_v_youtube_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_rich_text_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum___pages_v_rich_text_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_code_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum___pages_v_code_v_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_faq_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_faq_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum___pages_v_faq_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum___pages_v_faq_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__pages_v_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum__pages_v_blocks_carousel_slide_size" DEFAULT 'full',
  	"theme" "enum__pages_v_blocks_carousel_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"visual_type" "enum__pages_v_blocks_feature_tabs_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum__pages_v_blocks_feature_tabs_tabs_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tab_size" "enum__pages_v_blocks_feature_tabs_tab_size" DEFAULT 'default',
  	"theme" "enum__pages_v_blocks_feature_tabs_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_insight_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_insight_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___pages_v_insight_list_v_layout" DEFAULT 'side',
  	"mark_size" "enum___pages_v_insight_list_v_mark_size" DEFAULT 'medium',
  	"theme" "enum___pages_v_insight_list_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_section_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum___pages_v_section_v_theme" DEFAULT 'inherit',
  	"spacing" "enum___pages_v_section_v_spacing" DEFAULT 'default',
  	"stack" "enum___pages_v_section_v_stack" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum_posts_transition_layout" DEFAULT 'offset',
  	"theme" "enum_posts_transition_theme" DEFAULT 'light',
  	"heading_level" "enum_posts_transition_heading_level" DEFAULT 'h2',
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"body_size" "enum_posts_blocks_feature_heading_offset_body_size" DEFAULT 'medium',
  	"theme" "enum_posts_blocks_feature_heading_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_full_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum_posts_full_media_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_posts_full_media_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"width" "enum_posts_full_media_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_posts_full_media_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum_posts_full_media_content_position" DEFAULT 'left',
  	"theme" "enum_posts_full_media_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_media_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum_posts_media_split_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_posts_media_split_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"layout" "enum_posts_media_split_layout" DEFAULT 'left',
  	"aspect_ratio" "enum_posts_media_split_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum_posts_media_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_split_narrow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum_posts_split_narrow_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_posts_split_narrow_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"image_position" "enum_posts_split_narrow_image_position" DEFAULT 'left',
  	"theme" "enum_posts_split_narrow_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"portrait_position" "enum_posts_image_pair_portrait_position" DEFAULT 'left',
  	"text_position" "enum_posts_image_pair_text_position" DEFAULT 'under-portrait',
  	"theme" "enum_posts_image_pair_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_split_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"caption_position" "enum_posts_split_offset_caption_position" DEFAULT 'left',
  	"theme" "enum_posts_split_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" jsonb,
  	"text_position" "enum_posts_image_statement_text_position" DEFAULT 'left',
  	"text_size" "enum_posts_image_statement_text_size" DEFAULT 'default',
  	"image_width" "enum_posts_image_statement_image_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_posts_image_statement_aspect_ratio" DEFAULT 'responsive',
  	"theme" "enum_posts_image_statement_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_caption" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum_posts_caption_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"theme" "enum_posts_caption_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_youtube" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum_posts_youtube_size" DEFAULT 'full',
  	"theme" "enum_posts_youtube_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum_posts_rich_text_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_posts_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "posts_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum_posts_faq_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum_posts_faq_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "posts_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_posts_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum_posts_blocks_carousel_slide_size" DEFAULT 'full',
  	"theme" "enum_posts_blocks_carousel_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "posts_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"visual_type" "enum_posts_blocks_feature_tabs_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_posts_blocks_feature_tabs_tabs_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "posts_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tab_size" "enum_posts_blocks_feature_tabs_tab_size" DEFAULT 'default',
  	"theme" "enum_posts_blocks_feature_tabs_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_insight_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "posts_insight_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_posts_insight_list_layout" DEFAULT 'side',
  	"mark_size" "enum_posts_insight_list_mark_size" DEFAULT 'medium',
  	"theme" "enum_posts_insight_list_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_content_columns_slider_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slide_image_id" integer,
  	"slide_caption" varchar
  );
  
  CREATE TABLE "posts_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sizes" "enum_posts_blocks_content_columns_sizes" DEFAULT 'oneThird',
  	"content" "enum_posts_blocks_content_columns_content" DEFAULT 'text',
  	"text_rich_text" jsonb DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb,
  	"text_text_size" "enum_posts_blocks_content_columns_text_text_size" DEFAULT 'base',
  	"text_enable_link" boolean,
  	"text_link_type" "enum_posts_blocks_content_columns_text_link_type" DEFAULT 'reference',
  	"text_link_new_tab" boolean,
  	"text_link_url" varchar,
  	"text_link_label" varchar,
  	"text_link_appearance" "enum_posts_blocks_content_columns_text_link_appearance" DEFAULT 'default',
  	"section_heading_eyebrow" varchar,
  	"section_heading_content" jsonb DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb,
  	"section_heading_size" "enum_posts_blocks_content_columns_section_heading_size" DEFAULT 'base',
  	"section_heading_align" "enum_posts_blocks_content_columns_section_heading_align" DEFAULT 'left',
  	"section_heading_style" "enum_posts_blocks_content_columns_section_heading_style" DEFAULT 'default',
  	"work_works_id" integer,
  	"work_aspect" "enum_posts_blocks_content_columns_work_aspect" DEFAULT 'wide',
  	"work_variant" "enum_posts_blocks_content_columns_work_variant" DEFAULT 'featured',
  	"post_posts_id" integer,
  	"post_aspect" "enum_posts_blocks_content_columns_post_aspect" DEFAULT 'wide',
  	"post_variant" "enum_posts_blocks_content_columns_post_variant" DEFAULT 'featured',
  	"slider_theme" "enum_posts_blocks_content_columns_slider_theme" DEFAULT 'system',
  	"slider_intro_content_heading" varchar,
  	"slider_intro_content_subheading" varchar,
  	"slider_intro_content_size" "enum_posts_blocks_content_columns_slider_intro_content_size" DEFAULT 'base',
  	"slider_intro_content_align" "enum_posts_blocks_content_columns_slider_intro_content_align" DEFAULT 'left',
  	"slider_style" "enum_posts_blocks_content_columns_slider_style" DEFAULT 'default',
  	"slider_space_pt" "enum_posts_blocks_content_columns_slider_space_pt" DEFAULT 'md',
  	"slider_space_pb" "enum_posts_blocks_content_columns_slider_space_pb" DEFAULT 'md',
  	"slider_space_mt" "enum_posts_blocks_content_columns_slider_space_mt" DEFAULT 'none',
  	"slider_space_mb" "enum_posts_blocks_content_columns_slider_space_mb" DEFAULT 'none',
  	"media_media_id" integer,
  	"media_aspect_ratio" "enum_posts_blocks_content_columns_media_aspect_ratio" DEFAULT 'landscape',
  	"media_full_width" boolean DEFAULT false,
  	"media_caption_size" "enum_posts_blocks_content_columns_media_caption_size" DEFAULT 'normal',
  	"you_tube_url" varchar,
  	"you_tube_aspect_ratio" "enum_posts_blocks_content_columns_you_tube_aspect_ratio" DEFAULT 'landscape',
  	"you_tube_full_width" boolean DEFAULT false
  );
  
  CREATE TABLE "posts_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_posts_blocks_content_theme" DEFAULT 'system',
  	"container_width" "enum_posts_blocks_content_container_width" DEFAULT 'contained',
  	"space_pt" "enum_posts_blocks_content_space_pt" DEFAULT 'md',
  	"space_pb" "enum_posts_blocks_content_space_pb" DEFAULT 'md',
  	"space_mt" "enum_posts_blocks_content_space_mt" DEFAULT 'none',
  	"space_mb" "enum_posts_blocks_content_space_mb" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum_posts_section_theme" DEFAULT 'inherit',
  	"spacing" "enum_posts_section_spacing" DEFAULT 'default',
  	"stack" "enum_posts_section_stack" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum___posts_v_transition_v_layout" DEFAULT 'offset',
  	"theme" "enum___posts_v_transition_v_theme" DEFAULT 'light',
  	"heading_level" "enum___posts_v_transition_v_heading_level" DEFAULT 'h2',
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"body_size" "enum__posts_v_blocks_feature_heading_offset_body_size" DEFAULT 'medium',
  	"theme" "enum__posts_v_blocks_feature_heading_offset_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_full_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum___posts_v_full_media_v_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum___posts_v_full_media_v_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"width" "enum___posts_v_full_media_v_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___posts_v_full_media_v_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum___posts_v_full_media_v_content_position" DEFAULT 'left',
  	"theme" "enum___posts_v_full_media_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_media_split_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum___posts_v_media_split_v_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum___posts_v_media_split_v_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"layout" "enum___posts_v_media_split_v_layout" DEFAULT 'left',
  	"aspect_ratio" "enum___posts_v_media_split_v_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum___posts_v_media_split_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_split_narrow_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum___posts_v_split_narrow_v_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum___posts_v_split_narrow_v_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"image_position" "enum___posts_v_split_narrow_v_image_position" DEFAULT 'left',
  	"theme" "enum___posts_v_split_narrow_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_image_pair_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"portrait_position" "enum___posts_v_image_pair_v_portrait_position" DEFAULT 'left',
  	"text_position" "enum___posts_v_image_pair_v_text_position" DEFAULT 'under-portrait',
  	"theme" "enum___posts_v_image_pair_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_split_offset_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"caption_position" "enum___posts_v_split_offset_v_caption_position" DEFAULT 'left',
  	"theme" "enum___posts_v_split_offset_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" jsonb,
  	"text_position" "enum___posts_v_image_statement_v_text_position" DEFAULT 'left',
  	"text_size" "enum___posts_v_image_statement_v_text_size" DEFAULT 'default',
  	"image_width" "enum___posts_v_image_statement_v_image_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___posts_v_image_statement_v_aspect_ratio" DEFAULT 'responsive',
  	"theme" "enum___posts_v_image_statement_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_caption_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum___posts_v_caption_v_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"theme" "enum___posts_v_caption_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_youtube_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum___posts_v_youtube_v_size" DEFAULT 'full',
  	"theme" "enum___posts_v_youtube_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_rich_text_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum___posts_v_rich_text_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_code_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum___posts_v_code_v_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_faq_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__posts_v_faq_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum___posts_v_faq_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum___posts_v_faq_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__posts_v_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum__posts_v_blocks_carousel_slide_size" DEFAULT 'full',
  	"theme" "enum__posts_v_blocks_carousel_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"visual_type" "enum__posts_v_blocks_feature_tabs_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum__posts_v_blocks_feature_tabs_tabs_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tab_size" "enum__posts_v_blocks_feature_tabs_tab_size" DEFAULT 'default',
  	"theme" "enum__posts_v_blocks_feature_tabs_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_insight_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__posts_v_insight_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___posts_v_insight_list_v_layout" DEFAULT 'side',
  	"mark_size" "enum___posts_v_insight_list_v_mark_size" DEFAULT 'medium',
  	"theme" "enum___posts_v_insight_list_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_content_columns_slider_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slide_image_id" integer,
  	"slide_caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"sizes" "enum__posts_v_blocks_content_columns_sizes" DEFAULT 'oneThird',
  	"content" "enum__posts_v_blocks_content_columns_content" DEFAULT 'text',
  	"text_rich_text" jsonb DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb,
  	"text_text_size" "enum__posts_v_blocks_content_columns_text_text_size" DEFAULT 'base',
  	"text_enable_link" boolean,
  	"text_link_type" "enum__posts_v_blocks_content_columns_text_link_type" DEFAULT 'reference',
  	"text_link_new_tab" boolean,
  	"text_link_url" varchar,
  	"text_link_label" varchar,
  	"text_link_appearance" "enum__posts_v_blocks_content_columns_text_link_appearance" DEFAULT 'default',
  	"section_heading_eyebrow" varchar,
  	"section_heading_content" jsonb DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[]}],"direction":"ltr","format":"","indent":0,"version":1}}'::jsonb,
  	"section_heading_size" "enum__posts_v_blocks_content_columns_section_heading_size" DEFAULT 'base',
  	"section_heading_align" "enum__posts_v_blocks_content_columns_section_heading_align" DEFAULT 'left',
  	"section_heading_style" "enum__posts_v_blocks_content_columns_section_heading_style" DEFAULT 'default',
  	"work_works_id" integer,
  	"work_aspect" "enum__posts_v_blocks_content_columns_work_aspect" DEFAULT 'wide',
  	"work_variant" "enum__posts_v_blocks_content_columns_work_variant" DEFAULT 'featured',
  	"post_posts_id" integer,
  	"post_aspect" "enum__posts_v_blocks_content_columns_post_aspect" DEFAULT 'wide',
  	"post_variant" "enum__posts_v_blocks_content_columns_post_variant" DEFAULT 'featured',
  	"slider_theme" "enum__posts_v_blocks_content_columns_slider_theme" DEFAULT 'system',
  	"slider_intro_content_heading" varchar,
  	"slider_intro_content_subheading" varchar,
  	"slider_intro_content_size" "enum__posts_v_blocks_content_columns_slider_intro_content_size" DEFAULT 'base',
  	"slider_intro_content_align" "enum__posts_v_blocks_content_columns_slider_intro_content_align" DEFAULT 'left',
  	"slider_style" "enum__posts_v_blocks_content_columns_slider_style" DEFAULT 'default',
  	"slider_space_pt" "enum__posts_v_blocks_content_columns_slider_space_pt" DEFAULT 'md',
  	"slider_space_pb" "enum__posts_v_blocks_content_columns_slider_space_pb" DEFAULT 'md',
  	"slider_space_mt" "enum__posts_v_blocks_content_columns_slider_space_mt" DEFAULT 'none',
  	"slider_space_mb" "enum__posts_v_blocks_content_columns_slider_space_mb" DEFAULT 'none',
  	"media_media_id" integer,
  	"media_aspect_ratio" "enum__posts_v_blocks_content_columns_media_aspect_ratio" DEFAULT 'landscape',
  	"media_full_width" boolean DEFAULT false,
  	"media_caption_size" "enum__posts_v_blocks_content_columns_media_caption_size" DEFAULT 'normal',
  	"you_tube_url" varchar,
  	"you_tube_aspect_ratio" "enum__posts_v_blocks_content_columns_you_tube_aspect_ratio" DEFAULT 'landscape',
  	"you_tube_full_width" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__posts_v_blocks_content_theme" DEFAULT 'system',
  	"container_width" "enum__posts_v_blocks_content_container_width" DEFAULT 'contained',
  	"space_pt" "enum__posts_v_blocks_content_space_pt" DEFAULT 'md',
  	"space_pb" "enum__posts_v_blocks_content_space_pb" DEFAULT 'md',
  	"space_mt" "enum__posts_v_blocks_content_space_mt" DEFAULT 'none',
  	"space_mb" "enum__posts_v_blocks_content_space_mb" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_section_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum___posts_v_section_v_theme" DEFAULT 'inherit',
  	"spacing" "enum___posts_v_section_v_spacing" DEFAULT 'default',
  	"stack" "enum___posts_v_section_v_stack" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "works_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum_works_transition_layout" DEFAULT 'offset',
  	"theme" "enum_works_transition_theme" DEFAULT 'light',
  	"heading_level" "enum_works_transition_heading_level" DEFAULT 'h2',
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "works_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"body_size" "enum_works_blocks_feature_heading_offset_body_size" DEFAULT 'medium',
  	"theme" "enum_works_blocks_feature_heading_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_full_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum_works_full_media_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_works_full_media_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"width" "enum_works_full_media_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_works_full_media_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum_works_full_media_content_position" DEFAULT 'left',
  	"theme" "enum_works_full_media_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_media_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum_works_media_split_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_works_media_split_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"layout" "enum_works_media_split_layout" DEFAULT 'left',
  	"aspect_ratio" "enum_works_media_split_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum_works_media_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_split_narrow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum_works_split_narrow_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_works_split_narrow_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"image_position" "enum_works_split_narrow_image_position" DEFAULT 'left',
  	"theme" "enum_works_split_narrow_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"portrait_position" "enum_works_image_pair_portrait_position" DEFAULT 'left',
  	"text_position" "enum_works_image_pair_text_position" DEFAULT 'under-portrait',
  	"theme" "enum_works_image_pair_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_split_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"caption_position" "enum_works_split_offset_caption_position" DEFAULT 'left',
  	"theme" "enum_works_split_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" jsonb,
  	"text_position" "enum_works_image_statement_text_position" DEFAULT 'left',
  	"text_size" "enum_works_image_statement_text_size" DEFAULT 'default',
  	"image_width" "enum_works_image_statement_image_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_works_image_statement_aspect_ratio" DEFAULT 'responsive',
  	"theme" "enum_works_image_statement_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_caption" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum_works_caption_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"theme" "enum_works_caption_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_youtube" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum_works_youtube_size" DEFAULT 'full',
  	"theme" "enum_works_youtube_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum_works_rich_text_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_works_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "works_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "works_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum_works_faq_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum_works_faq_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "works_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_works_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum_works_blocks_carousel_slide_size" DEFAULT 'full',
  	"theme" "enum_works_blocks_carousel_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "works_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"visual_type" "enum_works_blocks_feature_tabs_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum_works_blocks_feature_tabs_tabs_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "works_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tab_size" "enum_works_blocks_feature_tabs_tab_size" DEFAULT 'default',
  	"theme" "enum_works_blocks_feature_tabs_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_insight_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "works_insight_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_works_insight_list_layout" DEFAULT 'side',
  	"mark_size" "enum_works_insight_list_mark_size" DEFAULT 'medium',
  	"theme" "enum_works_insight_list_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "works_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum_works_section_theme" DEFAULT 'inherit',
  	"spacing" "enum_works_section_spacing" DEFAULT 'default',
  	"stack" "enum_works_section_stack" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum___works_v_transition_v_layout" DEFAULT 'offset',
  	"theme" "enum___works_v_transition_v_theme" DEFAULT 'light',
  	"heading_level" "enum___works_v_transition_v_heading_level" DEFAULT 'h2',
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_works_v_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"body_size" "enum__works_v_blocks_feature_heading_offset_body_size" DEFAULT 'medium',
  	"theme" "enum__works_v_blocks_feature_heading_offset_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_full_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum___works_v_full_media_v_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum___works_v_full_media_v_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"width" "enum___works_v_full_media_v_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___works_v_full_media_v_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum___works_v_full_media_v_content_position" DEFAULT 'left',
  	"theme" "enum___works_v_full_media_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_media_split_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum___works_v_media_split_v_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum___works_v_media_split_v_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"layout" "enum___works_v_media_split_v_layout" DEFAULT 'left',
  	"aspect_ratio" "enum___works_v_media_split_v_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum___works_v_media_split_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_split_narrow_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"visual_type" "enum___works_v_split_narrow_v_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum___works_v_split_narrow_v_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"image_position" "enum___works_v_split_narrow_v_image_position" DEFAULT 'left',
  	"theme" "enum___works_v_split_narrow_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_image_pair_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"portrait_position" "enum___works_v_image_pair_v_portrait_position" DEFAULT 'left',
  	"text_position" "enum___works_v_image_pair_v_text_position" DEFAULT 'under-portrait',
  	"theme" "enum___works_v_image_pair_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_split_offset_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"caption_position" "enum___works_v_split_offset_v_caption_position" DEFAULT 'left',
  	"theme" "enum___works_v_split_offset_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" jsonb,
  	"text_position" "enum___works_v_image_statement_v_text_position" DEFAULT 'left',
  	"text_size" "enum___works_v_image_statement_v_text_size" DEFAULT 'default',
  	"image_width" "enum___works_v_image_statement_v_image_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___works_v_image_statement_v_aspect_ratio" DEFAULT 'responsive',
  	"theme" "enum___works_v_image_statement_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_caption_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum___works_v_caption_v_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"theme" "enum___works_v_caption_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_youtube_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum___works_v_youtube_v_size" DEFAULT 'full',
  	"theme" "enum___works_v_youtube_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_rich_text_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum___works_v_rich_text_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_code_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum___works_v_code_v_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_faq_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__works_v_faq_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum___works_v_faq_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum___works_v_faq_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_works_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_works_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__works_v_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum__works_v_blocks_carousel_slide_size" DEFAULT 'full',
  	"theme" "enum__works_v_blocks_carousel_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_works_v_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_works_v_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"visual_type" "enum__works_v_blocks_feature_tabs_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_bleed" boolean DEFAULT false,
  	"shader_origin" "enum__works_v_blocks_feature_tabs_tabs_shader_origin" DEFAULT 'top-right',
  	"shader_show_media" boolean DEFAULT false,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_hover_targets" "enum_leak_hover_targets",
  	"shader_section_hover" numeric,
  	"shader_poster_media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_works_v_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tab_size" "enum__works_v_blocks_feature_tabs_tab_size" DEFAULT 'default',
  	"theme" "enum__works_v_blocks_feature_tabs_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_insight_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__works_v_insight_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___works_v_insight_list_v_layout" DEFAULT 'side',
  	"mark_size" "enum___works_v_insight_list_v_mark_size" DEFAULT 'medium',
  	"theme" "enum___works_v_insight_list_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__works_v_section_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum___works_v_section_v_theme" DEFAULT 'inherit',
  	"spacing" "enum___works_v_section_v_spacing" DEFAULT 'default',
  	"stack" "enum___works_v_section_v_stack" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "posts_rels" ADD COLUMN "works_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "works_id" integer;
  ALTER TABLE "pages_transition" ADD CONSTRAINT "pages_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_heading_offset" ADD CONSTRAINT "pages_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_full_media" ADD CONSTRAINT "pages_full_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_full_media" ADD CONSTRAINT "pages_full_media_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_full_media" ADD CONSTRAINT "pages_full_media_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_full_media" ADD CONSTRAINT "pages_full_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_media_split" ADD CONSTRAINT "pages_media_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_media_split" ADD CONSTRAINT "pages_media_split_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_media_split" ADD CONSTRAINT "pages_media_split_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_media_split" ADD CONSTRAINT "pages_media_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_split_narrow" ADD CONSTRAINT "pages_split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_split_narrow" ADD CONSTRAINT "pages_split_narrow_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_split_narrow" ADD CONSTRAINT "pages_split_narrow_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_split_narrow" ADD CONSTRAINT "pages_split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_image_pair" ADD CONSTRAINT "pages_image_pair_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_image_pair" ADD CONSTRAINT "pages_image_pair_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_image_pair" ADD CONSTRAINT "pages_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_split_offset" ADD CONSTRAINT "pages_split_offset_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_split_offset" ADD CONSTRAINT "pages_split_offset_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_split_offset" ADD CONSTRAINT "pages_split_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_image_statement" ADD CONSTRAINT "pages_image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_image_statement" ADD CONSTRAINT "pages_image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_caption" ADD CONSTRAINT "pages_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_caption" ADD CONSTRAINT "pages_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_youtube" ADD CONSTRAINT "pages_youtube_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rich_text" ADD CONSTRAINT "pages_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_code" ADD CONSTRAINT "pages_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_faq_items" ADD CONSTRAINT "pages_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_faq" ADD CONSTRAINT "pages_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel_slides" ADD CONSTRAINT "pages_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel_slides" ADD CONSTRAINT "pages_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_insight_list_items" ADD CONSTRAINT "pages_insight_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_insight_list_items" ADD CONSTRAINT "pages_insight_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_insight_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_insight_list" ADD CONSTRAINT "pages_insight_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_section" ADD CONSTRAINT "pages_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_transition_v" ADD CONSTRAINT "__pages_v_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_heading_offset" ADD CONSTRAINT "_pages_v_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_full_media_v" ADD CONSTRAINT "__pages_v_full_media_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_full_media_v" ADD CONSTRAINT "__pages_v_full_media_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_full_media_v" ADD CONSTRAINT "__pages_v_full_media_v_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_full_media_v" ADD CONSTRAINT "__pages_v_full_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_media_split_v" ADD CONSTRAINT "__pages_v_media_split_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_media_split_v" ADD CONSTRAINT "__pages_v_media_split_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_media_split_v" ADD CONSTRAINT "__pages_v_media_split_v_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_media_split_v" ADD CONSTRAINT "__pages_v_media_split_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_split_narrow_v" ADD CONSTRAINT "__pages_v_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_split_narrow_v" ADD CONSTRAINT "__pages_v_split_narrow_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_split_narrow_v" ADD CONSTRAINT "__pages_v_split_narrow_v_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_split_narrow_v" ADD CONSTRAINT "__pages_v_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_image_pair_v" ADD CONSTRAINT "__pages_v_image_pair_v_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_image_pair_v" ADD CONSTRAINT "__pages_v_image_pair_v_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_image_pair_v" ADD CONSTRAINT "__pages_v_image_pair_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_split_offset_v" ADD CONSTRAINT "__pages_v_split_offset_v_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_split_offset_v" ADD CONSTRAINT "__pages_v_split_offset_v_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_split_offset_v" ADD CONSTRAINT "__pages_v_split_offset_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_image_statement_v" ADD CONSTRAINT "__pages_v_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_image_statement_v" ADD CONSTRAINT "__pages_v_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_caption_v" ADD CONSTRAINT "__pages_v_caption_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_caption_v" ADD CONSTRAINT "__pages_v_caption_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_youtube_v" ADD CONSTRAINT "__pages_v_youtube_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_rich_text_v" ADD CONSTRAINT "__pages_v_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_code_v" ADD CONSTRAINT "__pages_v_code_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_faq_v_items" ADD CONSTRAINT "__pages_v_faq_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_faq_v" ADD CONSTRAINT "__pages_v_faq_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_pages_v_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_pages_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_insight_list_v_items" ADD CONSTRAINT "__pages_v_insight_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_insight_list_v_items" ADD CONSTRAINT "__pages_v_insight_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_insight_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_insight_list_v" ADD CONSTRAINT "__pages_v_insight_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_section_v" ADD CONSTRAINT "__pages_v_section_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_transition" ADD CONSTRAINT "posts_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_heading_offset" ADD CONSTRAINT "posts_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_full_media" ADD CONSTRAINT "posts_full_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_full_media" ADD CONSTRAINT "posts_full_media_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_full_media" ADD CONSTRAINT "posts_full_media_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_full_media" ADD CONSTRAINT "posts_full_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_media_split" ADD CONSTRAINT "posts_media_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_media_split" ADD CONSTRAINT "posts_media_split_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_media_split" ADD CONSTRAINT "posts_media_split_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_media_split" ADD CONSTRAINT "posts_media_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_split_narrow" ADD CONSTRAINT "posts_split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_split_narrow" ADD CONSTRAINT "posts_split_narrow_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_split_narrow" ADD CONSTRAINT "posts_split_narrow_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_split_narrow" ADD CONSTRAINT "posts_split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_image_pair" ADD CONSTRAINT "posts_image_pair_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_image_pair" ADD CONSTRAINT "posts_image_pair_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_image_pair" ADD CONSTRAINT "posts_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_split_offset" ADD CONSTRAINT "posts_split_offset_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_split_offset" ADD CONSTRAINT "posts_split_offset_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_split_offset" ADD CONSTRAINT "posts_split_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_image_statement" ADD CONSTRAINT "posts_image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_image_statement" ADD CONSTRAINT "posts_image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_caption" ADD CONSTRAINT "posts_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_caption" ADD CONSTRAINT "posts_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_youtube" ADD CONSTRAINT "posts_youtube_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rich_text" ADD CONSTRAINT "posts_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_code" ADD CONSTRAINT "posts_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_faq_items" ADD CONSTRAINT "posts_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_faq" ADD CONSTRAINT "posts_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_slides" ADD CONSTRAINT "posts_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_slides" ADD CONSTRAINT "posts_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "posts_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_tabs_tabs" ADD CONSTRAINT "posts_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_tabs_tabs" ADD CONSTRAINT "posts_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_tabs_tabs" ADD CONSTRAINT "posts_blocks_feature_tabs_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_tabs_tabs" ADD CONSTRAINT "posts_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_tabs" ADD CONSTRAINT "posts_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_insight_list_items" ADD CONSTRAINT "posts_insight_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_insight_list_items" ADD CONSTRAINT "posts_insight_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_insight_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_insight_list" ADD CONSTRAINT "posts_insight_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_columns_slider_slides" ADD CONSTRAINT "posts_blocks_content_columns_slider_slides_slide_image_id_media_id_fk" FOREIGN KEY ("slide_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_columns_slider_slides" ADD CONSTRAINT "posts_blocks_content_columns_slider_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_columns" ADD CONSTRAINT "posts_blocks_content_columns_work_works_id_works_id_fk" FOREIGN KEY ("work_works_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_columns" ADD CONSTRAINT "posts_blocks_content_columns_post_posts_id_posts_id_fk" FOREIGN KEY ("post_posts_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_columns" ADD CONSTRAINT "posts_blocks_content_columns_media_media_id_media_id_fk" FOREIGN KEY ("media_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_columns" ADD CONSTRAINT "posts_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_content" ADD CONSTRAINT "posts_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_section" ADD CONSTRAINT "posts_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_transition_v" ADD CONSTRAINT "__posts_v_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_heading_offset" ADD CONSTRAINT "_posts_v_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_full_media_v" ADD CONSTRAINT "__posts_v_full_media_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_full_media_v" ADD CONSTRAINT "__posts_v_full_media_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_full_media_v" ADD CONSTRAINT "__posts_v_full_media_v_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_full_media_v" ADD CONSTRAINT "__posts_v_full_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_media_split_v" ADD CONSTRAINT "__posts_v_media_split_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_media_split_v" ADD CONSTRAINT "__posts_v_media_split_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_media_split_v" ADD CONSTRAINT "__posts_v_media_split_v_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_media_split_v" ADD CONSTRAINT "__posts_v_media_split_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_split_narrow_v" ADD CONSTRAINT "__posts_v_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_split_narrow_v" ADD CONSTRAINT "__posts_v_split_narrow_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_split_narrow_v" ADD CONSTRAINT "__posts_v_split_narrow_v_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_split_narrow_v" ADD CONSTRAINT "__posts_v_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_image_pair_v" ADD CONSTRAINT "__posts_v_image_pair_v_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_image_pair_v" ADD CONSTRAINT "__posts_v_image_pair_v_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_image_pair_v" ADD CONSTRAINT "__posts_v_image_pair_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_split_offset_v" ADD CONSTRAINT "__posts_v_split_offset_v_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_split_offset_v" ADD CONSTRAINT "__posts_v_split_offset_v_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_split_offset_v" ADD CONSTRAINT "__posts_v_split_offset_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_image_statement_v" ADD CONSTRAINT "__posts_v_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_image_statement_v" ADD CONSTRAINT "__posts_v_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_caption_v" ADD CONSTRAINT "__posts_v_caption_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_caption_v" ADD CONSTRAINT "__posts_v_caption_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_youtube_v" ADD CONSTRAINT "__posts_v_youtube_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_rich_text_v" ADD CONSTRAINT "__posts_v_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_code_v" ADD CONSTRAINT "__posts_v_code_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_faq_v_items" ADD CONSTRAINT "__posts_v_faq_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__posts_v_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_faq_v" ADD CONSTRAINT "__posts_v_faq_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_slides" ADD CONSTRAINT "_posts_v_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_slides" ADD CONSTRAINT "_posts_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "_posts_v_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_posts_v_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_posts_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_posts_v_blocks_feature_tabs_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_posts_v_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_tabs" ADD CONSTRAINT "_posts_v_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_insight_list_v_items" ADD CONSTRAINT "__posts_v_insight_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_insight_list_v_items" ADD CONSTRAINT "__posts_v_insight_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__posts_v_insight_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_insight_list_v" ADD CONSTRAINT "__posts_v_insight_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_columns_slider_slides" ADD CONSTRAINT "_posts_v_blocks_content_columns_slider_slides_slide_image_id_media_id_fk" FOREIGN KEY ("slide_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_columns_slider_slides" ADD CONSTRAINT "_posts_v_blocks_content_columns_slider_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_columns" ADD CONSTRAINT "_posts_v_blocks_content_columns_work_works_id_works_id_fk" FOREIGN KEY ("work_works_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_columns" ADD CONSTRAINT "_posts_v_blocks_content_columns_post_posts_id_posts_id_fk" FOREIGN KEY ("post_posts_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_columns" ADD CONSTRAINT "_posts_v_blocks_content_columns_media_media_id_media_id_fk" FOREIGN KEY ("media_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_columns" ADD CONSTRAINT "_posts_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content" ADD CONSTRAINT "_posts_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_section_v" ADD CONSTRAINT "__posts_v_section_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_transition" ADD CONSTRAINT "works_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_blocks_feature_heading_offset" ADD CONSTRAINT "works_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_full_media" ADD CONSTRAINT "works_full_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_full_media" ADD CONSTRAINT "works_full_media_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_full_media" ADD CONSTRAINT "works_full_media_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_full_media" ADD CONSTRAINT "works_full_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_media_split" ADD CONSTRAINT "works_media_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_media_split" ADD CONSTRAINT "works_media_split_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_media_split" ADD CONSTRAINT "works_media_split_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_media_split" ADD CONSTRAINT "works_media_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_split_narrow" ADD CONSTRAINT "works_split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_split_narrow" ADD CONSTRAINT "works_split_narrow_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_split_narrow" ADD CONSTRAINT "works_split_narrow_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_split_narrow" ADD CONSTRAINT "works_split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_image_pair" ADD CONSTRAINT "works_image_pair_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_image_pair" ADD CONSTRAINT "works_image_pair_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_image_pair" ADD CONSTRAINT "works_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_split_offset" ADD CONSTRAINT "works_split_offset_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_split_offset" ADD CONSTRAINT "works_split_offset_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_split_offset" ADD CONSTRAINT "works_split_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_image_statement" ADD CONSTRAINT "works_image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_image_statement" ADD CONSTRAINT "works_image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_caption" ADD CONSTRAINT "works_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_caption" ADD CONSTRAINT "works_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_youtube" ADD CONSTRAINT "works_youtube_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_rich_text" ADD CONSTRAINT "works_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_code" ADD CONSTRAINT "works_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_faq_items" ADD CONSTRAINT "works_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_faq" ADD CONSTRAINT "works_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_blocks_carousel_slides" ADD CONSTRAINT "works_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_blocks_carousel_slides" ADD CONSTRAINT "works_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_blocks_carousel" ADD CONSTRAINT "works_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "works_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_blocks_feature_tabs_tabs" ADD CONSTRAINT "works_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_blocks_feature_tabs_tabs" ADD CONSTRAINT "works_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_blocks_feature_tabs_tabs" ADD CONSTRAINT "works_blocks_feature_tabs_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_blocks_feature_tabs_tabs" ADD CONSTRAINT "works_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_blocks_feature_tabs" ADD CONSTRAINT "works_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_insight_list_items" ADD CONSTRAINT "works_insight_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_insight_list_items" ADD CONSTRAINT "works_insight_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works_insight_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_insight_list" ADD CONSTRAINT "works_insight_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_section" ADD CONSTRAINT "works_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_transition_v" ADD CONSTRAINT "__works_v_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_feature_heading_offset" ADD CONSTRAINT "_works_v_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_full_media_v" ADD CONSTRAINT "__works_v_full_media_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_full_media_v" ADD CONSTRAINT "__works_v_full_media_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_full_media_v" ADD CONSTRAINT "__works_v_full_media_v_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_full_media_v" ADD CONSTRAINT "__works_v_full_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_media_split_v" ADD CONSTRAINT "__works_v_media_split_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_media_split_v" ADD CONSTRAINT "__works_v_media_split_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_media_split_v" ADD CONSTRAINT "__works_v_media_split_v_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_media_split_v" ADD CONSTRAINT "__works_v_media_split_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_split_narrow_v" ADD CONSTRAINT "__works_v_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_split_narrow_v" ADD CONSTRAINT "__works_v_split_narrow_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_split_narrow_v" ADD CONSTRAINT "__works_v_split_narrow_v_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_split_narrow_v" ADD CONSTRAINT "__works_v_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_image_pair_v" ADD CONSTRAINT "__works_v_image_pair_v_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_image_pair_v" ADD CONSTRAINT "__works_v_image_pair_v_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_image_pair_v" ADD CONSTRAINT "__works_v_image_pair_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_split_offset_v" ADD CONSTRAINT "__works_v_split_offset_v_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_split_offset_v" ADD CONSTRAINT "__works_v_split_offset_v_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_split_offset_v" ADD CONSTRAINT "__works_v_split_offset_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_image_statement_v" ADD CONSTRAINT "__works_v_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_image_statement_v" ADD CONSTRAINT "__works_v_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_caption_v" ADD CONSTRAINT "__works_v_caption_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_caption_v" ADD CONSTRAINT "__works_v_caption_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_youtube_v" ADD CONSTRAINT "__works_v_youtube_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_rich_text_v" ADD CONSTRAINT "__works_v_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_code_v" ADD CONSTRAINT "__works_v_code_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_faq_v_items" ADD CONSTRAINT "__works_v_faq_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__works_v_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_faq_v" ADD CONSTRAINT "__works_v_faq_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_carousel_slides" ADD CONSTRAINT "_works_v_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_carousel_slides" ADD CONSTRAINT "_works_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_carousel" ADD CONSTRAINT "_works_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "_works_v_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_works_v_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_works_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_works_v_blocks_feature_tabs_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_works_v_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_v_blocks_feature_tabs" ADD CONSTRAINT "_works_v_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_insight_list_v_items" ADD CONSTRAINT "__works_v_insight_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__works_v_insight_list_v_items" ADD CONSTRAINT "__works_v_insight_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__works_v_insight_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_insight_list_v" ADD CONSTRAINT "__works_v_insight_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__works_v_section_v" ADD CONSTRAINT "__works_v_section_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_transition_order_idx" ON "pages_transition" USING btree ("_order");
  CREATE INDEX "pages_transition_parent_id_idx" ON "pages_transition" USING btree ("_parent_id");
  CREATE INDEX "pages_transition_path_idx" ON "pages_transition" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_heading_offset_order_idx" ON "pages_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_heading_offset_parent_id_idx" ON "pages_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_heading_offset_path_idx" ON "pages_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "pages_full_media_order_idx" ON "pages_full_media" USING btree ("_order");
  CREATE INDEX "pages_full_media_parent_id_idx" ON "pages_full_media" USING btree ("_parent_id");
  CREATE INDEX "pages_full_media_path_idx" ON "pages_full_media" USING btree ("_path");
  CREATE INDEX "pages_full_media_media_idx" ON "pages_full_media" USING btree ("media_id");
  CREATE INDEX "pages_full_media_shader_shader_studio_idx" ON "pages_full_media" USING btree ("shader_studio_id");
  CREATE INDEX "pages_full_media_shader_shader_poster_media_idx" ON "pages_full_media" USING btree ("shader_poster_media_id");
  CREATE INDEX "pages_media_split_order_idx" ON "pages_media_split" USING btree ("_order");
  CREATE INDEX "pages_media_split_parent_id_idx" ON "pages_media_split" USING btree ("_parent_id");
  CREATE INDEX "pages_media_split_path_idx" ON "pages_media_split" USING btree ("_path");
  CREATE INDEX "pages_media_split_media_idx" ON "pages_media_split" USING btree ("media_id");
  CREATE INDEX "pages_media_split_shader_shader_studio_idx" ON "pages_media_split" USING btree ("shader_studio_id");
  CREATE INDEX "pages_media_split_shader_shader_poster_media_idx" ON "pages_media_split" USING btree ("shader_poster_media_id");
  CREATE INDEX "pages_split_narrow_order_idx" ON "pages_split_narrow" USING btree ("_order");
  CREATE INDEX "pages_split_narrow_parent_id_idx" ON "pages_split_narrow" USING btree ("_parent_id");
  CREATE INDEX "pages_split_narrow_path_idx" ON "pages_split_narrow" USING btree ("_path");
  CREATE INDEX "pages_split_narrow_media_idx" ON "pages_split_narrow" USING btree ("media_id");
  CREATE INDEX "pages_split_narrow_shader_shader_studio_idx" ON "pages_split_narrow" USING btree ("shader_studio_id");
  CREATE INDEX "pages_split_narrow_shader_shader_poster_media_idx" ON "pages_split_narrow" USING btree ("shader_poster_media_id");
  CREATE INDEX "pages_image_pair_order_idx" ON "pages_image_pair" USING btree ("_order");
  CREATE INDEX "pages_image_pair_parent_id_idx" ON "pages_image_pair" USING btree ("_parent_id");
  CREATE INDEX "pages_image_pair_path_idx" ON "pages_image_pair" USING btree ("_path");
  CREATE INDEX "pages_image_pair_portrait_media_idx" ON "pages_image_pair" USING btree ("portrait_media_id");
  CREATE INDEX "pages_image_pair_landscape_media_idx" ON "pages_image_pair" USING btree ("landscape_media_id");
  CREATE INDEX "pages_split_offset_order_idx" ON "pages_split_offset" USING btree ("_order");
  CREATE INDEX "pages_split_offset_parent_id_idx" ON "pages_split_offset" USING btree ("_parent_id");
  CREATE INDEX "pages_split_offset_path_idx" ON "pages_split_offset" USING btree ("_path");
  CREATE INDEX "pages_split_offset_large_media_idx" ON "pages_split_offset" USING btree ("large_media_id");
  CREATE INDEX "pages_split_offset_small_media_idx" ON "pages_split_offset" USING btree ("small_media_id");
  CREATE INDEX "pages_image_statement_order_idx" ON "pages_image_statement" USING btree ("_order");
  CREATE INDEX "pages_image_statement_parent_id_idx" ON "pages_image_statement" USING btree ("_parent_id");
  CREATE INDEX "pages_image_statement_path_idx" ON "pages_image_statement" USING btree ("_path");
  CREATE INDEX "pages_image_statement_media_idx" ON "pages_image_statement" USING btree ("media_id");
  CREATE INDEX "pages_caption_order_idx" ON "pages_caption" USING btree ("_order");
  CREATE INDEX "pages_caption_parent_id_idx" ON "pages_caption" USING btree ("_parent_id");
  CREATE INDEX "pages_caption_path_idx" ON "pages_caption" USING btree ("_path");
  CREATE INDEX "pages_caption_media_idx" ON "pages_caption" USING btree ("media_id");
  CREATE INDEX "pages_youtube_order_idx" ON "pages_youtube" USING btree ("_order");
  CREATE INDEX "pages_youtube_parent_id_idx" ON "pages_youtube" USING btree ("_parent_id");
  CREATE INDEX "pages_youtube_path_idx" ON "pages_youtube" USING btree ("_path");
  CREATE INDEX "pages_rich_text_order_idx" ON "pages_rich_text" USING btree ("_order");
  CREATE INDEX "pages_rich_text_parent_id_idx" ON "pages_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_rich_text_path_idx" ON "pages_rich_text" USING btree ("_path");
  CREATE INDEX "pages_code_order_idx" ON "pages_code" USING btree ("_order");
  CREATE INDEX "pages_code_parent_id_idx" ON "pages_code" USING btree ("_parent_id");
  CREATE INDEX "pages_code_path_idx" ON "pages_code" USING btree ("_path");
  CREATE INDEX "pages_faq_items_order_idx" ON "pages_faq_items" USING btree ("_order");
  CREATE INDEX "pages_faq_items_parent_id_idx" ON "pages_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_faq_order_idx" ON "pages_faq" USING btree ("_order");
  CREATE INDEX "pages_faq_parent_id_idx" ON "pages_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_faq_path_idx" ON "pages_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_carousel_slides_order_idx" ON "pages_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_slides_parent_id_idx" ON "pages_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_slides_media_idx" ON "pages_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "pages_blocks_carousel_order_idx" ON "pages_blocks_carousel" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_parent_id_idx" ON "pages_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_path_idx" ON "pages_blocks_carousel" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_items_order_idx" ON "pages_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_items_parent_id_idx" ON "pages_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_order_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_parent_id_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_media_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_shader_shader_poster_medi_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "pages_blocks_feature_tabs_order_idx" ON "pages_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_tabs_parent_id_idx" ON "pages_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_tabs_path_idx" ON "pages_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "pages_insight_list_items_order_idx" ON "pages_insight_list_items" USING btree ("_order");
  CREATE INDEX "pages_insight_list_items_parent_id_idx" ON "pages_insight_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_insight_list_items_media_idx" ON "pages_insight_list_items" USING btree ("media_id");
  CREATE INDEX "pages_insight_list_order_idx" ON "pages_insight_list" USING btree ("_order");
  CREATE INDEX "pages_insight_list_parent_id_idx" ON "pages_insight_list" USING btree ("_parent_id");
  CREATE INDEX "pages_insight_list_path_idx" ON "pages_insight_list" USING btree ("_path");
  CREATE INDEX "pages_section_order_idx" ON "pages_section" USING btree ("_order");
  CREATE INDEX "pages_section_parent_id_idx" ON "pages_section" USING btree ("_parent_id");
  CREATE INDEX "pages_section_path_idx" ON "pages_section" USING btree ("_path");
  CREATE INDEX "__pages_v_transition_v_order_idx" ON "__pages_v_transition_v" USING btree ("_order");
  CREATE INDEX "__pages_v_transition_v_parent_id_idx" ON "__pages_v_transition_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_transition_v_path_idx" ON "__pages_v_transition_v" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_heading_offset_order_idx" ON "_pages_v_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_heading_offset_parent_id_idx" ON "_pages_v_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_heading_offset_path_idx" ON "_pages_v_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "__pages_v_full_media_v_order_idx" ON "__pages_v_full_media_v" USING btree ("_order");
  CREATE INDEX "__pages_v_full_media_v_parent_id_idx" ON "__pages_v_full_media_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_full_media_v_path_idx" ON "__pages_v_full_media_v" USING btree ("_path");
  CREATE INDEX "__pages_v_full_media_v_media_idx" ON "__pages_v_full_media_v" USING btree ("media_id");
  CREATE INDEX "__pages_v_full_media_v_shader_shader_studio_idx" ON "__pages_v_full_media_v" USING btree ("shader_studio_id");
  CREATE INDEX "__pages_v_full_media_v_shader_shader_poster_media_idx" ON "__pages_v_full_media_v" USING btree ("shader_poster_media_id");
  CREATE INDEX "__pages_v_media_split_v_order_idx" ON "__pages_v_media_split_v" USING btree ("_order");
  CREATE INDEX "__pages_v_media_split_v_parent_id_idx" ON "__pages_v_media_split_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_media_split_v_path_idx" ON "__pages_v_media_split_v" USING btree ("_path");
  CREATE INDEX "__pages_v_media_split_v_media_idx" ON "__pages_v_media_split_v" USING btree ("media_id");
  CREATE INDEX "__pages_v_media_split_v_shader_shader_studio_idx" ON "__pages_v_media_split_v" USING btree ("shader_studio_id");
  CREATE INDEX "__pages_v_media_split_v_shader_shader_poster_media_idx" ON "__pages_v_media_split_v" USING btree ("shader_poster_media_id");
  CREATE INDEX "__pages_v_split_narrow_v_order_idx" ON "__pages_v_split_narrow_v" USING btree ("_order");
  CREATE INDEX "__pages_v_split_narrow_v_parent_id_idx" ON "__pages_v_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_split_narrow_v_path_idx" ON "__pages_v_split_narrow_v" USING btree ("_path");
  CREATE INDEX "__pages_v_split_narrow_v_media_idx" ON "__pages_v_split_narrow_v" USING btree ("media_id");
  CREATE INDEX "__pages_v_split_narrow_v_shader_shader_studio_idx" ON "__pages_v_split_narrow_v" USING btree ("shader_studio_id");
  CREATE INDEX "__pages_v_split_narrow_v_shader_shader_poster_media_idx" ON "__pages_v_split_narrow_v" USING btree ("shader_poster_media_id");
  CREATE INDEX "__pages_v_image_pair_v_order_idx" ON "__pages_v_image_pair_v" USING btree ("_order");
  CREATE INDEX "__pages_v_image_pair_v_parent_id_idx" ON "__pages_v_image_pair_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_image_pair_v_path_idx" ON "__pages_v_image_pair_v" USING btree ("_path");
  CREATE INDEX "__pages_v_image_pair_v_portrait_media_idx" ON "__pages_v_image_pair_v" USING btree ("portrait_media_id");
  CREATE INDEX "__pages_v_image_pair_v_landscape_media_idx" ON "__pages_v_image_pair_v" USING btree ("landscape_media_id");
  CREATE INDEX "__pages_v_split_offset_v_order_idx" ON "__pages_v_split_offset_v" USING btree ("_order");
  CREATE INDEX "__pages_v_split_offset_v_parent_id_idx" ON "__pages_v_split_offset_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_split_offset_v_path_idx" ON "__pages_v_split_offset_v" USING btree ("_path");
  CREATE INDEX "__pages_v_split_offset_v_large_media_idx" ON "__pages_v_split_offset_v" USING btree ("large_media_id");
  CREATE INDEX "__pages_v_split_offset_v_small_media_idx" ON "__pages_v_split_offset_v" USING btree ("small_media_id");
  CREATE INDEX "__pages_v_image_statement_v_order_idx" ON "__pages_v_image_statement_v" USING btree ("_order");
  CREATE INDEX "__pages_v_image_statement_v_parent_id_idx" ON "__pages_v_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_image_statement_v_path_idx" ON "__pages_v_image_statement_v" USING btree ("_path");
  CREATE INDEX "__pages_v_image_statement_v_media_idx" ON "__pages_v_image_statement_v" USING btree ("media_id");
  CREATE INDEX "__pages_v_caption_v_order_idx" ON "__pages_v_caption_v" USING btree ("_order");
  CREATE INDEX "__pages_v_caption_v_parent_id_idx" ON "__pages_v_caption_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_caption_v_path_idx" ON "__pages_v_caption_v" USING btree ("_path");
  CREATE INDEX "__pages_v_caption_v_media_idx" ON "__pages_v_caption_v" USING btree ("media_id");
  CREATE INDEX "__pages_v_youtube_v_order_idx" ON "__pages_v_youtube_v" USING btree ("_order");
  CREATE INDEX "__pages_v_youtube_v_parent_id_idx" ON "__pages_v_youtube_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_youtube_v_path_idx" ON "__pages_v_youtube_v" USING btree ("_path");
  CREATE INDEX "__pages_v_rich_text_v_order_idx" ON "__pages_v_rich_text_v" USING btree ("_order");
  CREATE INDEX "__pages_v_rich_text_v_parent_id_idx" ON "__pages_v_rich_text_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_rich_text_v_path_idx" ON "__pages_v_rich_text_v" USING btree ("_path");
  CREATE INDEX "__pages_v_code_v_order_idx" ON "__pages_v_code_v" USING btree ("_order");
  CREATE INDEX "__pages_v_code_v_parent_id_idx" ON "__pages_v_code_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_code_v_path_idx" ON "__pages_v_code_v" USING btree ("_path");
  CREATE INDEX "__pages_v_faq_v_items_order_idx" ON "__pages_v_faq_v_items" USING btree ("_order");
  CREATE INDEX "__pages_v_faq_v_items_parent_id_idx" ON "__pages_v_faq_v_items" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_faq_v_order_idx" ON "__pages_v_faq_v" USING btree ("_order");
  CREATE INDEX "__pages_v_faq_v_parent_id_idx" ON "__pages_v_faq_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_faq_v_path_idx" ON "__pages_v_faq_v" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_carousel_slides_order_idx" ON "_pages_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_slides_parent_id_idx" ON "_pages_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_slides_media_idx" ON "_pages_v_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_carousel_order_idx" ON "_pages_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_parent_id_idx" ON "_pages_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_path_idx" ON "_pages_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_items_order_idx" ON "_pages_v_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_items_parent_id_idx" ON "_pages_v_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_order_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_parent_id_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_media_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_shader_shader_poster_m_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_order_idx" ON "_pages_v_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_tabs_parent_id_idx" ON "_pages_v_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_path_idx" ON "_pages_v_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "__pages_v_insight_list_v_items_order_idx" ON "__pages_v_insight_list_v_items" USING btree ("_order");
  CREATE INDEX "__pages_v_insight_list_v_items_parent_id_idx" ON "__pages_v_insight_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_insight_list_v_items_media_idx" ON "__pages_v_insight_list_v_items" USING btree ("media_id");
  CREATE INDEX "__pages_v_insight_list_v_order_idx" ON "__pages_v_insight_list_v" USING btree ("_order");
  CREATE INDEX "__pages_v_insight_list_v_parent_id_idx" ON "__pages_v_insight_list_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_insight_list_v_path_idx" ON "__pages_v_insight_list_v" USING btree ("_path");
  CREATE INDEX "__pages_v_section_v_order_idx" ON "__pages_v_section_v" USING btree ("_order");
  CREATE INDEX "__pages_v_section_v_parent_id_idx" ON "__pages_v_section_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_section_v_path_idx" ON "__pages_v_section_v" USING btree ("_path");
  CREATE INDEX "posts_transition_order_idx" ON "posts_transition" USING btree ("_order");
  CREATE INDEX "posts_transition_parent_id_idx" ON "posts_transition" USING btree ("_parent_id");
  CREATE INDEX "posts_transition_path_idx" ON "posts_transition" USING btree ("_path");
  CREATE INDEX "posts_blocks_feature_heading_offset_order_idx" ON "posts_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "posts_blocks_feature_heading_offset_parent_id_idx" ON "posts_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_feature_heading_offset_path_idx" ON "posts_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "posts_full_media_order_idx" ON "posts_full_media" USING btree ("_order");
  CREATE INDEX "posts_full_media_parent_id_idx" ON "posts_full_media" USING btree ("_parent_id");
  CREATE INDEX "posts_full_media_path_idx" ON "posts_full_media" USING btree ("_path");
  CREATE INDEX "posts_full_media_media_idx" ON "posts_full_media" USING btree ("media_id");
  CREATE INDEX "posts_full_media_shader_shader_studio_idx" ON "posts_full_media" USING btree ("shader_studio_id");
  CREATE INDEX "posts_full_media_shader_shader_poster_media_idx" ON "posts_full_media" USING btree ("shader_poster_media_id");
  CREATE INDEX "posts_media_split_order_idx" ON "posts_media_split" USING btree ("_order");
  CREATE INDEX "posts_media_split_parent_id_idx" ON "posts_media_split" USING btree ("_parent_id");
  CREATE INDEX "posts_media_split_path_idx" ON "posts_media_split" USING btree ("_path");
  CREATE INDEX "posts_media_split_media_idx" ON "posts_media_split" USING btree ("media_id");
  CREATE INDEX "posts_media_split_shader_shader_studio_idx" ON "posts_media_split" USING btree ("shader_studio_id");
  CREATE INDEX "posts_media_split_shader_shader_poster_media_idx" ON "posts_media_split" USING btree ("shader_poster_media_id");
  CREATE INDEX "posts_split_narrow_order_idx" ON "posts_split_narrow" USING btree ("_order");
  CREATE INDEX "posts_split_narrow_parent_id_idx" ON "posts_split_narrow" USING btree ("_parent_id");
  CREATE INDEX "posts_split_narrow_path_idx" ON "posts_split_narrow" USING btree ("_path");
  CREATE INDEX "posts_split_narrow_media_idx" ON "posts_split_narrow" USING btree ("media_id");
  CREATE INDEX "posts_split_narrow_shader_shader_studio_idx" ON "posts_split_narrow" USING btree ("shader_studio_id");
  CREATE INDEX "posts_split_narrow_shader_shader_poster_media_idx" ON "posts_split_narrow" USING btree ("shader_poster_media_id");
  CREATE INDEX "posts_image_pair_order_idx" ON "posts_image_pair" USING btree ("_order");
  CREATE INDEX "posts_image_pair_parent_id_idx" ON "posts_image_pair" USING btree ("_parent_id");
  CREATE INDEX "posts_image_pair_path_idx" ON "posts_image_pair" USING btree ("_path");
  CREATE INDEX "posts_image_pair_portrait_media_idx" ON "posts_image_pair" USING btree ("portrait_media_id");
  CREATE INDEX "posts_image_pair_landscape_media_idx" ON "posts_image_pair" USING btree ("landscape_media_id");
  CREATE INDEX "posts_split_offset_order_idx" ON "posts_split_offset" USING btree ("_order");
  CREATE INDEX "posts_split_offset_parent_id_idx" ON "posts_split_offset" USING btree ("_parent_id");
  CREATE INDEX "posts_split_offset_path_idx" ON "posts_split_offset" USING btree ("_path");
  CREATE INDEX "posts_split_offset_large_media_idx" ON "posts_split_offset" USING btree ("large_media_id");
  CREATE INDEX "posts_split_offset_small_media_idx" ON "posts_split_offset" USING btree ("small_media_id");
  CREATE INDEX "posts_image_statement_order_idx" ON "posts_image_statement" USING btree ("_order");
  CREATE INDEX "posts_image_statement_parent_id_idx" ON "posts_image_statement" USING btree ("_parent_id");
  CREATE INDEX "posts_image_statement_path_idx" ON "posts_image_statement" USING btree ("_path");
  CREATE INDEX "posts_image_statement_media_idx" ON "posts_image_statement" USING btree ("media_id");
  CREATE INDEX "posts_caption_order_idx" ON "posts_caption" USING btree ("_order");
  CREATE INDEX "posts_caption_parent_id_idx" ON "posts_caption" USING btree ("_parent_id");
  CREATE INDEX "posts_caption_path_idx" ON "posts_caption" USING btree ("_path");
  CREATE INDEX "posts_caption_media_idx" ON "posts_caption" USING btree ("media_id");
  CREATE INDEX "posts_youtube_order_idx" ON "posts_youtube" USING btree ("_order");
  CREATE INDEX "posts_youtube_parent_id_idx" ON "posts_youtube" USING btree ("_parent_id");
  CREATE INDEX "posts_youtube_path_idx" ON "posts_youtube" USING btree ("_path");
  CREATE INDEX "posts_rich_text_order_idx" ON "posts_rich_text" USING btree ("_order");
  CREATE INDEX "posts_rich_text_parent_id_idx" ON "posts_rich_text" USING btree ("_parent_id");
  CREATE INDEX "posts_rich_text_path_idx" ON "posts_rich_text" USING btree ("_path");
  CREATE INDEX "posts_code_order_idx" ON "posts_code" USING btree ("_order");
  CREATE INDEX "posts_code_parent_id_idx" ON "posts_code" USING btree ("_parent_id");
  CREATE INDEX "posts_code_path_idx" ON "posts_code" USING btree ("_path");
  CREATE INDEX "posts_faq_items_order_idx" ON "posts_faq_items" USING btree ("_order");
  CREATE INDEX "posts_faq_items_parent_id_idx" ON "posts_faq_items" USING btree ("_parent_id");
  CREATE INDEX "posts_faq_order_idx" ON "posts_faq" USING btree ("_order");
  CREATE INDEX "posts_faq_parent_id_idx" ON "posts_faq" USING btree ("_parent_id");
  CREATE INDEX "posts_faq_path_idx" ON "posts_faq" USING btree ("_path");
  CREATE INDEX "posts_blocks_carousel_slides_order_idx" ON "posts_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "posts_blocks_carousel_slides_parent_id_idx" ON "posts_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_carousel_slides_media_idx" ON "posts_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "posts_blocks_carousel_order_idx" ON "posts_blocks_carousel" USING btree ("_order");
  CREATE INDEX "posts_blocks_carousel_parent_id_idx" ON "posts_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_carousel_path_idx" ON "posts_blocks_carousel" USING btree ("_path");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_items_order_idx" ON "posts_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_items_parent_id_idx" ON "posts_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_order_idx" ON "posts_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_parent_id_idx" ON "posts_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_media_idx" ON "posts_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "posts_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_shader_shader_poster_medi_idx" ON "posts_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "posts_blocks_feature_tabs_order_idx" ON "posts_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "posts_blocks_feature_tabs_parent_id_idx" ON "posts_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_feature_tabs_path_idx" ON "posts_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "posts_insight_list_items_order_idx" ON "posts_insight_list_items" USING btree ("_order");
  CREATE INDEX "posts_insight_list_items_parent_id_idx" ON "posts_insight_list_items" USING btree ("_parent_id");
  CREATE INDEX "posts_insight_list_items_media_idx" ON "posts_insight_list_items" USING btree ("media_id");
  CREATE INDEX "posts_insight_list_order_idx" ON "posts_insight_list" USING btree ("_order");
  CREATE INDEX "posts_insight_list_parent_id_idx" ON "posts_insight_list" USING btree ("_parent_id");
  CREATE INDEX "posts_insight_list_path_idx" ON "posts_insight_list" USING btree ("_path");
  CREATE INDEX "posts_blocks_content_columns_slider_slides_order_idx" ON "posts_blocks_content_columns_slider_slides" USING btree ("_order");
  CREATE INDEX "posts_blocks_content_columns_slider_slides_parent_id_idx" ON "posts_blocks_content_columns_slider_slides" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_content_columns_slider_slides_slide_slide_i_idx" ON "posts_blocks_content_columns_slider_slides" USING btree ("slide_image_id");
  CREATE INDEX "posts_blocks_content_columns_order_idx" ON "posts_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "posts_blocks_content_columns_parent_id_idx" ON "posts_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_content_columns_work_work_works_idx" ON "posts_blocks_content_columns" USING btree ("work_works_id");
  CREATE INDEX "posts_blocks_content_columns_post_post_posts_idx" ON "posts_blocks_content_columns" USING btree ("post_posts_id");
  CREATE INDEX "posts_blocks_content_columns_media_media_media_idx" ON "posts_blocks_content_columns" USING btree ("media_media_id");
  CREATE INDEX "posts_blocks_content_order_idx" ON "posts_blocks_content" USING btree ("_order");
  CREATE INDEX "posts_blocks_content_parent_id_idx" ON "posts_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_content_path_idx" ON "posts_blocks_content" USING btree ("_path");
  CREATE INDEX "posts_section_order_idx" ON "posts_section" USING btree ("_order");
  CREATE INDEX "posts_section_parent_id_idx" ON "posts_section" USING btree ("_parent_id");
  CREATE INDEX "posts_section_path_idx" ON "posts_section" USING btree ("_path");
  CREATE INDEX "__posts_v_transition_v_order_idx" ON "__posts_v_transition_v" USING btree ("_order");
  CREATE INDEX "__posts_v_transition_v_parent_id_idx" ON "__posts_v_transition_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_transition_v_path_idx" ON "__posts_v_transition_v" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_feature_heading_offset_order_idx" ON "_posts_v_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_feature_heading_offset_parent_id_idx" ON "_posts_v_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_feature_heading_offset_path_idx" ON "_posts_v_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "__posts_v_full_media_v_order_idx" ON "__posts_v_full_media_v" USING btree ("_order");
  CREATE INDEX "__posts_v_full_media_v_parent_id_idx" ON "__posts_v_full_media_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_full_media_v_path_idx" ON "__posts_v_full_media_v" USING btree ("_path");
  CREATE INDEX "__posts_v_full_media_v_media_idx" ON "__posts_v_full_media_v" USING btree ("media_id");
  CREATE INDEX "__posts_v_full_media_v_shader_shader_studio_idx" ON "__posts_v_full_media_v" USING btree ("shader_studio_id");
  CREATE INDEX "__posts_v_full_media_v_shader_shader_poster_media_idx" ON "__posts_v_full_media_v" USING btree ("shader_poster_media_id");
  CREATE INDEX "__posts_v_media_split_v_order_idx" ON "__posts_v_media_split_v" USING btree ("_order");
  CREATE INDEX "__posts_v_media_split_v_parent_id_idx" ON "__posts_v_media_split_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_media_split_v_path_idx" ON "__posts_v_media_split_v" USING btree ("_path");
  CREATE INDEX "__posts_v_media_split_v_media_idx" ON "__posts_v_media_split_v" USING btree ("media_id");
  CREATE INDEX "__posts_v_media_split_v_shader_shader_studio_idx" ON "__posts_v_media_split_v" USING btree ("shader_studio_id");
  CREATE INDEX "__posts_v_media_split_v_shader_shader_poster_media_idx" ON "__posts_v_media_split_v" USING btree ("shader_poster_media_id");
  CREATE INDEX "__posts_v_split_narrow_v_order_idx" ON "__posts_v_split_narrow_v" USING btree ("_order");
  CREATE INDEX "__posts_v_split_narrow_v_parent_id_idx" ON "__posts_v_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_split_narrow_v_path_idx" ON "__posts_v_split_narrow_v" USING btree ("_path");
  CREATE INDEX "__posts_v_split_narrow_v_media_idx" ON "__posts_v_split_narrow_v" USING btree ("media_id");
  CREATE INDEX "__posts_v_split_narrow_v_shader_shader_studio_idx" ON "__posts_v_split_narrow_v" USING btree ("shader_studio_id");
  CREATE INDEX "__posts_v_split_narrow_v_shader_shader_poster_media_idx" ON "__posts_v_split_narrow_v" USING btree ("shader_poster_media_id");
  CREATE INDEX "__posts_v_image_pair_v_order_idx" ON "__posts_v_image_pair_v" USING btree ("_order");
  CREATE INDEX "__posts_v_image_pair_v_parent_id_idx" ON "__posts_v_image_pair_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_image_pair_v_path_idx" ON "__posts_v_image_pair_v" USING btree ("_path");
  CREATE INDEX "__posts_v_image_pair_v_portrait_media_idx" ON "__posts_v_image_pair_v" USING btree ("portrait_media_id");
  CREATE INDEX "__posts_v_image_pair_v_landscape_media_idx" ON "__posts_v_image_pair_v" USING btree ("landscape_media_id");
  CREATE INDEX "__posts_v_split_offset_v_order_idx" ON "__posts_v_split_offset_v" USING btree ("_order");
  CREATE INDEX "__posts_v_split_offset_v_parent_id_idx" ON "__posts_v_split_offset_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_split_offset_v_path_idx" ON "__posts_v_split_offset_v" USING btree ("_path");
  CREATE INDEX "__posts_v_split_offset_v_large_media_idx" ON "__posts_v_split_offset_v" USING btree ("large_media_id");
  CREATE INDEX "__posts_v_split_offset_v_small_media_idx" ON "__posts_v_split_offset_v" USING btree ("small_media_id");
  CREATE INDEX "__posts_v_image_statement_v_order_idx" ON "__posts_v_image_statement_v" USING btree ("_order");
  CREATE INDEX "__posts_v_image_statement_v_parent_id_idx" ON "__posts_v_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_image_statement_v_path_idx" ON "__posts_v_image_statement_v" USING btree ("_path");
  CREATE INDEX "__posts_v_image_statement_v_media_idx" ON "__posts_v_image_statement_v" USING btree ("media_id");
  CREATE INDEX "__posts_v_caption_v_order_idx" ON "__posts_v_caption_v" USING btree ("_order");
  CREATE INDEX "__posts_v_caption_v_parent_id_idx" ON "__posts_v_caption_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_caption_v_path_idx" ON "__posts_v_caption_v" USING btree ("_path");
  CREATE INDEX "__posts_v_caption_v_media_idx" ON "__posts_v_caption_v" USING btree ("media_id");
  CREATE INDEX "__posts_v_youtube_v_order_idx" ON "__posts_v_youtube_v" USING btree ("_order");
  CREATE INDEX "__posts_v_youtube_v_parent_id_idx" ON "__posts_v_youtube_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_youtube_v_path_idx" ON "__posts_v_youtube_v" USING btree ("_path");
  CREATE INDEX "__posts_v_rich_text_v_order_idx" ON "__posts_v_rich_text_v" USING btree ("_order");
  CREATE INDEX "__posts_v_rich_text_v_parent_id_idx" ON "__posts_v_rich_text_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_rich_text_v_path_idx" ON "__posts_v_rich_text_v" USING btree ("_path");
  CREATE INDEX "__posts_v_code_v_order_idx" ON "__posts_v_code_v" USING btree ("_order");
  CREATE INDEX "__posts_v_code_v_parent_id_idx" ON "__posts_v_code_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_code_v_path_idx" ON "__posts_v_code_v" USING btree ("_path");
  CREATE INDEX "__posts_v_faq_v_items_order_idx" ON "__posts_v_faq_v_items" USING btree ("_order");
  CREATE INDEX "__posts_v_faq_v_items_parent_id_idx" ON "__posts_v_faq_v_items" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_faq_v_order_idx" ON "__posts_v_faq_v" USING btree ("_order");
  CREATE INDEX "__posts_v_faq_v_parent_id_idx" ON "__posts_v_faq_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_faq_v_path_idx" ON "__posts_v_faq_v" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_carousel_slides_order_idx" ON "_posts_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_carousel_slides_parent_id_idx" ON "_posts_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_slides_media_idx" ON "_posts_v_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "_posts_v_blocks_carousel_order_idx" ON "_posts_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_carousel_parent_id_idx" ON "_posts_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_path_idx" ON "_posts_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_items_order_idx" ON "_posts_v_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_items_parent_id_idx" ON "_posts_v_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_order_idx" ON "_posts_v_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_parent_id_idx" ON "_posts_v_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_media_idx" ON "_posts_v_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "_posts_v_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_shader_shader_poster_m_idx" ON "_posts_v_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "_posts_v_blocks_feature_tabs_order_idx" ON "_posts_v_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_feature_tabs_parent_id_idx" ON "_posts_v_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_feature_tabs_path_idx" ON "_posts_v_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "__posts_v_insight_list_v_items_order_idx" ON "__posts_v_insight_list_v_items" USING btree ("_order");
  CREATE INDEX "__posts_v_insight_list_v_items_parent_id_idx" ON "__posts_v_insight_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_insight_list_v_items_media_idx" ON "__posts_v_insight_list_v_items" USING btree ("media_id");
  CREATE INDEX "__posts_v_insight_list_v_order_idx" ON "__posts_v_insight_list_v" USING btree ("_order");
  CREATE INDEX "__posts_v_insight_list_v_parent_id_idx" ON "__posts_v_insight_list_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_insight_list_v_path_idx" ON "__posts_v_insight_list_v" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_content_columns_slider_slides_order_idx" ON "_posts_v_blocks_content_columns_slider_slides" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_content_columns_slider_slides_parent_id_idx" ON "_posts_v_blocks_content_columns_slider_slides" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_content_columns_slider_slides_slide_slid_idx" ON "_posts_v_blocks_content_columns_slider_slides" USING btree ("slide_image_id");
  CREATE INDEX "_posts_v_blocks_content_columns_order_idx" ON "_posts_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_content_columns_parent_id_idx" ON "_posts_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_content_columns_work_work_works_idx" ON "_posts_v_blocks_content_columns" USING btree ("work_works_id");
  CREATE INDEX "_posts_v_blocks_content_columns_post_post_posts_idx" ON "_posts_v_blocks_content_columns" USING btree ("post_posts_id");
  CREATE INDEX "_posts_v_blocks_content_columns_media_media_media_idx" ON "_posts_v_blocks_content_columns" USING btree ("media_media_id");
  CREATE INDEX "_posts_v_blocks_content_order_idx" ON "_posts_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_content_parent_id_idx" ON "_posts_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_content_path_idx" ON "_posts_v_blocks_content" USING btree ("_path");
  CREATE INDEX "__posts_v_section_v_order_idx" ON "__posts_v_section_v" USING btree ("_order");
  CREATE INDEX "__posts_v_section_v_parent_id_idx" ON "__posts_v_section_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_section_v_path_idx" ON "__posts_v_section_v" USING btree ("_path");
  CREATE INDEX "works_transition_order_idx" ON "works_transition" USING btree ("_order");
  CREATE INDEX "works_transition_parent_id_idx" ON "works_transition" USING btree ("_parent_id");
  CREATE INDEX "works_transition_path_idx" ON "works_transition" USING btree ("_path");
  CREATE INDEX "works_blocks_feature_heading_offset_order_idx" ON "works_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "works_blocks_feature_heading_offset_parent_id_idx" ON "works_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "works_blocks_feature_heading_offset_path_idx" ON "works_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "works_full_media_order_idx" ON "works_full_media" USING btree ("_order");
  CREATE INDEX "works_full_media_parent_id_idx" ON "works_full_media" USING btree ("_parent_id");
  CREATE INDEX "works_full_media_path_idx" ON "works_full_media" USING btree ("_path");
  CREATE INDEX "works_full_media_media_idx" ON "works_full_media" USING btree ("media_id");
  CREATE INDEX "works_full_media_shader_shader_studio_idx" ON "works_full_media" USING btree ("shader_studio_id");
  CREATE INDEX "works_full_media_shader_shader_poster_media_idx" ON "works_full_media" USING btree ("shader_poster_media_id");
  CREATE INDEX "works_media_split_order_idx" ON "works_media_split" USING btree ("_order");
  CREATE INDEX "works_media_split_parent_id_idx" ON "works_media_split" USING btree ("_parent_id");
  CREATE INDEX "works_media_split_path_idx" ON "works_media_split" USING btree ("_path");
  CREATE INDEX "works_media_split_media_idx" ON "works_media_split" USING btree ("media_id");
  CREATE INDEX "works_media_split_shader_shader_studio_idx" ON "works_media_split" USING btree ("shader_studio_id");
  CREATE INDEX "works_media_split_shader_shader_poster_media_idx" ON "works_media_split" USING btree ("shader_poster_media_id");
  CREATE INDEX "works_split_narrow_order_idx" ON "works_split_narrow" USING btree ("_order");
  CREATE INDEX "works_split_narrow_parent_id_idx" ON "works_split_narrow" USING btree ("_parent_id");
  CREATE INDEX "works_split_narrow_path_idx" ON "works_split_narrow" USING btree ("_path");
  CREATE INDEX "works_split_narrow_media_idx" ON "works_split_narrow" USING btree ("media_id");
  CREATE INDEX "works_split_narrow_shader_shader_studio_idx" ON "works_split_narrow" USING btree ("shader_studio_id");
  CREATE INDEX "works_split_narrow_shader_shader_poster_media_idx" ON "works_split_narrow" USING btree ("shader_poster_media_id");
  CREATE INDEX "works_image_pair_order_idx" ON "works_image_pair" USING btree ("_order");
  CREATE INDEX "works_image_pair_parent_id_idx" ON "works_image_pair" USING btree ("_parent_id");
  CREATE INDEX "works_image_pair_path_idx" ON "works_image_pair" USING btree ("_path");
  CREATE INDEX "works_image_pair_portrait_media_idx" ON "works_image_pair" USING btree ("portrait_media_id");
  CREATE INDEX "works_image_pair_landscape_media_idx" ON "works_image_pair" USING btree ("landscape_media_id");
  CREATE INDEX "works_split_offset_order_idx" ON "works_split_offset" USING btree ("_order");
  CREATE INDEX "works_split_offset_parent_id_idx" ON "works_split_offset" USING btree ("_parent_id");
  CREATE INDEX "works_split_offset_path_idx" ON "works_split_offset" USING btree ("_path");
  CREATE INDEX "works_split_offset_large_media_idx" ON "works_split_offset" USING btree ("large_media_id");
  CREATE INDEX "works_split_offset_small_media_idx" ON "works_split_offset" USING btree ("small_media_id");
  CREATE INDEX "works_image_statement_order_idx" ON "works_image_statement" USING btree ("_order");
  CREATE INDEX "works_image_statement_parent_id_idx" ON "works_image_statement" USING btree ("_parent_id");
  CREATE INDEX "works_image_statement_path_idx" ON "works_image_statement" USING btree ("_path");
  CREATE INDEX "works_image_statement_media_idx" ON "works_image_statement" USING btree ("media_id");
  CREATE INDEX "works_caption_order_idx" ON "works_caption" USING btree ("_order");
  CREATE INDEX "works_caption_parent_id_idx" ON "works_caption" USING btree ("_parent_id");
  CREATE INDEX "works_caption_path_idx" ON "works_caption" USING btree ("_path");
  CREATE INDEX "works_caption_media_idx" ON "works_caption" USING btree ("media_id");
  CREATE INDEX "works_youtube_order_idx" ON "works_youtube" USING btree ("_order");
  CREATE INDEX "works_youtube_parent_id_idx" ON "works_youtube" USING btree ("_parent_id");
  CREATE INDEX "works_youtube_path_idx" ON "works_youtube" USING btree ("_path");
  CREATE INDEX "works_rich_text_order_idx" ON "works_rich_text" USING btree ("_order");
  CREATE INDEX "works_rich_text_parent_id_idx" ON "works_rich_text" USING btree ("_parent_id");
  CREATE INDEX "works_rich_text_path_idx" ON "works_rich_text" USING btree ("_path");
  CREATE INDEX "works_code_order_idx" ON "works_code" USING btree ("_order");
  CREATE INDEX "works_code_parent_id_idx" ON "works_code" USING btree ("_parent_id");
  CREATE INDEX "works_code_path_idx" ON "works_code" USING btree ("_path");
  CREATE INDEX "works_faq_items_order_idx" ON "works_faq_items" USING btree ("_order");
  CREATE INDEX "works_faq_items_parent_id_idx" ON "works_faq_items" USING btree ("_parent_id");
  CREATE INDEX "works_faq_order_idx" ON "works_faq" USING btree ("_order");
  CREATE INDEX "works_faq_parent_id_idx" ON "works_faq" USING btree ("_parent_id");
  CREATE INDEX "works_faq_path_idx" ON "works_faq" USING btree ("_path");
  CREATE INDEX "works_blocks_carousel_slides_order_idx" ON "works_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "works_blocks_carousel_slides_parent_id_idx" ON "works_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "works_blocks_carousel_slides_media_idx" ON "works_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "works_blocks_carousel_order_idx" ON "works_blocks_carousel" USING btree ("_order");
  CREATE INDEX "works_blocks_carousel_parent_id_idx" ON "works_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "works_blocks_carousel_path_idx" ON "works_blocks_carousel" USING btree ("_path");
  CREATE INDEX "works_blocks_feature_tabs_tabs_items_order_idx" ON "works_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "works_blocks_feature_tabs_tabs_items_parent_id_idx" ON "works_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "works_blocks_feature_tabs_tabs_order_idx" ON "works_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "works_blocks_feature_tabs_tabs_parent_id_idx" ON "works_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "works_blocks_feature_tabs_tabs_media_idx" ON "works_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "works_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "works_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "works_blocks_feature_tabs_tabs_shader_shader_poster_medi_idx" ON "works_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "works_blocks_feature_tabs_order_idx" ON "works_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "works_blocks_feature_tabs_parent_id_idx" ON "works_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "works_blocks_feature_tabs_path_idx" ON "works_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "works_insight_list_items_order_idx" ON "works_insight_list_items" USING btree ("_order");
  CREATE INDEX "works_insight_list_items_parent_id_idx" ON "works_insight_list_items" USING btree ("_parent_id");
  CREATE INDEX "works_insight_list_items_media_idx" ON "works_insight_list_items" USING btree ("media_id");
  CREATE INDEX "works_insight_list_order_idx" ON "works_insight_list" USING btree ("_order");
  CREATE INDEX "works_insight_list_parent_id_idx" ON "works_insight_list" USING btree ("_parent_id");
  CREATE INDEX "works_insight_list_path_idx" ON "works_insight_list" USING btree ("_path");
  CREATE INDEX "works_section_order_idx" ON "works_section" USING btree ("_order");
  CREATE INDEX "works_section_parent_id_idx" ON "works_section" USING btree ("_parent_id");
  CREATE INDEX "works_section_path_idx" ON "works_section" USING btree ("_path");
  CREATE INDEX "__works_v_transition_v_order_idx" ON "__works_v_transition_v" USING btree ("_order");
  CREATE INDEX "__works_v_transition_v_parent_id_idx" ON "__works_v_transition_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_transition_v_path_idx" ON "__works_v_transition_v" USING btree ("_path");
  CREATE INDEX "_works_v_blocks_feature_heading_offset_order_idx" ON "_works_v_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "_works_v_blocks_feature_heading_offset_parent_id_idx" ON "_works_v_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "_works_v_blocks_feature_heading_offset_path_idx" ON "_works_v_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "__works_v_full_media_v_order_idx" ON "__works_v_full_media_v" USING btree ("_order");
  CREATE INDEX "__works_v_full_media_v_parent_id_idx" ON "__works_v_full_media_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_full_media_v_path_idx" ON "__works_v_full_media_v" USING btree ("_path");
  CREATE INDEX "__works_v_full_media_v_media_idx" ON "__works_v_full_media_v" USING btree ("media_id");
  CREATE INDEX "__works_v_full_media_v_shader_shader_studio_idx" ON "__works_v_full_media_v" USING btree ("shader_studio_id");
  CREATE INDEX "__works_v_full_media_v_shader_shader_poster_media_idx" ON "__works_v_full_media_v" USING btree ("shader_poster_media_id");
  CREATE INDEX "__works_v_media_split_v_order_idx" ON "__works_v_media_split_v" USING btree ("_order");
  CREATE INDEX "__works_v_media_split_v_parent_id_idx" ON "__works_v_media_split_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_media_split_v_path_idx" ON "__works_v_media_split_v" USING btree ("_path");
  CREATE INDEX "__works_v_media_split_v_media_idx" ON "__works_v_media_split_v" USING btree ("media_id");
  CREATE INDEX "__works_v_media_split_v_shader_shader_studio_idx" ON "__works_v_media_split_v" USING btree ("shader_studio_id");
  CREATE INDEX "__works_v_media_split_v_shader_shader_poster_media_idx" ON "__works_v_media_split_v" USING btree ("shader_poster_media_id");
  CREATE INDEX "__works_v_split_narrow_v_order_idx" ON "__works_v_split_narrow_v" USING btree ("_order");
  CREATE INDEX "__works_v_split_narrow_v_parent_id_idx" ON "__works_v_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_split_narrow_v_path_idx" ON "__works_v_split_narrow_v" USING btree ("_path");
  CREATE INDEX "__works_v_split_narrow_v_media_idx" ON "__works_v_split_narrow_v" USING btree ("media_id");
  CREATE INDEX "__works_v_split_narrow_v_shader_shader_studio_idx" ON "__works_v_split_narrow_v" USING btree ("shader_studio_id");
  CREATE INDEX "__works_v_split_narrow_v_shader_shader_poster_media_idx" ON "__works_v_split_narrow_v" USING btree ("shader_poster_media_id");
  CREATE INDEX "__works_v_image_pair_v_order_idx" ON "__works_v_image_pair_v" USING btree ("_order");
  CREATE INDEX "__works_v_image_pair_v_parent_id_idx" ON "__works_v_image_pair_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_image_pair_v_path_idx" ON "__works_v_image_pair_v" USING btree ("_path");
  CREATE INDEX "__works_v_image_pair_v_portrait_media_idx" ON "__works_v_image_pair_v" USING btree ("portrait_media_id");
  CREATE INDEX "__works_v_image_pair_v_landscape_media_idx" ON "__works_v_image_pair_v" USING btree ("landscape_media_id");
  CREATE INDEX "__works_v_split_offset_v_order_idx" ON "__works_v_split_offset_v" USING btree ("_order");
  CREATE INDEX "__works_v_split_offset_v_parent_id_idx" ON "__works_v_split_offset_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_split_offset_v_path_idx" ON "__works_v_split_offset_v" USING btree ("_path");
  CREATE INDEX "__works_v_split_offset_v_large_media_idx" ON "__works_v_split_offset_v" USING btree ("large_media_id");
  CREATE INDEX "__works_v_split_offset_v_small_media_idx" ON "__works_v_split_offset_v" USING btree ("small_media_id");
  CREATE INDEX "__works_v_image_statement_v_order_idx" ON "__works_v_image_statement_v" USING btree ("_order");
  CREATE INDEX "__works_v_image_statement_v_parent_id_idx" ON "__works_v_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_image_statement_v_path_idx" ON "__works_v_image_statement_v" USING btree ("_path");
  CREATE INDEX "__works_v_image_statement_v_media_idx" ON "__works_v_image_statement_v" USING btree ("media_id");
  CREATE INDEX "__works_v_caption_v_order_idx" ON "__works_v_caption_v" USING btree ("_order");
  CREATE INDEX "__works_v_caption_v_parent_id_idx" ON "__works_v_caption_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_caption_v_path_idx" ON "__works_v_caption_v" USING btree ("_path");
  CREATE INDEX "__works_v_caption_v_media_idx" ON "__works_v_caption_v" USING btree ("media_id");
  CREATE INDEX "__works_v_youtube_v_order_idx" ON "__works_v_youtube_v" USING btree ("_order");
  CREATE INDEX "__works_v_youtube_v_parent_id_idx" ON "__works_v_youtube_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_youtube_v_path_idx" ON "__works_v_youtube_v" USING btree ("_path");
  CREATE INDEX "__works_v_rich_text_v_order_idx" ON "__works_v_rich_text_v" USING btree ("_order");
  CREATE INDEX "__works_v_rich_text_v_parent_id_idx" ON "__works_v_rich_text_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_rich_text_v_path_idx" ON "__works_v_rich_text_v" USING btree ("_path");
  CREATE INDEX "__works_v_code_v_order_idx" ON "__works_v_code_v" USING btree ("_order");
  CREATE INDEX "__works_v_code_v_parent_id_idx" ON "__works_v_code_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_code_v_path_idx" ON "__works_v_code_v" USING btree ("_path");
  CREATE INDEX "__works_v_faq_v_items_order_idx" ON "__works_v_faq_v_items" USING btree ("_order");
  CREATE INDEX "__works_v_faq_v_items_parent_id_idx" ON "__works_v_faq_v_items" USING btree ("_parent_id");
  CREATE INDEX "__works_v_faq_v_order_idx" ON "__works_v_faq_v" USING btree ("_order");
  CREATE INDEX "__works_v_faq_v_parent_id_idx" ON "__works_v_faq_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_faq_v_path_idx" ON "__works_v_faq_v" USING btree ("_path");
  CREATE INDEX "_works_v_blocks_carousel_slides_order_idx" ON "_works_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_works_v_blocks_carousel_slides_parent_id_idx" ON "_works_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_works_v_blocks_carousel_slides_media_idx" ON "_works_v_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "_works_v_blocks_carousel_order_idx" ON "_works_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_works_v_blocks_carousel_parent_id_idx" ON "_works_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_works_v_blocks_carousel_path_idx" ON "_works_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_works_v_blocks_feature_tabs_tabs_items_order_idx" ON "_works_v_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "_works_v_blocks_feature_tabs_tabs_items_parent_id_idx" ON "_works_v_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_works_v_blocks_feature_tabs_tabs_order_idx" ON "_works_v_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_works_v_blocks_feature_tabs_tabs_parent_id_idx" ON "_works_v_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_works_v_blocks_feature_tabs_tabs_media_idx" ON "_works_v_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "_works_v_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "_works_v_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_works_v_blocks_feature_tabs_tabs_shader_shader_poster_m_idx" ON "_works_v_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "_works_v_blocks_feature_tabs_order_idx" ON "_works_v_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "_works_v_blocks_feature_tabs_parent_id_idx" ON "_works_v_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "_works_v_blocks_feature_tabs_path_idx" ON "_works_v_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "__works_v_insight_list_v_items_order_idx" ON "__works_v_insight_list_v_items" USING btree ("_order");
  CREATE INDEX "__works_v_insight_list_v_items_parent_id_idx" ON "__works_v_insight_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__works_v_insight_list_v_items_media_idx" ON "__works_v_insight_list_v_items" USING btree ("media_id");
  CREATE INDEX "__works_v_insight_list_v_order_idx" ON "__works_v_insight_list_v" USING btree ("_order");
  CREATE INDEX "__works_v_insight_list_v_parent_id_idx" ON "__works_v_insight_list_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_insight_list_v_path_idx" ON "__works_v_insight_list_v" USING btree ("_path");
  CREATE INDEX "__works_v_section_v_order_idx" ON "__works_v_section_v" USING btree ("_order");
  CREATE INDEX "__works_v_section_v_parent_id_idx" ON "__works_v_section_v" USING btree ("_parent_id");
  CREATE INDEX "__works_v_section_v_path_idx" ON "__works_v_section_v" USING btree ("_path");
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_works_fk" FOREIGN KEY ("works_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_works_fk" FOREIGN KEY ("works_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_rels_works_id_idx" ON "posts_rels" USING btree ("works_id");
  CREATE INDEX "_posts_v_rels_works_id_idx" ON "_posts_v_rels" USING btree ("works_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_transition" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_full_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_media_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_split_narrow" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_image_pair" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_split_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_image_statement" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_caption" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_youtube" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_code" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_carousel_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_insight_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_insight_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_transition_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_full_media_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_media_split_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_split_narrow_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_image_pair_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_split_offset_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_image_statement_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_caption_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_youtube_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_rich_text_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_code_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_faq_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_faq_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_carousel_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_insight_list_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_insight_list_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_section_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_transition" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_full_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_media_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_split_narrow" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_image_pair" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_split_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_image_statement" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_caption" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_youtube" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_code" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_carousel_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_insight_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_insight_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_content_columns_slider_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_transition_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_full_media_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_media_split_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_split_narrow_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_image_pair_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_split_offset_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_image_statement_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_caption_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_youtube_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_rich_text_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_code_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_faq_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_faq_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_carousel_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_insight_list_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_insight_list_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_content_columns_slider_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_section_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_transition" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_full_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_media_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_split_narrow" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_image_pair" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_split_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_image_statement" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_caption" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_youtube" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_code" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_blocks_carousel_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_blocks_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_insight_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_insight_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "works_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_transition_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_works_v_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_full_media_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_media_split_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_split_narrow_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_image_pair_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_split_offset_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_image_statement_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_caption_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_youtube_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_rich_text_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_code_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_faq_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_faq_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_works_v_blocks_carousel_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_works_v_blocks_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_works_v_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_works_v_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_works_v_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_insight_list_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_insight_list_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__works_v_section_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_transition" CASCADE;
  DROP TABLE "pages_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "pages_full_media" CASCADE;
  DROP TABLE "pages_media_split" CASCADE;
  DROP TABLE "pages_split_narrow" CASCADE;
  DROP TABLE "pages_image_pair" CASCADE;
  DROP TABLE "pages_split_offset" CASCADE;
  DROP TABLE "pages_image_statement" CASCADE;
  DROP TABLE "pages_caption" CASCADE;
  DROP TABLE "pages_youtube" CASCADE;
  DROP TABLE "pages_rich_text" CASCADE;
  DROP TABLE "pages_code" CASCADE;
  DROP TABLE "pages_faq_items" CASCADE;
  DROP TABLE "pages_faq" CASCADE;
  DROP TABLE "pages_blocks_carousel_slides" CASCADE;
  DROP TABLE "pages_blocks_carousel" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs" CASCADE;
  DROP TABLE "pages_insight_list_items" CASCADE;
  DROP TABLE "pages_insight_list" CASCADE;
  DROP TABLE "pages_section" CASCADE;
  DROP TABLE "__pages_v_transition_v" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "__pages_v_full_media_v" CASCADE;
  DROP TABLE "__pages_v_media_split_v" CASCADE;
  DROP TABLE "__pages_v_split_narrow_v" CASCADE;
  DROP TABLE "__pages_v_image_pair_v" CASCADE;
  DROP TABLE "__pages_v_split_offset_v" CASCADE;
  DROP TABLE "__pages_v_image_statement_v" CASCADE;
  DROP TABLE "__pages_v_caption_v" CASCADE;
  DROP TABLE "__pages_v_youtube_v" CASCADE;
  DROP TABLE "__pages_v_rich_text_v" CASCADE;
  DROP TABLE "__pages_v_code_v" CASCADE;
  DROP TABLE "__pages_v_faq_v_items" CASCADE;
  DROP TABLE "__pages_v_faq_v" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs" CASCADE;
  DROP TABLE "__pages_v_insight_list_v_items" CASCADE;
  DROP TABLE "__pages_v_insight_list_v" CASCADE;
  DROP TABLE "__pages_v_section_v" CASCADE;
  DROP TABLE "posts_transition" CASCADE;
  DROP TABLE "posts_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "posts_full_media" CASCADE;
  DROP TABLE "posts_media_split" CASCADE;
  DROP TABLE "posts_split_narrow" CASCADE;
  DROP TABLE "posts_image_pair" CASCADE;
  DROP TABLE "posts_split_offset" CASCADE;
  DROP TABLE "posts_image_statement" CASCADE;
  DROP TABLE "posts_caption" CASCADE;
  DROP TABLE "posts_youtube" CASCADE;
  DROP TABLE "posts_rich_text" CASCADE;
  DROP TABLE "posts_code" CASCADE;
  DROP TABLE "posts_faq_items" CASCADE;
  DROP TABLE "posts_faq" CASCADE;
  DROP TABLE "posts_blocks_carousel_slides" CASCADE;
  DROP TABLE "posts_blocks_carousel" CASCADE;
  DROP TABLE "posts_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "posts_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "posts_blocks_feature_tabs" CASCADE;
  DROP TABLE "posts_insight_list_items" CASCADE;
  DROP TABLE "posts_insight_list" CASCADE;
  DROP TABLE "posts_blocks_content_columns_slider_slides" CASCADE;
  DROP TABLE "posts_blocks_content_columns" CASCADE;
  DROP TABLE "posts_blocks_content" CASCADE;
  DROP TABLE "posts_section" CASCADE;
  DROP TABLE "__posts_v_transition_v" CASCADE;
  DROP TABLE "_posts_v_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "__posts_v_full_media_v" CASCADE;
  DROP TABLE "__posts_v_media_split_v" CASCADE;
  DROP TABLE "__posts_v_split_narrow_v" CASCADE;
  DROP TABLE "__posts_v_image_pair_v" CASCADE;
  DROP TABLE "__posts_v_split_offset_v" CASCADE;
  DROP TABLE "__posts_v_image_statement_v" CASCADE;
  DROP TABLE "__posts_v_caption_v" CASCADE;
  DROP TABLE "__posts_v_youtube_v" CASCADE;
  DROP TABLE "__posts_v_rich_text_v" CASCADE;
  DROP TABLE "__posts_v_code_v" CASCADE;
  DROP TABLE "__posts_v_faq_v_items" CASCADE;
  DROP TABLE "__posts_v_faq_v" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel" CASCADE;
  DROP TABLE "_posts_v_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "_posts_v_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "_posts_v_blocks_feature_tabs" CASCADE;
  DROP TABLE "__posts_v_insight_list_v_items" CASCADE;
  DROP TABLE "__posts_v_insight_list_v" CASCADE;
  DROP TABLE "_posts_v_blocks_content_columns_slider_slides" CASCADE;
  DROP TABLE "_posts_v_blocks_content_columns" CASCADE;
  DROP TABLE "_posts_v_blocks_content" CASCADE;
  DROP TABLE "__posts_v_section_v" CASCADE;
  DROP TABLE "works_transition" CASCADE;
  DROP TABLE "works_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "works_full_media" CASCADE;
  DROP TABLE "works_media_split" CASCADE;
  DROP TABLE "works_split_narrow" CASCADE;
  DROP TABLE "works_image_pair" CASCADE;
  DROP TABLE "works_split_offset" CASCADE;
  DROP TABLE "works_image_statement" CASCADE;
  DROP TABLE "works_caption" CASCADE;
  DROP TABLE "works_youtube" CASCADE;
  DROP TABLE "works_rich_text" CASCADE;
  DROP TABLE "works_code" CASCADE;
  DROP TABLE "works_faq_items" CASCADE;
  DROP TABLE "works_faq" CASCADE;
  DROP TABLE "works_blocks_carousel_slides" CASCADE;
  DROP TABLE "works_blocks_carousel" CASCADE;
  DROP TABLE "works_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "works_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "works_blocks_feature_tabs" CASCADE;
  DROP TABLE "works_insight_list_items" CASCADE;
  DROP TABLE "works_insight_list" CASCADE;
  DROP TABLE "works_section" CASCADE;
  DROP TABLE "__works_v_transition_v" CASCADE;
  DROP TABLE "_works_v_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "__works_v_full_media_v" CASCADE;
  DROP TABLE "__works_v_media_split_v" CASCADE;
  DROP TABLE "__works_v_split_narrow_v" CASCADE;
  DROP TABLE "__works_v_image_pair_v" CASCADE;
  DROP TABLE "__works_v_split_offset_v" CASCADE;
  DROP TABLE "__works_v_image_statement_v" CASCADE;
  DROP TABLE "__works_v_caption_v" CASCADE;
  DROP TABLE "__works_v_youtube_v" CASCADE;
  DROP TABLE "__works_v_rich_text_v" CASCADE;
  DROP TABLE "__works_v_code_v" CASCADE;
  DROP TABLE "__works_v_faq_v_items" CASCADE;
  DROP TABLE "__works_v_faq_v" CASCADE;
  DROP TABLE "_works_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_works_v_blocks_carousel" CASCADE;
  DROP TABLE "_works_v_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "_works_v_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "_works_v_blocks_feature_tabs" CASCADE;
  DROP TABLE "__works_v_insight_list_v_items" CASCADE;
  DROP TABLE "__works_v_insight_list_v" CASCADE;
  DROP TABLE "__works_v_section_v" CASCADE;
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_works_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_works_fk";
  
  DROP INDEX "posts_rels_works_id_idx";
  DROP INDEX "_posts_v_rels_works_id_idx";
  ALTER TABLE "posts_rels" DROP COLUMN "works_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "works_id";
  DROP TYPE "public"."enum_pages_transition_layout";
  DROP TYPE "public"."enum_pages_transition_theme";
  DROP TYPE "public"."enum_pages_transition_heading_level";
  DROP TYPE "public"."enum_pages_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum_pages_blocks_feature_heading_offset_theme";
  DROP TYPE "public"."enum_pages_full_media_visual_type";
  DROP TYPE "public"."enum_pages_full_media_shader_origin";
  DROP TYPE "public"."enum_visual_surface";
  DROP TYPE "public"."enum_leak_hover_targets";
  DROP TYPE "public"."enum_pages_full_media_width";
  DROP TYPE "public"."enum_pages_full_media_aspect_ratio";
  DROP TYPE "public"."enum_pages_full_media_content_position";
  DROP TYPE "public"."enum_pages_full_media_theme";
  DROP TYPE "public"."enum_pages_media_split_visual_type";
  DROP TYPE "public"."enum_pages_media_split_shader_origin";
  DROP TYPE "public"."enum_pages_media_split_layout";
  DROP TYPE "public"."enum_pages_media_split_aspect_ratio";
  DROP TYPE "public"."enum_pages_media_split_theme";
  DROP TYPE "public"."enum_pages_split_narrow_visual_type";
  DROP TYPE "public"."enum_pages_split_narrow_shader_origin";
  DROP TYPE "public"."enum_pages_split_narrow_image_position";
  DROP TYPE "public"."enum_pages_split_narrow_theme";
  DROP TYPE "public"."enum_pages_image_pair_portrait_position";
  DROP TYPE "public"."enum_pages_image_pair_text_position";
  DROP TYPE "public"."enum_pages_image_pair_theme";
  DROP TYPE "public"."enum_pages_split_offset_caption_position";
  DROP TYPE "public"."enum_pages_split_offset_theme";
  DROP TYPE "public"."enum_pages_image_statement_text_position";
  DROP TYPE "public"."enum_pages_image_statement_text_size";
  DROP TYPE "public"."enum_pages_image_statement_image_width";
  DROP TYPE "public"."enum_pages_image_statement_aspect_ratio";
  DROP TYPE "public"."enum_pages_image_statement_theme";
  DROP TYPE "public"."enum_pages_caption_size";
  DROP TYPE "public"."enum_pages_caption_theme";
  DROP TYPE "public"."enum_pages_youtube_size";
  DROP TYPE "public"."enum_pages_youtube_theme";
  DROP TYPE "public"."enum_pages_rich_text_theme";
  DROP TYPE "public"."enum_pages_code_language";
  DROP TYPE "public"."enum_pages_faq_link_type";
  DROP TYPE "public"."enum_pages_faq_theme";
  DROP TYPE "public"."enum_pages_blocks_carousel_width";
  DROP TYPE "public"."enum_pages_blocks_carousel_slide_size";
  DROP TYPE "public"."enum_pages_blocks_carousel_theme";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_tabs_visual_type";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_tabs_shader_origin";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_theme";
  DROP TYPE "public"."enum_pages_insight_list_layout";
  DROP TYPE "public"."enum_pages_insight_list_mark_size";
  DROP TYPE "public"."enum_pages_insight_list_theme";
  DROP TYPE "public"."enum_pages_section_theme";
  DROP TYPE "public"."enum_pages_section_spacing";
  DROP TYPE "public"."enum_pages_section_stack";
  DROP TYPE "public"."enum___pages_v_transition_v_layout";
  DROP TYPE "public"."enum___pages_v_transition_v_theme";
  DROP TYPE "public"."enum___pages_v_transition_v_heading_level";
  DROP TYPE "public"."enum__pages_v_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_feature_heading_offset_theme";
  DROP TYPE "public"."enum___pages_v_full_media_v_visual_type";
  DROP TYPE "public"."enum___pages_v_full_media_v_shader_origin";
  DROP TYPE "public"."enum___pages_v_full_media_v_width";
  DROP TYPE "public"."enum___pages_v_full_media_v_aspect_ratio";
  DROP TYPE "public"."enum___pages_v_full_media_v_content_position";
  DROP TYPE "public"."enum___pages_v_full_media_v_theme";
  DROP TYPE "public"."enum___pages_v_media_split_v_visual_type";
  DROP TYPE "public"."enum___pages_v_media_split_v_shader_origin";
  DROP TYPE "public"."enum___pages_v_media_split_v_layout";
  DROP TYPE "public"."enum___pages_v_media_split_v_aspect_ratio";
  DROP TYPE "public"."enum___pages_v_media_split_v_theme";
  DROP TYPE "public"."enum___pages_v_split_narrow_v_visual_type";
  DROP TYPE "public"."enum___pages_v_split_narrow_v_shader_origin";
  DROP TYPE "public"."enum___pages_v_split_narrow_v_image_position";
  DROP TYPE "public"."enum___pages_v_split_narrow_v_theme";
  DROP TYPE "public"."enum___pages_v_image_pair_v_portrait_position";
  DROP TYPE "public"."enum___pages_v_image_pair_v_text_position";
  DROP TYPE "public"."enum___pages_v_image_pair_v_theme";
  DROP TYPE "public"."enum___pages_v_split_offset_v_caption_position";
  DROP TYPE "public"."enum___pages_v_split_offset_v_theme";
  DROP TYPE "public"."enum___pages_v_image_statement_v_text_position";
  DROP TYPE "public"."enum___pages_v_image_statement_v_text_size";
  DROP TYPE "public"."enum___pages_v_image_statement_v_image_width";
  DROP TYPE "public"."enum___pages_v_image_statement_v_aspect_ratio";
  DROP TYPE "public"."enum___pages_v_image_statement_v_theme";
  DROP TYPE "public"."enum___pages_v_caption_v_size";
  DROP TYPE "public"."enum___pages_v_caption_v_theme";
  DROP TYPE "public"."enum___pages_v_youtube_v_size";
  DROP TYPE "public"."enum___pages_v_youtube_v_theme";
  DROP TYPE "public"."enum___pages_v_rich_text_v_theme";
  DROP TYPE "public"."enum___pages_v_code_v_language";
  DROP TYPE "public"."enum___pages_v_faq_v_link_type";
  DROP TYPE "public"."enum___pages_v_faq_v_theme";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_width";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_slide_size";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_theme";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_visual_type";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_shader_origin";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_theme";
  DROP TYPE "public"."enum___pages_v_insight_list_v_layout";
  DROP TYPE "public"."enum___pages_v_insight_list_v_mark_size";
  DROP TYPE "public"."enum___pages_v_insight_list_v_theme";
  DROP TYPE "public"."enum___pages_v_section_v_theme";
  DROP TYPE "public"."enum___pages_v_section_v_spacing";
  DROP TYPE "public"."enum___pages_v_section_v_stack";
  DROP TYPE "public"."enum_posts_transition_layout";
  DROP TYPE "public"."enum_posts_transition_theme";
  DROP TYPE "public"."enum_posts_transition_heading_level";
  DROP TYPE "public"."enum_posts_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum_posts_blocks_feature_heading_offset_theme";
  DROP TYPE "public"."enum_posts_full_media_visual_type";
  DROP TYPE "public"."enum_posts_full_media_shader_origin";
  DROP TYPE "public"."enum_posts_full_media_width";
  DROP TYPE "public"."enum_posts_full_media_aspect_ratio";
  DROP TYPE "public"."enum_posts_full_media_content_position";
  DROP TYPE "public"."enum_posts_full_media_theme";
  DROP TYPE "public"."enum_posts_media_split_visual_type";
  DROP TYPE "public"."enum_posts_media_split_shader_origin";
  DROP TYPE "public"."enum_posts_media_split_layout";
  DROP TYPE "public"."enum_posts_media_split_aspect_ratio";
  DROP TYPE "public"."enum_posts_media_split_theme";
  DROP TYPE "public"."enum_posts_split_narrow_visual_type";
  DROP TYPE "public"."enum_posts_split_narrow_shader_origin";
  DROP TYPE "public"."enum_posts_split_narrow_image_position";
  DROP TYPE "public"."enum_posts_split_narrow_theme";
  DROP TYPE "public"."enum_posts_image_pair_portrait_position";
  DROP TYPE "public"."enum_posts_image_pair_text_position";
  DROP TYPE "public"."enum_posts_image_pair_theme";
  DROP TYPE "public"."enum_posts_split_offset_caption_position";
  DROP TYPE "public"."enum_posts_split_offset_theme";
  DROP TYPE "public"."enum_posts_image_statement_text_position";
  DROP TYPE "public"."enum_posts_image_statement_text_size";
  DROP TYPE "public"."enum_posts_image_statement_image_width";
  DROP TYPE "public"."enum_posts_image_statement_aspect_ratio";
  DROP TYPE "public"."enum_posts_image_statement_theme";
  DROP TYPE "public"."enum_posts_caption_size";
  DROP TYPE "public"."enum_posts_caption_theme";
  DROP TYPE "public"."enum_posts_youtube_size";
  DROP TYPE "public"."enum_posts_youtube_theme";
  DROP TYPE "public"."enum_posts_rich_text_theme";
  DROP TYPE "public"."enum_posts_code_language";
  DROP TYPE "public"."enum_posts_faq_link_type";
  DROP TYPE "public"."enum_posts_faq_theme";
  DROP TYPE "public"."enum_posts_blocks_carousel_width";
  DROP TYPE "public"."enum_posts_blocks_carousel_slide_size";
  DROP TYPE "public"."enum_posts_blocks_carousel_theme";
  DROP TYPE "public"."enum_posts_blocks_feature_tabs_tabs_visual_type";
  DROP TYPE "public"."enum_posts_blocks_feature_tabs_tabs_shader_origin";
  DROP TYPE "public"."enum_posts_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum_posts_blocks_feature_tabs_theme";
  DROP TYPE "public"."enum_posts_insight_list_layout";
  DROP TYPE "public"."enum_posts_insight_list_mark_size";
  DROP TYPE "public"."enum_posts_insight_list_theme";
  DROP TYPE "public"."enum_posts_blocks_content_columns_sizes";
  DROP TYPE "public"."enum_posts_blocks_content_columns_content";
  DROP TYPE "public"."enum_posts_blocks_content_columns_text_text_size";
  DROP TYPE "public"."enum_posts_blocks_content_columns_text_link_type";
  DROP TYPE "public"."enum_posts_blocks_content_columns_text_link_appearance";
  DROP TYPE "public"."enum_posts_blocks_content_columns_section_heading_size";
  DROP TYPE "public"."enum_posts_blocks_content_columns_section_heading_align";
  DROP TYPE "public"."enum_posts_blocks_content_columns_section_heading_style";
  DROP TYPE "public"."enum_posts_blocks_content_columns_work_aspect";
  DROP TYPE "public"."enum_posts_blocks_content_columns_work_variant";
  DROP TYPE "public"."enum_posts_blocks_content_columns_post_aspect";
  DROP TYPE "public"."enum_posts_blocks_content_columns_post_variant";
  DROP TYPE "public"."enum_posts_blocks_content_columns_slider_theme";
  DROP TYPE "public"."enum_posts_blocks_content_columns_slider_intro_content_size";
  DROP TYPE "public"."enum_posts_blocks_content_columns_slider_intro_content_align";
  DROP TYPE "public"."enum_posts_blocks_content_columns_slider_style";
  DROP TYPE "public"."enum_posts_blocks_content_columns_slider_space_pt";
  DROP TYPE "public"."enum_posts_blocks_content_columns_slider_space_pb";
  DROP TYPE "public"."enum_posts_blocks_content_columns_slider_space_mt";
  DROP TYPE "public"."enum_posts_blocks_content_columns_slider_space_mb";
  DROP TYPE "public"."enum_posts_blocks_content_columns_media_aspect_ratio";
  DROP TYPE "public"."enum_posts_blocks_content_columns_media_caption_size";
  DROP TYPE "public"."enum_posts_blocks_content_columns_you_tube_aspect_ratio";
  DROP TYPE "public"."enum_posts_blocks_content_theme";
  DROP TYPE "public"."enum_posts_blocks_content_container_width";
  DROP TYPE "public"."enum_posts_blocks_content_space_pt";
  DROP TYPE "public"."enum_posts_blocks_content_space_pb";
  DROP TYPE "public"."enum_posts_blocks_content_space_mt";
  DROP TYPE "public"."enum_posts_blocks_content_space_mb";
  DROP TYPE "public"."enum_posts_section_theme";
  DROP TYPE "public"."enum_posts_section_spacing";
  DROP TYPE "public"."enum_posts_section_stack";
  DROP TYPE "public"."enum___posts_v_transition_v_layout";
  DROP TYPE "public"."enum___posts_v_transition_v_theme";
  DROP TYPE "public"."enum___posts_v_transition_v_heading_level";
  DROP TYPE "public"."enum__posts_v_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum__posts_v_blocks_feature_heading_offset_theme";
  DROP TYPE "public"."enum___posts_v_full_media_v_visual_type";
  DROP TYPE "public"."enum___posts_v_full_media_v_shader_origin";
  DROP TYPE "public"."enum___posts_v_full_media_v_width";
  DROP TYPE "public"."enum___posts_v_full_media_v_aspect_ratio";
  DROP TYPE "public"."enum___posts_v_full_media_v_content_position";
  DROP TYPE "public"."enum___posts_v_full_media_v_theme";
  DROP TYPE "public"."enum___posts_v_media_split_v_visual_type";
  DROP TYPE "public"."enum___posts_v_media_split_v_shader_origin";
  DROP TYPE "public"."enum___posts_v_media_split_v_layout";
  DROP TYPE "public"."enum___posts_v_media_split_v_aspect_ratio";
  DROP TYPE "public"."enum___posts_v_media_split_v_theme";
  DROP TYPE "public"."enum___posts_v_split_narrow_v_visual_type";
  DROP TYPE "public"."enum___posts_v_split_narrow_v_shader_origin";
  DROP TYPE "public"."enum___posts_v_split_narrow_v_image_position";
  DROP TYPE "public"."enum___posts_v_split_narrow_v_theme";
  DROP TYPE "public"."enum___posts_v_image_pair_v_portrait_position";
  DROP TYPE "public"."enum___posts_v_image_pair_v_text_position";
  DROP TYPE "public"."enum___posts_v_image_pair_v_theme";
  DROP TYPE "public"."enum___posts_v_split_offset_v_caption_position";
  DROP TYPE "public"."enum___posts_v_split_offset_v_theme";
  DROP TYPE "public"."enum___posts_v_image_statement_v_text_position";
  DROP TYPE "public"."enum___posts_v_image_statement_v_text_size";
  DROP TYPE "public"."enum___posts_v_image_statement_v_image_width";
  DROP TYPE "public"."enum___posts_v_image_statement_v_aspect_ratio";
  DROP TYPE "public"."enum___posts_v_image_statement_v_theme";
  DROP TYPE "public"."enum___posts_v_caption_v_size";
  DROP TYPE "public"."enum___posts_v_caption_v_theme";
  DROP TYPE "public"."enum___posts_v_youtube_v_size";
  DROP TYPE "public"."enum___posts_v_youtube_v_theme";
  DROP TYPE "public"."enum___posts_v_rich_text_v_theme";
  DROP TYPE "public"."enum___posts_v_code_v_language";
  DROP TYPE "public"."enum___posts_v_faq_v_link_type";
  DROP TYPE "public"."enum___posts_v_faq_v_theme";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_width";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_slide_size";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_theme";
  DROP TYPE "public"."enum__posts_v_blocks_feature_tabs_tabs_visual_type";
  DROP TYPE "public"."enum__posts_v_blocks_feature_tabs_tabs_shader_origin";
  DROP TYPE "public"."enum__posts_v_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum__posts_v_blocks_feature_tabs_theme";
  DROP TYPE "public"."enum___posts_v_insight_list_v_layout";
  DROP TYPE "public"."enum___posts_v_insight_list_v_mark_size";
  DROP TYPE "public"."enum___posts_v_insight_list_v_theme";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_sizes";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_content";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_text_text_size";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_text_link_type";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_text_link_appearance";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_section_heading_size";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_section_heading_align";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_section_heading_style";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_work_aspect";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_work_variant";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_post_aspect";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_post_variant";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_slider_theme";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_slider_intro_content_size";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_slider_intro_content_align";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_slider_style";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_slider_space_pt";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_slider_space_pb";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_slider_space_mt";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_slider_space_mb";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_media_aspect_ratio";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_media_caption_size";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_you_tube_aspect_ratio";
  DROP TYPE "public"."enum__posts_v_blocks_content_theme";
  DROP TYPE "public"."enum__posts_v_blocks_content_container_width";
  DROP TYPE "public"."enum__posts_v_blocks_content_space_pt";
  DROP TYPE "public"."enum__posts_v_blocks_content_space_pb";
  DROP TYPE "public"."enum__posts_v_blocks_content_space_mt";
  DROP TYPE "public"."enum__posts_v_blocks_content_space_mb";
  DROP TYPE "public"."enum___posts_v_section_v_theme";
  DROP TYPE "public"."enum___posts_v_section_v_spacing";
  DROP TYPE "public"."enum___posts_v_section_v_stack";
  DROP TYPE "public"."enum_works_transition_layout";
  DROP TYPE "public"."enum_works_transition_theme";
  DROP TYPE "public"."enum_works_transition_heading_level";
  DROP TYPE "public"."enum_works_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum_works_blocks_feature_heading_offset_theme";
  DROP TYPE "public"."enum_works_full_media_visual_type";
  DROP TYPE "public"."enum_works_full_media_shader_origin";
  DROP TYPE "public"."enum_works_full_media_width";
  DROP TYPE "public"."enum_works_full_media_aspect_ratio";
  DROP TYPE "public"."enum_works_full_media_content_position";
  DROP TYPE "public"."enum_works_full_media_theme";
  DROP TYPE "public"."enum_works_media_split_visual_type";
  DROP TYPE "public"."enum_works_media_split_shader_origin";
  DROP TYPE "public"."enum_works_media_split_layout";
  DROP TYPE "public"."enum_works_media_split_aspect_ratio";
  DROP TYPE "public"."enum_works_media_split_theme";
  DROP TYPE "public"."enum_works_split_narrow_visual_type";
  DROP TYPE "public"."enum_works_split_narrow_shader_origin";
  DROP TYPE "public"."enum_works_split_narrow_image_position";
  DROP TYPE "public"."enum_works_split_narrow_theme";
  DROP TYPE "public"."enum_works_image_pair_portrait_position";
  DROP TYPE "public"."enum_works_image_pair_text_position";
  DROP TYPE "public"."enum_works_image_pair_theme";
  DROP TYPE "public"."enum_works_split_offset_caption_position";
  DROP TYPE "public"."enum_works_split_offset_theme";
  DROP TYPE "public"."enum_works_image_statement_text_position";
  DROP TYPE "public"."enum_works_image_statement_text_size";
  DROP TYPE "public"."enum_works_image_statement_image_width";
  DROP TYPE "public"."enum_works_image_statement_aspect_ratio";
  DROP TYPE "public"."enum_works_image_statement_theme";
  DROP TYPE "public"."enum_works_caption_size";
  DROP TYPE "public"."enum_works_caption_theme";
  DROP TYPE "public"."enum_works_youtube_size";
  DROP TYPE "public"."enum_works_youtube_theme";
  DROP TYPE "public"."enum_works_rich_text_theme";
  DROP TYPE "public"."enum_works_code_language";
  DROP TYPE "public"."enum_works_faq_link_type";
  DROP TYPE "public"."enum_works_faq_theme";
  DROP TYPE "public"."enum_works_blocks_carousel_width";
  DROP TYPE "public"."enum_works_blocks_carousel_slide_size";
  DROP TYPE "public"."enum_works_blocks_carousel_theme";
  DROP TYPE "public"."enum_works_blocks_feature_tabs_tabs_visual_type";
  DROP TYPE "public"."enum_works_blocks_feature_tabs_tabs_shader_origin";
  DROP TYPE "public"."enum_works_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum_works_blocks_feature_tabs_theme";
  DROP TYPE "public"."enum_works_insight_list_layout";
  DROP TYPE "public"."enum_works_insight_list_mark_size";
  DROP TYPE "public"."enum_works_insight_list_theme";
  DROP TYPE "public"."enum_works_section_theme";
  DROP TYPE "public"."enum_works_section_spacing";
  DROP TYPE "public"."enum_works_section_stack";
  DROP TYPE "public"."enum___works_v_transition_v_layout";
  DROP TYPE "public"."enum___works_v_transition_v_theme";
  DROP TYPE "public"."enum___works_v_transition_v_heading_level";
  DROP TYPE "public"."enum__works_v_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum__works_v_blocks_feature_heading_offset_theme";
  DROP TYPE "public"."enum___works_v_full_media_v_visual_type";
  DROP TYPE "public"."enum___works_v_full_media_v_shader_origin";
  DROP TYPE "public"."enum___works_v_full_media_v_width";
  DROP TYPE "public"."enum___works_v_full_media_v_aspect_ratio";
  DROP TYPE "public"."enum___works_v_full_media_v_content_position";
  DROP TYPE "public"."enum___works_v_full_media_v_theme";
  DROP TYPE "public"."enum___works_v_media_split_v_visual_type";
  DROP TYPE "public"."enum___works_v_media_split_v_shader_origin";
  DROP TYPE "public"."enum___works_v_media_split_v_layout";
  DROP TYPE "public"."enum___works_v_media_split_v_aspect_ratio";
  DROP TYPE "public"."enum___works_v_media_split_v_theme";
  DROP TYPE "public"."enum___works_v_split_narrow_v_visual_type";
  DROP TYPE "public"."enum___works_v_split_narrow_v_shader_origin";
  DROP TYPE "public"."enum___works_v_split_narrow_v_image_position";
  DROP TYPE "public"."enum___works_v_split_narrow_v_theme";
  DROP TYPE "public"."enum___works_v_image_pair_v_portrait_position";
  DROP TYPE "public"."enum___works_v_image_pair_v_text_position";
  DROP TYPE "public"."enum___works_v_image_pair_v_theme";
  DROP TYPE "public"."enum___works_v_split_offset_v_caption_position";
  DROP TYPE "public"."enum___works_v_split_offset_v_theme";
  DROP TYPE "public"."enum___works_v_image_statement_v_text_position";
  DROP TYPE "public"."enum___works_v_image_statement_v_text_size";
  DROP TYPE "public"."enum___works_v_image_statement_v_image_width";
  DROP TYPE "public"."enum___works_v_image_statement_v_aspect_ratio";
  DROP TYPE "public"."enum___works_v_image_statement_v_theme";
  DROP TYPE "public"."enum___works_v_caption_v_size";
  DROP TYPE "public"."enum___works_v_caption_v_theme";
  DROP TYPE "public"."enum___works_v_youtube_v_size";
  DROP TYPE "public"."enum___works_v_youtube_v_theme";
  DROP TYPE "public"."enum___works_v_rich_text_v_theme";
  DROP TYPE "public"."enum___works_v_code_v_language";
  DROP TYPE "public"."enum___works_v_faq_v_link_type";
  DROP TYPE "public"."enum___works_v_faq_v_theme";
  DROP TYPE "public"."enum__works_v_blocks_carousel_width";
  DROP TYPE "public"."enum__works_v_blocks_carousel_slide_size";
  DROP TYPE "public"."enum__works_v_blocks_carousel_theme";
  DROP TYPE "public"."enum__works_v_blocks_feature_tabs_tabs_visual_type";
  DROP TYPE "public"."enum__works_v_blocks_feature_tabs_tabs_shader_origin";
  DROP TYPE "public"."enum__works_v_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum__works_v_blocks_feature_tabs_theme";
  DROP TYPE "public"."enum___works_v_insight_list_v_layout";
  DROP TYPE "public"."enum___works_v_insight_list_v_mark_size";
  DROP TYPE "public"."enum___works_v_insight_list_v_theme";
  DROP TYPE "public"."enum___works_v_section_v_theme";
  DROP TYPE "public"."enum___works_v_section_v_spacing";
  DROP TYPE "public"."enum___works_v_section_v_stack";`)
}
