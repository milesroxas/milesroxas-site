--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO postgres;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO postgres;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO postgres;

--
-- Name: pgsodium; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA pgsodium;


ALTER SCHEMA pgsodium OWNER TO postgres;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO postgres;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO postgres;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO postgres;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO postgres;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO postgres;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO postgres;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_archive_populate_by; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_archive_populate_by AS ENUM (
    'collection',
    'selection'
);


ALTER TYPE public.enum__pages_v_blocks_archive_populate_by OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_archive_relation_to; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_archive_relation_to AS ENUM (
    'posts',
    'works'
);


ALTER TYPE public.enum__pages_v_blocks_archive_relation_to OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_content_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_content_type AS ENUM (
    'text',
    'sectionHeading',
    'archive',
    'media',
    'slider'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_content_type OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_media_aspect_ratio; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_media_aspect_ratio AS ENUM (
    'square',
    'landscape',
    'portrait'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_media_aspect_ratio OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_section_heading_align; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_section_heading_align AS ENUM (
    'left',
    'center'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_section_heading_align OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_section_heading_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_section_heading_size AS ENUM (
    'base',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_section_heading_size OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_section_heading_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_section_heading_style AS ENUM (
    'default',
    'border',
    'jumbo'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_section_heading_style OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_size AS ENUM (
    'oneThird',
    'half',
    'twoThirds',
    'full'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_size OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_slider_intro_content_align; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_slider_intro_content_align AS ENUM (
    'left',
    'center'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_slider_intro_content_align OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_slider_intro_content_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_slider_intro_content_size AS ENUM (
    'base',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_slider_intro_content_size OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_slider_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_slider_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_slider_space_mb OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_slider_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_slider_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_slider_space_mt OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_slider_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_slider_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_slider_space_pb OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_slider_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_slider_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_slider_space_pt OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_slider_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_slider_style AS ENUM (
    'default',
    'cropped',
    'single'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_slider_style OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_text_link_appearance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_text_link_appearance AS ENUM (
    'default',
    'outline'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_text_link_appearance OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_columns_text_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_columns_text_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum__pages_v_blocks_content_columns_text_link_type OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_content_space_mb OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_content_space_mt OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_content_space_pb OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_content_space_pt OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_content_theme; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_content_theme AS ENUM (
    'light',
    'dark'
);


ALTER TYPE public.enum__pages_v_blocks_content_theme OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_cta_links_link_appearance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_cta_links_link_appearance AS ENUM (
    'default',
    'outline'
);


ALTER TYPE public.enum__pages_v_blocks_cta_links_link_appearance OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_cta_links_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_cta_links_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum__pages_v_blocks_cta_links_link_type OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_media_block_caption_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_media_block_caption_size AS ENUM (
    'normal',
    'large',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_media_block_caption_size OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_slider_intro_content_align; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_slider_intro_content_align AS ENUM (
    'left',
    'center'
);


ALTER TYPE public.enum__pages_v_blocks_slider_intro_content_align OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_slider_intro_content_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_slider_intro_content_size AS ENUM (
    'base',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_slider_intro_content_size OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_slider_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_slider_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_slider_space_mb OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_slider_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_slider_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_slider_space_mt OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_slider_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_slider_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_slider_space_pb OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_slider_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_slider_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__pages_v_blocks_slider_space_pt OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_slider_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_slider_style AS ENUM (
    'default',
    'cropped',
    'single'
);


ALTER TYPE public.enum__pages_v_blocks_slider_style OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_works_populate_by; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_works_populate_by AS ENUM (
    'collection',
    'selection'
);


ALTER TYPE public.enum__pages_v_blocks_works_populate_by OWNER TO postgres;

--
-- Name: enum__pages_v_blocks_works_relation_to; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_blocks_works_relation_to AS ENUM (
    'works'
);


ALTER TYPE public.enum__pages_v_blocks_works_relation_to OWNER TO postgres;

--
-- Name: enum__pages_v_version_hero_links_link_appearance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_version_hero_links_link_appearance AS ENUM (
    'default',
    'outline'
);


ALTER TYPE public.enum__pages_v_version_hero_links_link_appearance OWNER TO postgres;

--
-- Name: enum__pages_v_version_hero_links_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_version_hero_links_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum__pages_v_version_hero_links_link_type OWNER TO postgres;

--
-- Name: enum__pages_v_version_hero_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_version_hero_type AS ENUM (
    'none',
    'highImpact',
    'mediumImpact',
    'lowImpact'
);


ALTER TYPE public.enum__pages_v_version_hero_type OWNER TO postgres;

--
-- Name: enum__pages_v_version_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__pages_v_version_status AS ENUM (
    'draft',
    'published'
);


ALTER TYPE public.enum__pages_v_version_status OWNER TO postgres;

--
-- Name: enum__posts_v_version_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__posts_v_version_status AS ENUM (
    'draft',
    'published'
);


ALTER TYPE public.enum__posts_v_version_status OWNER TO postgres;

--
-- Name: enum__works_v_blocks_archive_populate_by; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_archive_populate_by AS ENUM (
    'collection',
    'selection'
);


ALTER TYPE public.enum__works_v_blocks_archive_populate_by OWNER TO postgres;

--
-- Name: enum__works_v_blocks_archive_relation_to; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_archive_relation_to AS ENUM (
    'posts',
    'works'
);


ALTER TYPE public.enum__works_v_blocks_archive_relation_to OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_content_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_content_type AS ENUM (
    'text',
    'sectionHeading',
    'archive',
    'media',
    'slider'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_content_type OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_media_aspect_ratio; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_media_aspect_ratio AS ENUM (
    'square',
    'landscape',
    'portrait'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_media_aspect_ratio OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_section_heading_align; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_section_heading_align AS ENUM (
    'left',
    'center'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_section_heading_align OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_section_heading_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_section_heading_size AS ENUM (
    'base',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_section_heading_size OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_section_heading_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_section_heading_style AS ENUM (
    'default',
    'border',
    'jumbo'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_section_heading_style OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_size AS ENUM (
    'oneThird',
    'half',
    'twoThirds',
    'full'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_size OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_slider_intro_content_align; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_slider_intro_content_align AS ENUM (
    'left',
    'center'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_slider_intro_content_align OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_slider_intro_content_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_slider_intro_content_size AS ENUM (
    'base',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_slider_intro_content_size OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_slider_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_slider_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_slider_space_mb OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_slider_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_slider_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_slider_space_mt OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_slider_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_slider_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_slider_space_pb OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_slider_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_slider_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_slider_space_pt OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_slider_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_slider_style AS ENUM (
    'default',
    'cropped',
    'single'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_slider_style OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_text_link_appearance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_text_link_appearance AS ENUM (
    'default',
    'outline'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_text_link_appearance OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_columns_text_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_columns_text_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum__works_v_blocks_content_columns_text_link_type OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_content_space_mb OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_content_space_mt OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_content_space_pb OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_content_space_pt OWNER TO postgres;

--
-- Name: enum__works_v_blocks_content_theme; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_content_theme AS ENUM (
    'light',
    'dark'
);


ALTER TYPE public.enum__works_v_blocks_content_theme OWNER TO postgres;

--
-- Name: enum__works_v_blocks_cta_links_link_appearance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_cta_links_link_appearance AS ENUM (
    'default',
    'outline'
);


ALTER TYPE public.enum__works_v_blocks_cta_links_link_appearance OWNER TO postgres;

--
-- Name: enum__works_v_blocks_cta_links_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_cta_links_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum__works_v_blocks_cta_links_link_type OWNER TO postgres;

--
-- Name: enum__works_v_blocks_media_block_caption_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_media_block_caption_size AS ENUM (
    'normal',
    'large',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_media_block_caption_size OWNER TO postgres;

--
-- Name: enum__works_v_blocks_slider_intro_content_align; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_slider_intro_content_align AS ENUM (
    'left',
    'center'
);


ALTER TYPE public.enum__works_v_blocks_slider_intro_content_align OWNER TO postgres;

--
-- Name: enum__works_v_blocks_slider_intro_content_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_slider_intro_content_size AS ENUM (
    'base',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_slider_intro_content_size OWNER TO postgres;

--
-- Name: enum__works_v_blocks_slider_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_slider_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_slider_space_mb OWNER TO postgres;

--
-- Name: enum__works_v_blocks_slider_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_slider_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_slider_space_mt OWNER TO postgres;

--
-- Name: enum__works_v_blocks_slider_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_slider_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_slider_space_pb OWNER TO postgres;

--
-- Name: enum__works_v_blocks_slider_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_slider_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_slider_space_pt OWNER TO postgres;

--
-- Name: enum__works_v_blocks_slider_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_slider_style AS ENUM (
    'default',
    'cropped',
    'single'
);


ALTER TYPE public.enum__works_v_blocks_slider_style OWNER TO postgres;

--
-- Name: enum__works_v_blocks_tabs_heading_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_tabs_heading_style AS ENUM (
    'default',
    'center'
);


ALTER TYPE public.enum__works_v_blocks_tabs_heading_style OWNER TO postgres;

--
-- Name: enum__works_v_blocks_tabs_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_tabs_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_tabs_space_mb OWNER TO postgres;

--
-- Name: enum__works_v_blocks_tabs_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_tabs_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_tabs_space_mt OWNER TO postgres;

--
-- Name: enum__works_v_blocks_tabs_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_tabs_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_tabs_space_pb OWNER TO postgres;

--
-- Name: enum__works_v_blocks_tabs_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_tabs_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum__works_v_blocks_tabs_space_pt OWNER TO postgres;

--
-- Name: enum__works_v_blocks_tabs_tabs_content_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_tabs_tabs_content_type AS ENUM (
    'richText',
    'slider'
);


ALTER TYPE public.enum__works_v_blocks_tabs_tabs_content_type OWNER TO postgres;

--
-- Name: enum__works_v_blocks_tabs_tabs_slider_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_tabs_tabs_slider_style AS ENUM (
    'default',
    'cropped',
    'single'
);


ALTER TYPE public.enum__works_v_blocks_tabs_tabs_slider_style OWNER TO postgres;

--
-- Name: enum__works_v_blocks_works_populate_by; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_works_populate_by AS ENUM (
    'collection',
    'selection'
);


ALTER TYPE public.enum__works_v_blocks_works_populate_by OWNER TO postgres;

--
-- Name: enum__works_v_blocks_works_relation_to; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_blocks_works_relation_to AS ENUM (
    'works'
);


ALTER TYPE public.enum__works_v_blocks_works_relation_to OWNER TO postgres;

--
-- Name: enum__works_v_version_hero_links_link_appearance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_version_hero_links_link_appearance AS ENUM (
    'default',
    'outline'
);


ALTER TYPE public.enum__works_v_version_hero_links_link_appearance OWNER TO postgres;

--
-- Name: enum__works_v_version_hero_links_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_version_hero_links_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum__works_v_version_hero_links_link_type OWNER TO postgres;

--
-- Name: enum__works_v_version_hero_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_version_hero_type AS ENUM (
    'none',
    'highImpact',
    'mediumImpact',
    'lowImpact'
);


ALTER TYPE public.enum__works_v_version_hero_type OWNER TO postgres;

--
-- Name: enum__works_v_version_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum__works_v_version_status AS ENUM (
    'draft',
    'published'
);


ALTER TYPE public.enum__works_v_version_status OWNER TO postgres;

--
-- Name: enum_footer_nav_items_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_footer_nav_items_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum_footer_nav_items_link_type OWNER TO postgres;

--
-- Name: enum_forms_confirmation_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_forms_confirmation_type AS ENUM (
    'message',
    'redirect'
);


ALTER TYPE public.enum_forms_confirmation_type OWNER TO postgres;

--
-- Name: enum_header_nav_items_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_header_nav_items_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum_header_nav_items_link_type OWNER TO postgres;

--
-- Name: enum_pages_blocks_archive_populate_by; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_archive_populate_by AS ENUM (
    'collection',
    'selection'
);


ALTER TYPE public.enum_pages_blocks_archive_populate_by OWNER TO postgres;

--
-- Name: enum_pages_blocks_archive_relation_to; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_archive_relation_to AS ENUM (
    'posts',
    'works'
);


ALTER TYPE public.enum_pages_blocks_archive_relation_to OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_content_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_content_type AS ENUM (
    'text',
    'sectionHeading',
    'archive',
    'media',
    'slider'
);


ALTER TYPE public.enum_pages_blocks_content_columns_content_type OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_media_aspect_ratio; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_media_aspect_ratio AS ENUM (
    'square',
    'landscape',
    'portrait'
);


ALTER TYPE public.enum_pages_blocks_content_columns_media_aspect_ratio OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_section_heading_align; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_section_heading_align AS ENUM (
    'left',
    'center'
);


ALTER TYPE public.enum_pages_blocks_content_columns_section_heading_align OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_section_heading_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_section_heading_size AS ENUM (
    'base',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_content_columns_section_heading_size OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_section_heading_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_section_heading_style AS ENUM (
    'default',
    'border',
    'jumbo'
);


ALTER TYPE public.enum_pages_blocks_content_columns_section_heading_style OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_size AS ENUM (
    'oneThird',
    'half',
    'twoThirds',
    'full'
);


ALTER TYPE public.enum_pages_blocks_content_columns_size OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_slider_intro_content_align; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_slider_intro_content_align AS ENUM (
    'left',
    'center'
);


ALTER TYPE public.enum_pages_blocks_content_columns_slider_intro_content_align OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_slider_intro_content_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_slider_intro_content_size AS ENUM (
    'base',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_content_columns_slider_intro_content_size OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_slider_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_slider_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_content_columns_slider_space_mb OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_slider_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_slider_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_content_columns_slider_space_mt OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_slider_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_slider_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_content_columns_slider_space_pb OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_slider_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_slider_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_content_columns_slider_space_pt OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_slider_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_slider_style AS ENUM (
    'default',
    'cropped',
    'single'
);


ALTER TYPE public.enum_pages_blocks_content_columns_slider_style OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_text_link_appearance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_text_link_appearance AS ENUM (
    'default',
    'outline'
);


ALTER TYPE public.enum_pages_blocks_content_columns_text_link_appearance OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_columns_text_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_columns_text_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum_pages_blocks_content_columns_text_link_type OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_content_space_mb OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_content_space_mt OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_content_space_pb OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_content_space_pt OWNER TO postgres;

--
-- Name: enum_pages_blocks_content_theme; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_content_theme AS ENUM (
    'light',
    'dark'
);


ALTER TYPE public.enum_pages_blocks_content_theme OWNER TO postgres;

--
-- Name: enum_pages_blocks_cta_links_link_appearance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_cta_links_link_appearance AS ENUM (
    'default',
    'outline'
);


ALTER TYPE public.enum_pages_blocks_cta_links_link_appearance OWNER TO postgres;

--
-- Name: enum_pages_blocks_cta_links_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_cta_links_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum_pages_blocks_cta_links_link_type OWNER TO postgres;

--
-- Name: enum_pages_blocks_media_block_caption_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_media_block_caption_size AS ENUM (
    'normal',
    'large',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_media_block_caption_size OWNER TO postgres;

--
-- Name: enum_pages_blocks_slider_intro_content_align; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_slider_intro_content_align AS ENUM (
    'left',
    'center'
);


ALTER TYPE public.enum_pages_blocks_slider_intro_content_align OWNER TO postgres;

--
-- Name: enum_pages_blocks_slider_intro_content_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_slider_intro_content_size AS ENUM (
    'base',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_slider_intro_content_size OWNER TO postgres;

--
-- Name: enum_pages_blocks_slider_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_slider_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_slider_space_mb OWNER TO postgres;

--
-- Name: enum_pages_blocks_slider_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_slider_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_slider_space_mt OWNER TO postgres;

--
-- Name: enum_pages_blocks_slider_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_slider_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_slider_space_pb OWNER TO postgres;

--
-- Name: enum_pages_blocks_slider_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_slider_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_pages_blocks_slider_space_pt OWNER TO postgres;

--
-- Name: enum_pages_blocks_slider_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_slider_style AS ENUM (
    'default',
    'cropped',
    'single'
);


ALTER TYPE public.enum_pages_blocks_slider_style OWNER TO postgres;

--
-- Name: enum_pages_blocks_works_populate_by; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_works_populate_by AS ENUM (
    'collection',
    'selection'
);


ALTER TYPE public.enum_pages_blocks_works_populate_by OWNER TO postgres;

--
-- Name: enum_pages_blocks_works_relation_to; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_blocks_works_relation_to AS ENUM (
    'works'
);


ALTER TYPE public.enum_pages_blocks_works_relation_to OWNER TO postgres;

--
-- Name: enum_pages_hero_links_link_appearance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_hero_links_link_appearance AS ENUM (
    'default',
    'outline'
);


ALTER TYPE public.enum_pages_hero_links_link_appearance OWNER TO postgres;

--
-- Name: enum_pages_hero_links_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_hero_links_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum_pages_hero_links_link_type OWNER TO postgres;

--
-- Name: enum_pages_hero_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_hero_type AS ENUM (
    'none',
    'highImpact',
    'mediumImpact',
    'lowImpact'
);


ALTER TYPE public.enum_pages_hero_type OWNER TO postgres;

--
-- Name: enum_pages_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_pages_status AS ENUM (
    'draft',
    'published'
);


ALTER TYPE public.enum_pages_status OWNER TO postgres;

--
-- Name: enum_payload_jobs_log_state; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_payload_jobs_log_state AS ENUM (
    'failed',
    'succeeded'
);


ALTER TYPE public.enum_payload_jobs_log_state OWNER TO postgres;

--
-- Name: enum_payload_jobs_log_task_slug; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_payload_jobs_log_task_slug AS ENUM (
    'inline',
    'schedulePublish'
);


ALTER TYPE public.enum_payload_jobs_log_task_slug OWNER TO postgres;

--
-- Name: enum_payload_jobs_task_slug; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_payload_jobs_task_slug AS ENUM (
    'inline',
    'schedulePublish'
);


ALTER TYPE public.enum_payload_jobs_task_slug OWNER TO postgres;

--
-- Name: enum_posts_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_posts_status AS ENUM (
    'draft',
    'published'
);


ALTER TYPE public.enum_posts_status OWNER TO postgres;

--
-- Name: enum_redirects_to_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_redirects_to_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum_redirects_to_type OWNER TO postgres;

--
-- Name: enum_works_blocks_archive_populate_by; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_archive_populate_by AS ENUM (
    'collection',
    'selection'
);


ALTER TYPE public.enum_works_blocks_archive_populate_by OWNER TO postgres;

--
-- Name: enum_works_blocks_archive_relation_to; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_archive_relation_to AS ENUM (
    'posts',
    'works'
);


ALTER TYPE public.enum_works_blocks_archive_relation_to OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_content_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_content_type AS ENUM (
    'text',
    'sectionHeading',
    'archive',
    'media',
    'slider'
);


ALTER TYPE public.enum_works_blocks_content_columns_content_type OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_media_aspect_ratio; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_media_aspect_ratio AS ENUM (
    'square',
    'landscape',
    'portrait'
);


ALTER TYPE public.enum_works_blocks_content_columns_media_aspect_ratio OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_section_heading_align; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_section_heading_align AS ENUM (
    'left',
    'center'
);


ALTER TYPE public.enum_works_blocks_content_columns_section_heading_align OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_section_heading_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_section_heading_size AS ENUM (
    'base',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_content_columns_section_heading_size OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_section_heading_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_section_heading_style AS ENUM (
    'default',
    'border',
    'jumbo'
);


ALTER TYPE public.enum_works_blocks_content_columns_section_heading_style OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_size AS ENUM (
    'oneThird',
    'half',
    'twoThirds',
    'full'
);


ALTER TYPE public.enum_works_blocks_content_columns_size OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_slider_intro_content_align; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_slider_intro_content_align AS ENUM (
    'left',
    'center'
);


ALTER TYPE public.enum_works_blocks_content_columns_slider_intro_content_align OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_slider_intro_content_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_slider_intro_content_size AS ENUM (
    'base',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_content_columns_slider_intro_content_size OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_slider_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_slider_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_content_columns_slider_space_mb OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_slider_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_slider_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_content_columns_slider_space_mt OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_slider_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_slider_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_content_columns_slider_space_pb OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_slider_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_slider_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_content_columns_slider_space_pt OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_slider_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_slider_style AS ENUM (
    'default',
    'cropped',
    'single'
);


ALTER TYPE public.enum_works_blocks_content_columns_slider_style OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_text_link_appearance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_text_link_appearance AS ENUM (
    'default',
    'outline'
);


ALTER TYPE public.enum_works_blocks_content_columns_text_link_appearance OWNER TO postgres;

--
-- Name: enum_works_blocks_content_columns_text_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_columns_text_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum_works_blocks_content_columns_text_link_type OWNER TO postgres;

--
-- Name: enum_works_blocks_content_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_content_space_mb OWNER TO postgres;

--
-- Name: enum_works_blocks_content_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_content_space_mt OWNER TO postgres;

--
-- Name: enum_works_blocks_content_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_content_space_pb OWNER TO postgres;

--
-- Name: enum_works_blocks_content_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_content_space_pt OWNER TO postgres;

--
-- Name: enum_works_blocks_content_theme; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_content_theme AS ENUM (
    'light',
    'dark'
);


ALTER TYPE public.enum_works_blocks_content_theme OWNER TO postgres;

--
-- Name: enum_works_blocks_cta_links_link_appearance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_cta_links_link_appearance AS ENUM (
    'default',
    'outline'
);


ALTER TYPE public.enum_works_blocks_cta_links_link_appearance OWNER TO postgres;

--
-- Name: enum_works_blocks_cta_links_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_cta_links_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum_works_blocks_cta_links_link_type OWNER TO postgres;

--
-- Name: enum_works_blocks_media_block_caption_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_media_block_caption_size AS ENUM (
    'normal',
    'large',
    'xl'
);


ALTER TYPE public.enum_works_blocks_media_block_caption_size OWNER TO postgres;

--
-- Name: enum_works_blocks_slider_intro_content_align; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_slider_intro_content_align AS ENUM (
    'left',
    'center'
);


ALTER TYPE public.enum_works_blocks_slider_intro_content_align OWNER TO postgres;

--
-- Name: enum_works_blocks_slider_intro_content_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_slider_intro_content_size AS ENUM (
    'base',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_slider_intro_content_size OWNER TO postgres;

--
-- Name: enum_works_blocks_slider_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_slider_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_slider_space_mb OWNER TO postgres;

--
-- Name: enum_works_blocks_slider_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_slider_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_slider_space_mt OWNER TO postgres;

--
-- Name: enum_works_blocks_slider_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_slider_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_slider_space_pb OWNER TO postgres;

--
-- Name: enum_works_blocks_slider_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_slider_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_slider_space_pt OWNER TO postgres;

--
-- Name: enum_works_blocks_slider_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_slider_style AS ENUM (
    'default',
    'cropped',
    'single'
);


ALTER TYPE public.enum_works_blocks_slider_style OWNER TO postgres;

--
-- Name: enum_works_blocks_tabs_heading_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_tabs_heading_style AS ENUM (
    'default',
    'center'
);


ALTER TYPE public.enum_works_blocks_tabs_heading_style OWNER TO postgres;

--
-- Name: enum_works_blocks_tabs_space_mb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_tabs_space_mb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_tabs_space_mb OWNER TO postgres;

--
-- Name: enum_works_blocks_tabs_space_mt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_tabs_space_mt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_tabs_space_mt OWNER TO postgres;

--
-- Name: enum_works_blocks_tabs_space_pb; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_tabs_space_pb AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_tabs_space_pb OWNER TO postgres;

--
-- Name: enum_works_blocks_tabs_space_pt; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_tabs_space_pt AS ENUM (
    'none',
    'sm',
    'md',
    'lg',
    'xl'
);


ALTER TYPE public.enum_works_blocks_tabs_space_pt OWNER TO postgres;

--
-- Name: enum_works_blocks_tabs_tabs_content_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_tabs_tabs_content_type AS ENUM (
    'richText',
    'slider'
);


ALTER TYPE public.enum_works_blocks_tabs_tabs_content_type OWNER TO postgres;

--
-- Name: enum_works_blocks_tabs_tabs_slider_style; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_tabs_tabs_slider_style AS ENUM (
    'default',
    'cropped',
    'single'
);


ALTER TYPE public.enum_works_blocks_tabs_tabs_slider_style OWNER TO postgres;

--
-- Name: enum_works_blocks_works_populate_by; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_works_populate_by AS ENUM (
    'collection',
    'selection'
);


ALTER TYPE public.enum_works_blocks_works_populate_by OWNER TO postgres;

--
-- Name: enum_works_blocks_works_relation_to; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_blocks_works_relation_to AS ENUM (
    'works'
);


ALTER TYPE public.enum_works_blocks_works_relation_to OWNER TO postgres;

--
-- Name: enum_works_hero_links_link_appearance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_hero_links_link_appearance AS ENUM (
    'default',
    'outline'
);


ALTER TYPE public.enum_works_hero_links_link_appearance OWNER TO postgres;

--
-- Name: enum_works_hero_links_link_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_hero_links_link_type AS ENUM (
    'reference',
    'custom'
);


ALTER TYPE public.enum_works_hero_links_link_type OWNER TO postgres;

--
-- Name: enum_works_hero_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_hero_type AS ENUM (
    'none',
    'highImpact',
    'mediumImpact',
    'lowImpact'
);


ALTER TYPE public.enum_works_hero_type OWNER TO postgres;

--
-- Name: enum_works_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_works_status AS ENUM (
    'draft',
    'published'
);


ALTER TYPE public.enum_works_status OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: postgres
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO postgres;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: postgres
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO postgres;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: postgres
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO postgres;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: postgres
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO postgres;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: postgres
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO postgres;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: postgres
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO postgres;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: postgres
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO postgres;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: postgres
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO postgres;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: postgres
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO postgres;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO postgres;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: postgres
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO postgres;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: postgres
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO postgres;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: postgres
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO postgres;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO postgres;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO postgres;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: postgres
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: postgres
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RAISE WARNING 'PgBouncer auth request: %', p_usename;

    RETURN QUERY
    SELECT usename::TEXT, passwd::TEXT FROM pg_catalog.pg_shadow
    WHERE usename = p_usename;
END;
$$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: postgres
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO postgres;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: postgres
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO postgres;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: postgres
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO postgres;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: postgres
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO postgres;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: postgres
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO postgres;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: postgres
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO postgres;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: postgres
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO postgres;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: postgres
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO postgres;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: postgres
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO postgres;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: postgres
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO postgres;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: postgres
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO postgres;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: postgres
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO postgres;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO postgres;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO postgres;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO postgres;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO postgres;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO postgres;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO postgres;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO postgres;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO postgres;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO postgres;

--
-- Name: secrets_encrypt_secret_secret(); Type: FUNCTION; Schema: vault; Owner: postgres
--

CREATE FUNCTION vault.secrets_encrypt_secret_secret() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
		BEGIN
		        new.secret = CASE WHEN new.secret IS NULL THEN NULL ELSE
			CASE WHEN new.key_id IS NULL THEN NULL ELSE pg_catalog.encode(
			  pgsodium.crypto_aead_det_encrypt(
				pg_catalog.convert_to(new.secret, 'utf8'),
				pg_catalog.convert_to((new.id::text || new.description::text || new.created_at::text || new.updated_at::text)::text, 'utf8'),
				new.key_id::uuid,
				new.nonce
			  ),
				'base64') END END;
		RETURN new;
		END;
		$$;


ALTER FUNCTION vault.secrets_encrypt_secret_secret() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO postgres;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO postgres;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO postgres;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO postgres;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO postgres;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO postgres;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO postgres;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO postgres;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.refresh_tokens_id_seq OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: postgres
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO postgres;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO postgres;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO postgres;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO postgres;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO postgres;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO postgres;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO postgres;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: _pages_v; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v (
    id integer NOT NULL,
    parent_id integer,
    version_title character varying,
    version_hero_type public.enum__pages_v_version_hero_type DEFAULT 'lowImpact'::public.enum__pages_v_version_hero_type,
    version_hero_rich_text jsonb,
    version_hero_media_id integer,
    version_meta_title character varying,
    version_meta_image_id integer,
    version_meta_description character varying,
    version_published_at timestamp(3) with time zone,
    version_slug character varying,
    version_slug_lock boolean DEFAULT true,
    version_updated_at timestamp(3) with time zone,
    version_created_at timestamp(3) with time zone,
    version__status public.enum__pages_v_version_status DEFAULT 'draft'::public.enum__pages_v_version_status,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    latest boolean,
    autosave boolean
);


ALTER TABLE public._pages_v OWNER TO postgres;

--
-- Name: _pages_v_blocks_archive; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_blocks_archive (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    intro_content jsonb,
    populate_by public.enum__pages_v_blocks_archive_populate_by DEFAULT 'collection'::public.enum__pages_v_blocks_archive_populate_by,
    relation_to public.enum__pages_v_blocks_archive_relation_to DEFAULT 'posts'::public.enum__pages_v_blocks_archive_relation_to,
    "limit" numeric DEFAULT 10,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._pages_v_blocks_archive OWNER TO postgres;

--
-- Name: _pages_v_blocks_archive_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_blocks_archive_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_blocks_archive_id_seq OWNER TO postgres;

--
-- Name: _pages_v_blocks_archive_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_blocks_archive_id_seq OWNED BY public._pages_v_blocks_archive.id;


--
-- Name: _pages_v_blocks_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_blocks_content (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    theme public.enum__pages_v_blocks_content_theme DEFAULT 'light'::public.enum__pages_v_blocks_content_theme,
    space_pt public.enum__pages_v_blocks_content_space_pt DEFAULT 'md'::public.enum__pages_v_blocks_content_space_pt,
    space_pb public.enum__pages_v_blocks_content_space_pb DEFAULT 'md'::public.enum__pages_v_blocks_content_space_pb,
    space_mt public.enum__pages_v_blocks_content_space_mt DEFAULT 'md'::public.enum__pages_v_blocks_content_space_mt,
    space_mb public.enum__pages_v_blocks_content_space_mb DEFAULT 'md'::public.enum__pages_v_blocks_content_space_mb,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._pages_v_blocks_content OWNER TO postgres;

--
-- Name: _pages_v_blocks_content_columns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_blocks_content_columns (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    size public.enum__pages_v_blocks_content_columns_size DEFAULT 'oneThird'::public.enum__pages_v_blocks_content_columns_size,
    content_type public.enum__pages_v_blocks_content_columns_content_type DEFAULT 'text'::public.enum__pages_v_blocks_content_columns_content_type,
    text_rich_text jsonb,
    text_enable_link boolean,
    text_link_type public.enum__pages_v_blocks_content_columns_text_link_type DEFAULT 'reference'::public.enum__pages_v_blocks_content_columns_text_link_type,
    text_link_new_tab boolean,
    text_link_url character varying,
    text_link_label character varying,
    text_link_appearance public.enum__pages_v_blocks_content_columns_text_link_appearance DEFAULT 'default'::public.enum__pages_v_blocks_content_columns_text_link_appearance,
    section_heading_heading character varying,
    section_heading_subheading character varying,
    section_heading_size public.enum__pages_v_blocks_content_columns_section_heading_size DEFAULT 'base'::public.enum__pages_v_blocks_content_columns_section_heading_size,
    section_heading_align public.enum__pages_v_blocks_content_columns_section_heading_align DEFAULT 'left'::public.enum__pages_v_blocks_content_columns_section_heading_align,
    section_heading_style public.enum__pages_v_blocks_content_columns_section_heading_style DEFAULT 'default'::public.enum__pages_v_blocks_content_columns_section_heading_style,
    slider_intro_content_heading character varying,
    slider_intro_content_subheading character varying,
    slider_intro_content_size public.enum__pages_v_blocks_content_columns_slider_intro_content_size DEFAULT 'base'::public.enum__pages_v_blocks_content_columns_slider_intro_content_size,
    slider_intro_content_align public.enum__pages_v_blocks_content_columns_slider_intro_content_align DEFAULT 'left'::public.enum__pages_v_blocks_content_columns_slider_intro_content_align,
    slider_style public.enum__pages_v_blocks_content_columns_slider_style DEFAULT 'default'::public.enum__pages_v_blocks_content_columns_slider_style,
    slider_space_pt public.enum__pages_v_blocks_content_columns_slider_space_pt DEFAULT 'md'::public.enum__pages_v_blocks_content_columns_slider_space_pt,
    slider_space_pb public.enum__pages_v_blocks_content_columns_slider_space_pb DEFAULT 'md'::public.enum__pages_v_blocks_content_columns_slider_space_pb,
    slider_space_mt public.enum__pages_v_blocks_content_columns_slider_space_mt DEFAULT 'md'::public.enum__pages_v_blocks_content_columns_slider_space_mt,
    slider_space_mb public.enum__pages_v_blocks_content_columns_slider_space_mb DEFAULT 'md'::public.enum__pages_v_blocks_content_columns_slider_space_mb,
    media_media_id integer,
    media_aspect_ratio public.enum__pages_v_blocks_content_columns_media_aspect_ratio DEFAULT 'landscape'::public.enum__pages_v_blocks_content_columns_media_aspect_ratio,
    _uuid character varying
);


ALTER TABLE public._pages_v_blocks_content_columns OWNER TO postgres;

--
-- Name: _pages_v_blocks_content_columns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_blocks_content_columns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_blocks_content_columns_id_seq OWNER TO postgres;

--
-- Name: _pages_v_blocks_content_columns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_blocks_content_columns_id_seq OWNED BY public._pages_v_blocks_content_columns.id;


--
-- Name: _pages_v_blocks_content_columns_slider_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_blocks_content_columns_slider_slides (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    slide_image_id integer,
    slide_caption character varying,
    _uuid character varying
);


ALTER TABLE public._pages_v_blocks_content_columns_slider_slides OWNER TO postgres;

--
-- Name: _pages_v_blocks_content_columns_slider_slides_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_blocks_content_columns_slider_slides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_blocks_content_columns_slider_slides_id_seq OWNER TO postgres;

--
-- Name: _pages_v_blocks_content_columns_slider_slides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_blocks_content_columns_slider_slides_id_seq OWNED BY public._pages_v_blocks_content_columns_slider_slides.id;


--
-- Name: _pages_v_blocks_content_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_blocks_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_blocks_content_id_seq OWNER TO postgres;

--
-- Name: _pages_v_blocks_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_blocks_content_id_seq OWNED BY public._pages_v_blocks_content.id;


--
-- Name: _pages_v_blocks_cta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_blocks_cta (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    rich_text jsonb,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._pages_v_blocks_cta OWNER TO postgres;

--
-- Name: _pages_v_blocks_cta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_blocks_cta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_blocks_cta_id_seq OWNER TO postgres;

--
-- Name: _pages_v_blocks_cta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_blocks_cta_id_seq OWNED BY public._pages_v_blocks_cta.id;


--
-- Name: _pages_v_blocks_cta_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_blocks_cta_links (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    link_type public.enum__pages_v_blocks_cta_links_link_type DEFAULT 'reference'::public.enum__pages_v_blocks_cta_links_link_type,
    link_new_tab boolean,
    link_url character varying,
    link_label character varying,
    link_appearance public.enum__pages_v_blocks_cta_links_link_appearance DEFAULT 'default'::public.enum__pages_v_blocks_cta_links_link_appearance,
    _uuid character varying
);


ALTER TABLE public._pages_v_blocks_cta_links OWNER TO postgres;

--
-- Name: _pages_v_blocks_cta_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_blocks_cta_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_blocks_cta_links_id_seq OWNER TO postgres;

--
-- Name: _pages_v_blocks_cta_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_blocks_cta_links_id_seq OWNED BY public._pages_v_blocks_cta_links.id;


--
-- Name: _pages_v_blocks_form_block; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_blocks_form_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    form_id integer,
    enable_intro boolean,
    intro_content jsonb,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._pages_v_blocks_form_block OWNER TO postgres;

--
-- Name: _pages_v_blocks_form_block_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_blocks_form_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_blocks_form_block_id_seq OWNER TO postgres;

--
-- Name: _pages_v_blocks_form_block_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_blocks_form_block_id_seq OWNED BY public._pages_v_blocks_form_block.id;


--
-- Name: _pages_v_blocks_media_block; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_blocks_media_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    media_id integer,
    caption_size public.enum__pages_v_blocks_media_block_caption_size DEFAULT 'normal'::public.enum__pages_v_blocks_media_block_caption_size,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._pages_v_blocks_media_block OWNER TO postgres;

--
-- Name: _pages_v_blocks_media_block_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_blocks_media_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_blocks_media_block_id_seq OWNER TO postgres;

--
-- Name: _pages_v_blocks_media_block_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_blocks_media_block_id_seq OWNED BY public._pages_v_blocks_media_block.id;


--
-- Name: _pages_v_blocks_slider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_blocks_slider (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    intro_content_heading character varying,
    intro_content_subheading character varying,
    intro_content_size public.enum__pages_v_blocks_slider_intro_content_size DEFAULT 'base'::public.enum__pages_v_blocks_slider_intro_content_size,
    intro_content_align public.enum__pages_v_blocks_slider_intro_content_align DEFAULT 'left'::public.enum__pages_v_blocks_slider_intro_content_align,
    style public.enum__pages_v_blocks_slider_style DEFAULT 'default'::public.enum__pages_v_blocks_slider_style,
    space_pt public.enum__pages_v_blocks_slider_space_pt DEFAULT 'md'::public.enum__pages_v_blocks_slider_space_pt,
    space_pb public.enum__pages_v_blocks_slider_space_pb DEFAULT 'md'::public.enum__pages_v_blocks_slider_space_pb,
    space_mt public.enum__pages_v_blocks_slider_space_mt DEFAULT 'md'::public.enum__pages_v_blocks_slider_space_mt,
    space_mb public.enum__pages_v_blocks_slider_space_mb DEFAULT 'md'::public.enum__pages_v_blocks_slider_space_mb,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._pages_v_blocks_slider OWNER TO postgres;

--
-- Name: _pages_v_blocks_slider_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_blocks_slider_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_blocks_slider_id_seq OWNER TO postgres;

--
-- Name: _pages_v_blocks_slider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_blocks_slider_id_seq OWNED BY public._pages_v_blocks_slider.id;


--
-- Name: _pages_v_blocks_slider_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_blocks_slider_slides (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    slide_image_id integer,
    slide_caption character varying,
    _uuid character varying
);


ALTER TABLE public._pages_v_blocks_slider_slides OWNER TO postgres;

--
-- Name: _pages_v_blocks_slider_slides_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_blocks_slider_slides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_blocks_slider_slides_id_seq OWNER TO postgres;

--
-- Name: _pages_v_blocks_slider_slides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_blocks_slider_slides_id_seq OWNED BY public._pages_v_blocks_slider_slides.id;


--
-- Name: _pages_v_blocks_works; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_blocks_works (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    intro_content jsonb,
    populate_by public.enum__pages_v_blocks_works_populate_by DEFAULT 'collection'::public.enum__pages_v_blocks_works_populate_by,
    relation_to public.enum__pages_v_blocks_works_relation_to DEFAULT 'works'::public.enum__pages_v_blocks_works_relation_to,
    "limit" numeric DEFAULT 4,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._pages_v_blocks_works OWNER TO postgres;

--
-- Name: _pages_v_blocks_works_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_blocks_works_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_blocks_works_id_seq OWNER TO postgres;

--
-- Name: _pages_v_blocks_works_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_blocks_works_id_seq OWNED BY public._pages_v_blocks_works.id;


--
-- Name: _pages_v_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_id_seq OWNER TO postgres;

--
-- Name: _pages_v_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_id_seq OWNED BY public._pages_v.id;


--
-- Name: _pages_v_rels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    pages_id integer,
    posts_id integer,
    works_id integer,
    categories_id integer
);


ALTER TABLE public._pages_v_rels OWNER TO postgres;

--
-- Name: _pages_v_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_rels_id_seq OWNER TO postgres;

--
-- Name: _pages_v_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_rels_id_seq OWNED BY public._pages_v_rels.id;


--
-- Name: _pages_v_version_hero_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._pages_v_version_hero_links (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    link_type public.enum__pages_v_version_hero_links_link_type DEFAULT 'reference'::public.enum__pages_v_version_hero_links_link_type,
    link_new_tab boolean,
    link_url character varying,
    link_label character varying,
    link_appearance public.enum__pages_v_version_hero_links_link_appearance DEFAULT 'default'::public.enum__pages_v_version_hero_links_link_appearance,
    _uuid character varying
);


ALTER TABLE public._pages_v_version_hero_links OWNER TO postgres;

--
-- Name: _pages_v_version_hero_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._pages_v_version_hero_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._pages_v_version_hero_links_id_seq OWNER TO postgres;

--
-- Name: _pages_v_version_hero_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._pages_v_version_hero_links_id_seq OWNED BY public._pages_v_version_hero_links.id;


--
-- Name: _posts_v; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._posts_v (
    id integer NOT NULL,
    parent_id integer,
    version_title character varying,
    version_hero_image_id integer,
    version_content jsonb,
    version_meta_title character varying,
    version_meta_image_id integer,
    version_meta_description character varying,
    version_published_at timestamp(3) with time zone,
    version_slug character varying,
    version_slug_lock boolean DEFAULT true,
    version_updated_at timestamp(3) with time zone,
    version_created_at timestamp(3) with time zone,
    version__status public.enum__posts_v_version_status DEFAULT 'draft'::public.enum__posts_v_version_status,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    latest boolean,
    autosave boolean
);


ALTER TABLE public._posts_v OWNER TO postgres;

--
-- Name: _posts_v_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._posts_v_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._posts_v_id_seq OWNER TO postgres;

--
-- Name: _posts_v_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._posts_v_id_seq OWNED BY public._posts_v.id;


--
-- Name: _posts_v_rels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._posts_v_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    posts_id integer,
    categories_id integer,
    users_id integer
);


ALTER TABLE public._posts_v_rels OWNER TO postgres;

--
-- Name: _posts_v_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._posts_v_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._posts_v_rels_id_seq OWNER TO postgres;

--
-- Name: _posts_v_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._posts_v_rels_id_seq OWNED BY public._posts_v_rels.id;


--
-- Name: _posts_v_version_populated_authors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._posts_v_version_populated_authors (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    _uuid character varying,
    name character varying
);


ALTER TABLE public._posts_v_version_populated_authors OWNER TO postgres;

--
-- Name: _posts_v_version_populated_authors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._posts_v_version_populated_authors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._posts_v_version_populated_authors_id_seq OWNER TO postgres;

--
-- Name: _posts_v_version_populated_authors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._posts_v_version_populated_authors_id_seq OWNED BY public._posts_v_version_populated_authors.id;


--
-- Name: _works_v; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v (
    id integer NOT NULL,
    parent_id integer,
    version_title character varying,
    version_hero_type public.enum__works_v_version_hero_type DEFAULT 'lowImpact'::public.enum__works_v_version_hero_type,
    version_hero_rich_text jsonb,
    version_hero_media_id integer,
    version_meta_title character varying,
    version_meta_image_id integer,
    version_meta_description character varying,
    version_published_at timestamp(3) with time zone,
    version_slug character varying,
    version_slug_lock boolean DEFAULT true,
    version_updated_at timestamp(3) with time zone,
    version_created_at timestamp(3) with time zone,
    version__status public.enum__works_v_version_status DEFAULT 'draft'::public.enum__works_v_version_status,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    latest boolean,
    autosave boolean
);


ALTER TABLE public._works_v OWNER TO postgres;

--
-- Name: _works_v_blocks_archive; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_archive (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    intro_content jsonb,
    populate_by public.enum__works_v_blocks_archive_populate_by DEFAULT 'collection'::public.enum__works_v_blocks_archive_populate_by,
    relation_to public.enum__works_v_blocks_archive_relation_to DEFAULT 'posts'::public.enum__works_v_blocks_archive_relation_to,
    "limit" numeric DEFAULT 10,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._works_v_blocks_archive OWNER TO postgres;

--
-- Name: _works_v_blocks_archive_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_archive_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_archive_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_archive_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_archive_id_seq OWNED BY public._works_v_blocks_archive.id;


--
-- Name: _works_v_blocks_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_content (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    theme public.enum__works_v_blocks_content_theme DEFAULT 'light'::public.enum__works_v_blocks_content_theme,
    space_pt public.enum__works_v_blocks_content_space_pt DEFAULT 'md'::public.enum__works_v_blocks_content_space_pt,
    space_pb public.enum__works_v_blocks_content_space_pb DEFAULT 'md'::public.enum__works_v_blocks_content_space_pb,
    space_mt public.enum__works_v_blocks_content_space_mt DEFAULT 'md'::public.enum__works_v_blocks_content_space_mt,
    space_mb public.enum__works_v_blocks_content_space_mb DEFAULT 'md'::public.enum__works_v_blocks_content_space_mb,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._works_v_blocks_content OWNER TO postgres;

--
-- Name: _works_v_blocks_content_columns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_content_columns (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    size public.enum__works_v_blocks_content_columns_size DEFAULT 'oneThird'::public.enum__works_v_blocks_content_columns_size,
    content_type public.enum__works_v_blocks_content_columns_content_type DEFAULT 'text'::public.enum__works_v_blocks_content_columns_content_type,
    text_rich_text jsonb,
    text_enable_link boolean,
    text_link_type public.enum__works_v_blocks_content_columns_text_link_type DEFAULT 'reference'::public.enum__works_v_blocks_content_columns_text_link_type,
    text_link_new_tab boolean,
    text_link_url character varying,
    text_link_label character varying,
    text_link_appearance public.enum__works_v_blocks_content_columns_text_link_appearance DEFAULT 'default'::public.enum__works_v_blocks_content_columns_text_link_appearance,
    section_heading_heading character varying,
    section_heading_subheading character varying,
    section_heading_size public.enum__works_v_blocks_content_columns_section_heading_size DEFAULT 'base'::public.enum__works_v_blocks_content_columns_section_heading_size,
    section_heading_align public.enum__works_v_blocks_content_columns_section_heading_align DEFAULT 'left'::public.enum__works_v_blocks_content_columns_section_heading_align,
    section_heading_style public.enum__works_v_blocks_content_columns_section_heading_style DEFAULT 'default'::public.enum__works_v_blocks_content_columns_section_heading_style,
    slider_intro_content_heading character varying,
    slider_intro_content_subheading character varying,
    slider_intro_content_size public.enum__works_v_blocks_content_columns_slider_intro_content_size DEFAULT 'base'::public.enum__works_v_blocks_content_columns_slider_intro_content_size,
    slider_intro_content_align public.enum__works_v_blocks_content_columns_slider_intro_content_align DEFAULT 'left'::public.enum__works_v_blocks_content_columns_slider_intro_content_align,
    slider_style public.enum__works_v_blocks_content_columns_slider_style DEFAULT 'default'::public.enum__works_v_blocks_content_columns_slider_style,
    slider_space_pt public.enum__works_v_blocks_content_columns_slider_space_pt DEFAULT 'md'::public.enum__works_v_blocks_content_columns_slider_space_pt,
    slider_space_pb public.enum__works_v_blocks_content_columns_slider_space_pb DEFAULT 'md'::public.enum__works_v_blocks_content_columns_slider_space_pb,
    slider_space_mt public.enum__works_v_blocks_content_columns_slider_space_mt DEFAULT 'md'::public.enum__works_v_blocks_content_columns_slider_space_mt,
    slider_space_mb public.enum__works_v_blocks_content_columns_slider_space_mb DEFAULT 'md'::public.enum__works_v_blocks_content_columns_slider_space_mb,
    media_media_id integer,
    media_aspect_ratio public.enum__works_v_blocks_content_columns_media_aspect_ratio DEFAULT 'landscape'::public.enum__works_v_blocks_content_columns_media_aspect_ratio,
    _uuid character varying
);


ALTER TABLE public._works_v_blocks_content_columns OWNER TO postgres;

--
-- Name: _works_v_blocks_content_columns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_content_columns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_content_columns_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_content_columns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_content_columns_id_seq OWNED BY public._works_v_blocks_content_columns.id;


--
-- Name: _works_v_blocks_content_columns_slider_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_content_columns_slider_slides (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    slide_image_id integer,
    slide_caption character varying,
    _uuid character varying
);


ALTER TABLE public._works_v_blocks_content_columns_slider_slides OWNER TO postgres;

--
-- Name: _works_v_blocks_content_columns_slider_slides_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_content_columns_slider_slides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_content_columns_slider_slides_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_content_columns_slider_slides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_content_columns_slider_slides_id_seq OWNED BY public._works_v_blocks_content_columns_slider_slides.id;


--
-- Name: _works_v_blocks_content_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_content_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_content_id_seq OWNED BY public._works_v_blocks_content.id;


--
-- Name: _works_v_blocks_cta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_cta (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    rich_text jsonb,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._works_v_blocks_cta OWNER TO postgres;

--
-- Name: _works_v_blocks_cta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_cta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_cta_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_cta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_cta_id_seq OWNED BY public._works_v_blocks_cta.id;


--
-- Name: _works_v_blocks_cta_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_cta_links (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    link_type public.enum__works_v_blocks_cta_links_link_type DEFAULT 'reference'::public.enum__works_v_blocks_cta_links_link_type,
    link_new_tab boolean,
    link_url character varying,
    link_label character varying,
    link_appearance public.enum__works_v_blocks_cta_links_link_appearance DEFAULT 'default'::public.enum__works_v_blocks_cta_links_link_appearance,
    _uuid character varying
);


ALTER TABLE public._works_v_blocks_cta_links OWNER TO postgres;

--
-- Name: _works_v_blocks_cta_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_cta_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_cta_links_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_cta_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_cta_links_id_seq OWNED BY public._works_v_blocks_cta_links.id;


--
-- Name: _works_v_blocks_form_block; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_form_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    form_id integer,
    enable_intro boolean,
    intro_content jsonb,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._works_v_blocks_form_block OWNER TO postgres;

--
-- Name: _works_v_blocks_form_block_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_form_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_form_block_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_form_block_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_form_block_id_seq OWNED BY public._works_v_blocks_form_block.id;


--
-- Name: _works_v_blocks_media_block; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_media_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    media_id integer,
    caption_size public.enum__works_v_blocks_media_block_caption_size DEFAULT 'normal'::public.enum__works_v_blocks_media_block_caption_size,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._works_v_blocks_media_block OWNER TO postgres;

--
-- Name: _works_v_blocks_media_block_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_media_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_media_block_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_media_block_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_media_block_id_seq OWNED BY public._works_v_blocks_media_block.id;


--
-- Name: _works_v_blocks_slider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_slider (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    intro_content_heading character varying,
    intro_content_subheading character varying,
    intro_content_size public.enum__works_v_blocks_slider_intro_content_size DEFAULT 'base'::public.enum__works_v_blocks_slider_intro_content_size,
    intro_content_align public.enum__works_v_blocks_slider_intro_content_align DEFAULT 'left'::public.enum__works_v_blocks_slider_intro_content_align,
    style public.enum__works_v_blocks_slider_style DEFAULT 'default'::public.enum__works_v_blocks_slider_style,
    space_pt public.enum__works_v_blocks_slider_space_pt DEFAULT 'md'::public.enum__works_v_blocks_slider_space_pt,
    space_pb public.enum__works_v_blocks_slider_space_pb DEFAULT 'md'::public.enum__works_v_blocks_slider_space_pb,
    space_mt public.enum__works_v_blocks_slider_space_mt DEFAULT 'md'::public.enum__works_v_blocks_slider_space_mt,
    space_mb public.enum__works_v_blocks_slider_space_mb DEFAULT 'md'::public.enum__works_v_blocks_slider_space_mb,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._works_v_blocks_slider OWNER TO postgres;

--
-- Name: _works_v_blocks_slider_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_slider_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_slider_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_slider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_slider_id_seq OWNED BY public._works_v_blocks_slider.id;


--
-- Name: _works_v_blocks_slider_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_slider_slides (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    slide_image_id integer,
    slide_caption character varying,
    _uuid character varying
);


ALTER TABLE public._works_v_blocks_slider_slides OWNER TO postgres;

--
-- Name: _works_v_blocks_slider_slides_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_slider_slides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_slider_slides_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_slider_slides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_slider_slides_id_seq OWNED BY public._works_v_blocks_slider_slides.id;


--
-- Name: _works_v_blocks_tabs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_tabs (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    heading_style public.enum__works_v_blocks_tabs_heading_style DEFAULT 'default'::public.enum__works_v_blocks_tabs_heading_style,
    heading_eyebrow character varying,
    heading_heading character varying,
    heading_subheading character varying,
    space_pt public.enum__works_v_blocks_tabs_space_pt DEFAULT 'md'::public.enum__works_v_blocks_tabs_space_pt,
    space_pb public.enum__works_v_blocks_tabs_space_pb DEFAULT 'md'::public.enum__works_v_blocks_tabs_space_pb,
    space_mt public.enum__works_v_blocks_tabs_space_mt DEFAULT 'md'::public.enum__works_v_blocks_tabs_space_mt,
    space_mb public.enum__works_v_blocks_tabs_space_mb DEFAULT 'md'::public.enum__works_v_blocks_tabs_space_mb,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._works_v_blocks_tabs OWNER TO postgres;

--
-- Name: _works_v_blocks_tabs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_tabs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_tabs_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_tabs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_tabs_id_seq OWNED BY public._works_v_blocks_tabs.id;


--
-- Name: _works_v_blocks_tabs_tabs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_tabs_tabs (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    tab_title character varying,
    content_type public.enum__works_v_blocks_tabs_tabs_content_type DEFAULT 'richText'::public.enum__works_v_blocks_tabs_tabs_content_type,
    rich_text jsonb,
    slider_style public.enum__works_v_blocks_tabs_tabs_slider_style DEFAULT 'default'::public.enum__works_v_blocks_tabs_tabs_slider_style,
    _uuid character varying
);


ALTER TABLE public._works_v_blocks_tabs_tabs OWNER TO postgres;

--
-- Name: _works_v_blocks_tabs_tabs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_tabs_tabs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_tabs_tabs_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_tabs_tabs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_tabs_tabs_id_seq OWNED BY public._works_v_blocks_tabs_tabs.id;


--
-- Name: _works_v_blocks_tabs_tabs_slider_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_tabs_tabs_slider_slides (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    slide_image_id integer,
    slide_caption character varying,
    _uuid character varying
);


ALTER TABLE public._works_v_blocks_tabs_tabs_slider_slides OWNER TO postgres;

--
-- Name: _works_v_blocks_tabs_tabs_slider_slides_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_tabs_tabs_slider_slides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_tabs_tabs_slider_slides_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_tabs_tabs_slider_slides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_tabs_tabs_slider_slides_id_seq OWNED BY public._works_v_blocks_tabs_tabs_slider_slides.id;


--
-- Name: _works_v_blocks_works; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_blocks_works (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    intro_content jsonb,
    populate_by public.enum__works_v_blocks_works_populate_by DEFAULT 'collection'::public.enum__works_v_blocks_works_populate_by,
    relation_to public.enum__works_v_blocks_works_relation_to DEFAULT 'works'::public.enum__works_v_blocks_works_relation_to,
    "limit" numeric DEFAULT 4,
    _uuid character varying,
    block_name character varying
);


ALTER TABLE public._works_v_blocks_works OWNER TO postgres;

--
-- Name: _works_v_blocks_works_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_blocks_works_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_blocks_works_id_seq OWNER TO postgres;

--
-- Name: _works_v_blocks_works_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_blocks_works_id_seq OWNED BY public._works_v_blocks_works.id;


--
-- Name: _works_v_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_id_seq OWNER TO postgres;

--
-- Name: _works_v_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_id_seq OWNED BY public._works_v.id;


--
-- Name: _works_v_rels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    pages_id integer,
    posts_id integer,
    works_id integer,
    categories_id integer
);


ALTER TABLE public._works_v_rels OWNER TO postgres;

--
-- Name: _works_v_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_rels_id_seq OWNER TO postgres;

--
-- Name: _works_v_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_rels_id_seq OWNED BY public._works_v_rels.id;


--
-- Name: _works_v_version_hero_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._works_v_version_hero_links (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    link_type public.enum__works_v_version_hero_links_link_type DEFAULT 'reference'::public.enum__works_v_version_hero_links_link_type,
    link_new_tab boolean,
    link_url character varying,
    link_label character varying,
    link_appearance public.enum__works_v_version_hero_links_link_appearance DEFAULT 'default'::public.enum__works_v_version_hero_links_link_appearance,
    _uuid character varying
);


ALTER TABLE public._works_v_version_hero_links OWNER TO postgres;

--
-- Name: _works_v_version_hero_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._works_v_version_hero_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._works_v_version_hero_links_id_seq OWNER TO postgres;

--
-- Name: _works_v_version_hero_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._works_v_version_hero_links_id_seq OWNED BY public._works_v_version_hero_links.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    title character varying NOT NULL,
    slug character varying,
    slug_lock boolean DEFAULT true,
    parent_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_breadcrumbs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories_breadcrumbs (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    doc_id integer,
    url character varying,
    label character varying
);


ALTER TABLE public.categories_breadcrumbs OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: footer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.footer (
    id integer NOT NULL,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


ALTER TABLE public.footer OWNER TO postgres;

--
-- Name: footer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.footer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.footer_id_seq OWNER TO postgres;

--
-- Name: footer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.footer_id_seq OWNED BY public.footer.id;


--
-- Name: footer_nav_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.footer_nav_items (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    link_type public.enum_footer_nav_items_link_type DEFAULT 'reference'::public.enum_footer_nav_items_link_type,
    link_new_tab boolean,
    link_url character varying,
    link_label character varying NOT NULL
);


ALTER TABLE public.footer_nav_items OWNER TO postgres;

--
-- Name: footer_rels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.footer_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    pages_id integer,
    posts_id integer
);


ALTER TABLE public.footer_rels OWNER TO postgres;

--
-- Name: footer_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.footer_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.footer_rels_id_seq OWNER TO postgres;

--
-- Name: footer_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.footer_rels_id_seq OWNED BY public.footer_rels.id;


--
-- Name: form_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_submissions (
    id integer NOT NULL,
    form_id integer NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.form_submissions OWNER TO postgres;

--
-- Name: form_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.form_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.form_submissions_id_seq OWNER TO postgres;

--
-- Name: form_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.form_submissions_id_seq OWNED BY public.form_submissions.id;


--
-- Name: form_submissions_submission_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_submissions_submission_data (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    field character varying NOT NULL,
    value character varying NOT NULL
);


ALTER TABLE public.form_submissions_submission_data OWNER TO postgres;

--
-- Name: forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms (
    id integer NOT NULL,
    title character varying NOT NULL,
    submit_button_label character varying,
    confirmation_type public.enum_forms_confirmation_type DEFAULT 'message'::public.enum_forms_confirmation_type,
    confirmation_message jsonb,
    redirect_url character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.forms OWNER TO postgres;

--
-- Name: forms_blocks_checkbox; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms_blocks_checkbox (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    name character varying NOT NULL,
    label character varying,
    width numeric,
    required boolean,
    default_value boolean,
    block_name character varying
);


ALTER TABLE public.forms_blocks_checkbox OWNER TO postgres;

--
-- Name: forms_blocks_country; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms_blocks_country (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    name character varying NOT NULL,
    label character varying,
    width numeric,
    required boolean,
    block_name character varying
);


ALTER TABLE public.forms_blocks_country OWNER TO postgres;

--
-- Name: forms_blocks_email; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms_blocks_email (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    name character varying NOT NULL,
    label character varying,
    width numeric,
    required boolean,
    block_name character varying
);


ALTER TABLE public.forms_blocks_email OWNER TO postgres;

--
-- Name: forms_blocks_message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms_blocks_message (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    message jsonb,
    block_name character varying
);


ALTER TABLE public.forms_blocks_message OWNER TO postgres;

--
-- Name: forms_blocks_number; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms_blocks_number (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    name character varying NOT NULL,
    label character varying,
    width numeric,
    default_value numeric,
    required boolean,
    block_name character varying
);


ALTER TABLE public.forms_blocks_number OWNER TO postgres;

--
-- Name: forms_blocks_select; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms_blocks_select (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    name character varying NOT NULL,
    label character varying,
    width numeric,
    default_value character varying,
    placeholder character varying,
    required boolean,
    block_name character varying
);


ALTER TABLE public.forms_blocks_select OWNER TO postgres;

--
-- Name: forms_blocks_select_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms_blocks_select_options (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    label character varying NOT NULL,
    value character varying NOT NULL
);


ALTER TABLE public.forms_blocks_select_options OWNER TO postgres;

--
-- Name: forms_blocks_state; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms_blocks_state (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    name character varying NOT NULL,
    label character varying,
    width numeric,
    required boolean,
    block_name character varying
);


ALTER TABLE public.forms_blocks_state OWNER TO postgres;

--
-- Name: forms_blocks_text; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms_blocks_text (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    name character varying NOT NULL,
    label character varying,
    width numeric,
    default_value character varying,
    required boolean,
    block_name character varying
);


ALTER TABLE public.forms_blocks_text OWNER TO postgres;

--
-- Name: forms_blocks_textarea; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms_blocks_textarea (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    name character varying NOT NULL,
    label character varying,
    width numeric,
    default_value character varying,
    required boolean,
    block_name character varying
);


ALTER TABLE public.forms_blocks_textarea OWNER TO postgres;

--
-- Name: forms_emails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms_emails (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    email_to character varying,
    cc character varying,
    bcc character varying,
    reply_to character varying,
    email_from character varying,
    subject character varying DEFAULT 'You''''ve received a new message.'::character varying NOT NULL,
    message jsonb
);


ALTER TABLE public.forms_emails OWNER TO postgres;

--
-- Name: forms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.forms_id_seq OWNER TO postgres;

--
-- Name: forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.forms_id_seq OWNED BY public.forms.id;


--
-- Name: header; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.header (
    id integer NOT NULL,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


ALTER TABLE public.header OWNER TO postgres;

--
-- Name: header_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.header_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.header_id_seq OWNER TO postgres;

--
-- Name: header_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.header_id_seq OWNED BY public.header.id;


--
-- Name: header_nav_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.header_nav_items (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    link_type public.enum_header_nav_items_link_type DEFAULT 'reference'::public.enum_header_nav_items_link_type,
    link_new_tab boolean,
    link_url character varying,
    link_label character varying NOT NULL
);


ALTER TABLE public.header_nav_items OWNER TO postgres;

--
-- Name: header_rels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.header_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    pages_id integer,
    posts_id integer
);


ALTER TABLE public.header_rels OWNER TO postgres;

--
-- Name: header_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.header_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.header_rels_id_seq OWNER TO postgres;

--
-- Name: header_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.header_rels_id_seq OWNED BY public.header_rels.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    id integer NOT NULL,
    alt character varying,
    caption jsonb,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    url character varying,
    thumbnail_u_r_l character varying,
    filename character varying,
    mime_type character varying,
    filesize numeric,
    width numeric,
    height numeric,
    focal_x numeric,
    focal_y numeric,
    sizes_thumbnail_url character varying,
    sizes_thumbnail_width numeric,
    sizes_thumbnail_height numeric,
    sizes_thumbnail_mime_type character varying,
    sizes_thumbnail_filesize numeric,
    sizes_thumbnail_filename character varying,
    sizes_square_url character varying,
    sizes_square_width numeric,
    sizes_square_height numeric,
    sizes_square_mime_type character varying,
    sizes_square_filesize numeric,
    sizes_square_filename character varying,
    sizes_small_url character varying,
    sizes_small_width numeric,
    sizes_small_height numeric,
    sizes_small_mime_type character varying,
    sizes_small_filesize numeric,
    sizes_small_filename character varying,
    sizes_medium_url character varying,
    sizes_medium_width numeric,
    sizes_medium_height numeric,
    sizes_medium_mime_type character varying,
    sizes_medium_filesize numeric,
    sizes_medium_filename character varying,
    sizes_large_url character varying,
    sizes_large_width numeric,
    sizes_large_height numeric,
    sizes_large_mime_type character varying,
    sizes_large_filesize numeric,
    sizes_large_filename character varying,
    sizes_xlarge_url character varying,
    sizes_xlarge_width numeric,
    sizes_xlarge_height numeric,
    sizes_xlarge_mime_type character varying,
    sizes_xlarge_filesize numeric,
    sizes_xlarge_filename character varying,
    sizes_og_url character varying,
    sizes_og_width numeric,
    sizes_og_height numeric,
    sizes_og_mime_type character varying,
    sizes_og_filesize numeric,
    sizes_og_filename character varying
);


ALTER TABLE public.media OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.media_id_seq OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages (
    id integer NOT NULL,
    title character varying,
    hero_type public.enum_pages_hero_type DEFAULT 'lowImpact'::public.enum_pages_hero_type,
    hero_rich_text jsonb,
    hero_media_id integer,
    meta_title character varying,
    meta_image_id integer,
    meta_description character varying,
    published_at timestamp(3) with time zone,
    slug character varying,
    slug_lock boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    _status public.enum_pages_status DEFAULT 'draft'::public.enum_pages_status
);


ALTER TABLE public.pages OWNER TO postgres;

--
-- Name: pages_blocks_archive; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_blocks_archive (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    intro_content jsonb,
    populate_by public.enum_pages_blocks_archive_populate_by DEFAULT 'collection'::public.enum_pages_blocks_archive_populate_by,
    relation_to public.enum_pages_blocks_archive_relation_to DEFAULT 'posts'::public.enum_pages_blocks_archive_relation_to,
    "limit" numeric DEFAULT 10,
    block_name character varying
);


ALTER TABLE public.pages_blocks_archive OWNER TO postgres;

--
-- Name: pages_blocks_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_blocks_content (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    theme public.enum_pages_blocks_content_theme DEFAULT 'light'::public.enum_pages_blocks_content_theme,
    space_pt public.enum_pages_blocks_content_space_pt DEFAULT 'md'::public.enum_pages_blocks_content_space_pt,
    space_pb public.enum_pages_blocks_content_space_pb DEFAULT 'md'::public.enum_pages_blocks_content_space_pb,
    space_mt public.enum_pages_blocks_content_space_mt DEFAULT 'md'::public.enum_pages_blocks_content_space_mt,
    space_mb public.enum_pages_blocks_content_space_mb DEFAULT 'md'::public.enum_pages_blocks_content_space_mb,
    block_name character varying
);


ALTER TABLE public.pages_blocks_content OWNER TO postgres;

--
-- Name: pages_blocks_content_columns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_blocks_content_columns (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    size public.enum_pages_blocks_content_columns_size DEFAULT 'oneThird'::public.enum_pages_blocks_content_columns_size,
    content_type public.enum_pages_blocks_content_columns_content_type DEFAULT 'text'::public.enum_pages_blocks_content_columns_content_type,
    text_rich_text jsonb,
    text_enable_link boolean,
    text_link_type public.enum_pages_blocks_content_columns_text_link_type DEFAULT 'reference'::public.enum_pages_blocks_content_columns_text_link_type,
    text_link_new_tab boolean,
    text_link_url character varying,
    text_link_label character varying,
    text_link_appearance public.enum_pages_blocks_content_columns_text_link_appearance DEFAULT 'default'::public.enum_pages_blocks_content_columns_text_link_appearance,
    section_heading_heading character varying,
    section_heading_subheading character varying,
    section_heading_size public.enum_pages_blocks_content_columns_section_heading_size DEFAULT 'base'::public.enum_pages_blocks_content_columns_section_heading_size,
    section_heading_align public.enum_pages_blocks_content_columns_section_heading_align DEFAULT 'left'::public.enum_pages_blocks_content_columns_section_heading_align,
    section_heading_style public.enum_pages_blocks_content_columns_section_heading_style DEFAULT 'default'::public.enum_pages_blocks_content_columns_section_heading_style,
    slider_intro_content_heading character varying,
    slider_intro_content_subheading character varying,
    slider_intro_content_size public.enum_pages_blocks_content_columns_slider_intro_content_size DEFAULT 'base'::public.enum_pages_blocks_content_columns_slider_intro_content_size,
    slider_intro_content_align public.enum_pages_blocks_content_columns_slider_intro_content_align DEFAULT 'left'::public.enum_pages_blocks_content_columns_slider_intro_content_align,
    slider_style public.enum_pages_blocks_content_columns_slider_style DEFAULT 'default'::public.enum_pages_blocks_content_columns_slider_style,
    slider_space_pt public.enum_pages_blocks_content_columns_slider_space_pt DEFAULT 'md'::public.enum_pages_blocks_content_columns_slider_space_pt,
    slider_space_pb public.enum_pages_blocks_content_columns_slider_space_pb DEFAULT 'md'::public.enum_pages_blocks_content_columns_slider_space_pb,
    slider_space_mt public.enum_pages_blocks_content_columns_slider_space_mt DEFAULT 'md'::public.enum_pages_blocks_content_columns_slider_space_mt,
    slider_space_mb public.enum_pages_blocks_content_columns_slider_space_mb DEFAULT 'md'::public.enum_pages_blocks_content_columns_slider_space_mb,
    media_media_id integer,
    media_aspect_ratio public.enum_pages_blocks_content_columns_media_aspect_ratio DEFAULT 'landscape'::public.enum_pages_blocks_content_columns_media_aspect_ratio
);


ALTER TABLE public.pages_blocks_content_columns OWNER TO postgres;

--
-- Name: pages_blocks_content_columns_slider_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_blocks_content_columns_slider_slides (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    slide_image_id integer,
    slide_caption character varying
);


ALTER TABLE public.pages_blocks_content_columns_slider_slides OWNER TO postgres;

--
-- Name: pages_blocks_cta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_blocks_cta (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    rich_text jsonb,
    block_name character varying
);


ALTER TABLE public.pages_blocks_cta OWNER TO postgres;

--
-- Name: pages_blocks_cta_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_blocks_cta_links (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    link_type public.enum_pages_blocks_cta_links_link_type DEFAULT 'reference'::public.enum_pages_blocks_cta_links_link_type,
    link_new_tab boolean,
    link_url character varying,
    link_label character varying,
    link_appearance public.enum_pages_blocks_cta_links_link_appearance DEFAULT 'default'::public.enum_pages_blocks_cta_links_link_appearance
);


ALTER TABLE public.pages_blocks_cta_links OWNER TO postgres;

--
-- Name: pages_blocks_form_block; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_blocks_form_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    form_id integer,
    enable_intro boolean,
    intro_content jsonb,
    block_name character varying
);


ALTER TABLE public.pages_blocks_form_block OWNER TO postgres;

--
-- Name: pages_blocks_media_block; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_blocks_media_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    media_id integer,
    caption_size public.enum_pages_blocks_media_block_caption_size DEFAULT 'normal'::public.enum_pages_blocks_media_block_caption_size,
    block_name character varying
);


ALTER TABLE public.pages_blocks_media_block OWNER TO postgres;

--
-- Name: pages_blocks_slider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_blocks_slider (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    intro_content_heading character varying,
    intro_content_subheading character varying,
    intro_content_size public.enum_pages_blocks_slider_intro_content_size DEFAULT 'base'::public.enum_pages_blocks_slider_intro_content_size,
    intro_content_align public.enum_pages_blocks_slider_intro_content_align DEFAULT 'left'::public.enum_pages_blocks_slider_intro_content_align,
    style public.enum_pages_blocks_slider_style DEFAULT 'default'::public.enum_pages_blocks_slider_style,
    space_pt public.enum_pages_blocks_slider_space_pt DEFAULT 'md'::public.enum_pages_blocks_slider_space_pt,
    space_pb public.enum_pages_blocks_slider_space_pb DEFAULT 'md'::public.enum_pages_blocks_slider_space_pb,
    space_mt public.enum_pages_blocks_slider_space_mt DEFAULT 'md'::public.enum_pages_blocks_slider_space_mt,
    space_mb public.enum_pages_blocks_slider_space_mb DEFAULT 'md'::public.enum_pages_blocks_slider_space_mb,
    block_name character varying
);


ALTER TABLE public.pages_blocks_slider OWNER TO postgres;

--
-- Name: pages_blocks_slider_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_blocks_slider_slides (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    slide_image_id integer,
    slide_caption character varying
);


ALTER TABLE public.pages_blocks_slider_slides OWNER TO postgres;

--
-- Name: pages_blocks_works; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_blocks_works (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    intro_content jsonb,
    populate_by public.enum_pages_blocks_works_populate_by DEFAULT 'collection'::public.enum_pages_blocks_works_populate_by,
    relation_to public.enum_pages_blocks_works_relation_to DEFAULT 'works'::public.enum_pages_blocks_works_relation_to,
    "limit" numeric DEFAULT 4,
    block_name character varying
);


ALTER TABLE public.pages_blocks_works OWNER TO postgres;

--
-- Name: pages_hero_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_hero_links (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    link_type public.enum_pages_hero_links_link_type DEFAULT 'reference'::public.enum_pages_hero_links_link_type,
    link_new_tab boolean,
    link_url character varying,
    link_label character varying,
    link_appearance public.enum_pages_hero_links_link_appearance DEFAULT 'default'::public.enum_pages_hero_links_link_appearance
);


ALTER TABLE public.pages_hero_links OWNER TO postgres;

--
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pages_id_seq OWNER TO postgres;

--
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pages_id_seq OWNED BY public.pages.id;


--
-- Name: pages_rels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    pages_id integer,
    posts_id integer,
    works_id integer,
    categories_id integer
);


ALTER TABLE public.pages_rels OWNER TO postgres;

--
-- Name: pages_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pages_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pages_rels_id_seq OWNER TO postgres;

--
-- Name: pages_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pages_rels_id_seq OWNED BY public.pages_rels.id;


--
-- Name: payload_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payload_jobs (
    id integer NOT NULL,
    input jsonb,
    completed_at timestamp(3) with time zone,
    total_tried numeric DEFAULT 0,
    has_error boolean DEFAULT false,
    error jsonb,
    task_slug public.enum_payload_jobs_task_slug,
    queue character varying DEFAULT 'default'::character varying,
    wait_until timestamp(3) with time zone,
    processing boolean DEFAULT false,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payload_jobs OWNER TO postgres;

--
-- Name: payload_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payload_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payload_jobs_id_seq OWNER TO postgres;

--
-- Name: payload_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payload_jobs_id_seq OWNED BY public.payload_jobs.id;


--
-- Name: payload_jobs_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payload_jobs_log (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    executed_at timestamp(3) with time zone NOT NULL,
    completed_at timestamp(3) with time zone NOT NULL,
    task_slug public.enum_payload_jobs_log_task_slug NOT NULL,
    task_i_d character varying NOT NULL,
    input jsonb,
    output jsonb,
    state public.enum_payload_jobs_log_state NOT NULL,
    error jsonb
);


ALTER TABLE public.payload_jobs_log OWNER TO postgres;

--
-- Name: payload_locked_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payload_locked_documents (
    id integer NOT NULL,
    global_slug character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payload_locked_documents OWNER TO postgres;

--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payload_locked_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payload_locked_documents_id_seq OWNER TO postgres;

--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payload_locked_documents_id_seq OWNED BY public.payload_locked_documents.id;


--
-- Name: payload_locked_documents_rels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payload_locked_documents_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    pages_id integer,
    posts_id integer,
    works_id integer,
    media_id integer,
    categories_id integer,
    users_id integer,
    redirects_id integer,
    forms_id integer,
    form_submissions_id integer,
    search_id integer,
    payload_jobs_id integer
);


ALTER TABLE public.payload_locked_documents_rels OWNER TO postgres;

--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payload_locked_documents_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payload_locked_documents_rels_id_seq OWNER TO postgres;

--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payload_locked_documents_rels_id_seq OWNED BY public.payload_locked_documents_rels.id;


--
-- Name: payload_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payload_migrations (
    id integer NOT NULL,
    name character varying,
    batch numeric,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payload_migrations OWNER TO postgres;

--
-- Name: payload_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payload_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payload_migrations_id_seq OWNER TO postgres;

--
-- Name: payload_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payload_migrations_id_seq OWNED BY public.payload_migrations.id;


--
-- Name: payload_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payload_preferences (
    id integer NOT NULL,
    key character varying,
    value jsonb,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payload_preferences OWNER TO postgres;

--
-- Name: payload_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payload_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payload_preferences_id_seq OWNER TO postgres;

--
-- Name: payload_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payload_preferences_id_seq OWNED BY public.payload_preferences.id;


--
-- Name: payload_preferences_rels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payload_preferences_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    users_id integer
);


ALTER TABLE public.payload_preferences_rels OWNER TO postgres;

--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payload_preferences_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payload_preferences_rels_id_seq OWNER TO postgres;

--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payload_preferences_rels_id_seq OWNED BY public.payload_preferences_rels.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    title character varying,
    hero_image_id integer,
    content jsonb,
    meta_title character varying,
    meta_image_id integer,
    meta_description character varying,
    published_at timestamp(3) with time zone,
    slug character varying,
    slug_lock boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    _status public.enum_posts_status DEFAULT 'draft'::public.enum_posts_status
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.posts_id_seq OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: posts_populated_authors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts_populated_authors (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    name character varying
);


ALTER TABLE public.posts_populated_authors OWNER TO postgres;

--
-- Name: posts_rels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    posts_id integer,
    categories_id integer,
    users_id integer
);


ALTER TABLE public.posts_rels OWNER TO postgres;

--
-- Name: posts_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.posts_rels_id_seq OWNER TO postgres;

--
-- Name: posts_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_rels_id_seq OWNED BY public.posts_rels.id;


--
-- Name: redirects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.redirects (
    id integer NOT NULL,
    "from" character varying NOT NULL,
    to_type public.enum_redirects_to_type DEFAULT 'reference'::public.enum_redirects_to_type,
    to_url character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.redirects OWNER TO postgres;

--
-- Name: redirects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.redirects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.redirects_id_seq OWNER TO postgres;

--
-- Name: redirects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.redirects_id_seq OWNED BY public.redirects.id;


--
-- Name: redirects_rels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.redirects_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    pages_id integer,
    posts_id integer
);


ALTER TABLE public.redirects_rels OWNER TO postgres;

--
-- Name: redirects_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.redirects_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.redirects_rels_id_seq OWNER TO postgres;

--
-- Name: redirects_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.redirects_rels_id_seq OWNED BY public.redirects_rels.id;


--
-- Name: search; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.search (
    id integer NOT NULL,
    title character varying,
    priority numeric,
    slug character varying,
    meta_title character varying,
    meta_description character varying,
    meta_image_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.search OWNER TO postgres;

--
-- Name: search_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.search_categories (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    relation_to character varying,
    title character varying
);


ALTER TABLE public.search_categories OWNER TO postgres;

--
-- Name: search_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.search_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.search_id_seq OWNER TO postgres;

--
-- Name: search_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.search_id_seq OWNED BY public.search.id;


--
-- Name: search_rels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.search_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    posts_id integer
);


ALTER TABLE public.search_rels OWNER TO postgres;

--
-- Name: search_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.search_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.search_rels_id_seq OWNER TO postgres;

--
-- Name: search_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.search_rels_id_seq OWNED BY public.search_rels.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    email character varying NOT NULL,
    reset_password_token character varying,
    reset_password_expiration timestamp(3) with time zone,
    salt character varying,
    hash character varying,
    login_attempts numeric DEFAULT 0,
    lock_until timestamp(3) with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: works; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works (
    id integer NOT NULL,
    title character varying,
    hero_type public.enum_works_hero_type DEFAULT 'lowImpact'::public.enum_works_hero_type,
    hero_rich_text jsonb,
    hero_media_id integer,
    meta_title character varying,
    meta_image_id integer,
    meta_description character varying,
    published_at timestamp(3) with time zone,
    slug character varying,
    slug_lock boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    _status public.enum_works_status DEFAULT 'draft'::public.enum_works_status
);


ALTER TABLE public.works OWNER TO postgres;

--
-- Name: works_blocks_archive; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_archive (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    intro_content jsonb,
    populate_by public.enum_works_blocks_archive_populate_by DEFAULT 'collection'::public.enum_works_blocks_archive_populate_by,
    relation_to public.enum_works_blocks_archive_relation_to DEFAULT 'posts'::public.enum_works_blocks_archive_relation_to,
    "limit" numeric DEFAULT 10,
    block_name character varying
);


ALTER TABLE public.works_blocks_archive OWNER TO postgres;

--
-- Name: works_blocks_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_content (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    theme public.enum_works_blocks_content_theme DEFAULT 'light'::public.enum_works_blocks_content_theme,
    space_pt public.enum_works_blocks_content_space_pt DEFAULT 'md'::public.enum_works_blocks_content_space_pt,
    space_pb public.enum_works_blocks_content_space_pb DEFAULT 'md'::public.enum_works_blocks_content_space_pb,
    space_mt public.enum_works_blocks_content_space_mt DEFAULT 'md'::public.enum_works_blocks_content_space_mt,
    space_mb public.enum_works_blocks_content_space_mb DEFAULT 'md'::public.enum_works_blocks_content_space_mb,
    block_name character varying
);


ALTER TABLE public.works_blocks_content OWNER TO postgres;

--
-- Name: works_blocks_content_columns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_content_columns (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    size public.enum_works_blocks_content_columns_size DEFAULT 'oneThird'::public.enum_works_blocks_content_columns_size,
    content_type public.enum_works_blocks_content_columns_content_type DEFAULT 'text'::public.enum_works_blocks_content_columns_content_type,
    text_rich_text jsonb,
    text_enable_link boolean,
    text_link_type public.enum_works_blocks_content_columns_text_link_type DEFAULT 'reference'::public.enum_works_blocks_content_columns_text_link_type,
    text_link_new_tab boolean,
    text_link_url character varying,
    text_link_label character varying,
    text_link_appearance public.enum_works_blocks_content_columns_text_link_appearance DEFAULT 'default'::public.enum_works_blocks_content_columns_text_link_appearance,
    section_heading_heading character varying,
    section_heading_subheading character varying,
    section_heading_size public.enum_works_blocks_content_columns_section_heading_size DEFAULT 'base'::public.enum_works_blocks_content_columns_section_heading_size,
    section_heading_align public.enum_works_blocks_content_columns_section_heading_align DEFAULT 'left'::public.enum_works_blocks_content_columns_section_heading_align,
    section_heading_style public.enum_works_blocks_content_columns_section_heading_style DEFAULT 'default'::public.enum_works_blocks_content_columns_section_heading_style,
    slider_intro_content_heading character varying,
    slider_intro_content_subheading character varying,
    slider_intro_content_size public.enum_works_blocks_content_columns_slider_intro_content_size DEFAULT 'base'::public.enum_works_blocks_content_columns_slider_intro_content_size,
    slider_intro_content_align public.enum_works_blocks_content_columns_slider_intro_content_align DEFAULT 'left'::public.enum_works_blocks_content_columns_slider_intro_content_align,
    slider_style public.enum_works_blocks_content_columns_slider_style DEFAULT 'default'::public.enum_works_blocks_content_columns_slider_style,
    slider_space_pt public.enum_works_blocks_content_columns_slider_space_pt DEFAULT 'md'::public.enum_works_blocks_content_columns_slider_space_pt,
    slider_space_pb public.enum_works_blocks_content_columns_slider_space_pb DEFAULT 'md'::public.enum_works_blocks_content_columns_slider_space_pb,
    slider_space_mt public.enum_works_blocks_content_columns_slider_space_mt DEFAULT 'md'::public.enum_works_blocks_content_columns_slider_space_mt,
    slider_space_mb public.enum_works_blocks_content_columns_slider_space_mb DEFAULT 'md'::public.enum_works_blocks_content_columns_slider_space_mb,
    media_media_id integer,
    media_aspect_ratio public.enum_works_blocks_content_columns_media_aspect_ratio DEFAULT 'landscape'::public.enum_works_blocks_content_columns_media_aspect_ratio
);


ALTER TABLE public.works_blocks_content_columns OWNER TO postgres;

--
-- Name: works_blocks_content_columns_slider_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_content_columns_slider_slides (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    slide_image_id integer,
    slide_caption character varying
);


ALTER TABLE public.works_blocks_content_columns_slider_slides OWNER TO postgres;

--
-- Name: works_blocks_cta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_cta (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    rich_text jsonb,
    block_name character varying
);


ALTER TABLE public.works_blocks_cta OWNER TO postgres;

--
-- Name: works_blocks_cta_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_cta_links (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    link_type public.enum_works_blocks_cta_links_link_type DEFAULT 'reference'::public.enum_works_blocks_cta_links_link_type,
    link_new_tab boolean,
    link_url character varying,
    link_label character varying,
    link_appearance public.enum_works_blocks_cta_links_link_appearance DEFAULT 'default'::public.enum_works_blocks_cta_links_link_appearance
);


ALTER TABLE public.works_blocks_cta_links OWNER TO postgres;

--
-- Name: works_blocks_form_block; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_form_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    form_id integer,
    enable_intro boolean,
    intro_content jsonb,
    block_name character varying
);


ALTER TABLE public.works_blocks_form_block OWNER TO postgres;

--
-- Name: works_blocks_media_block; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_media_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    media_id integer,
    caption_size public.enum_works_blocks_media_block_caption_size DEFAULT 'normal'::public.enum_works_blocks_media_block_caption_size,
    block_name character varying
);


ALTER TABLE public.works_blocks_media_block OWNER TO postgres;

--
-- Name: works_blocks_slider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_slider (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    intro_content_heading character varying,
    intro_content_subheading character varying,
    intro_content_size public.enum_works_blocks_slider_intro_content_size DEFAULT 'base'::public.enum_works_blocks_slider_intro_content_size,
    intro_content_align public.enum_works_blocks_slider_intro_content_align DEFAULT 'left'::public.enum_works_blocks_slider_intro_content_align,
    style public.enum_works_blocks_slider_style DEFAULT 'default'::public.enum_works_blocks_slider_style,
    space_pt public.enum_works_blocks_slider_space_pt DEFAULT 'md'::public.enum_works_blocks_slider_space_pt,
    space_pb public.enum_works_blocks_slider_space_pb DEFAULT 'md'::public.enum_works_blocks_slider_space_pb,
    space_mt public.enum_works_blocks_slider_space_mt DEFAULT 'md'::public.enum_works_blocks_slider_space_mt,
    space_mb public.enum_works_blocks_slider_space_mb DEFAULT 'md'::public.enum_works_blocks_slider_space_mb,
    block_name character varying
);


ALTER TABLE public.works_blocks_slider OWNER TO postgres;

--
-- Name: works_blocks_slider_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_slider_slides (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    slide_image_id integer,
    slide_caption character varying
);


ALTER TABLE public.works_blocks_slider_slides OWNER TO postgres;

--
-- Name: works_blocks_tabs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_tabs (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    heading_style public.enum_works_blocks_tabs_heading_style DEFAULT 'default'::public.enum_works_blocks_tabs_heading_style,
    heading_eyebrow character varying,
    heading_heading character varying,
    heading_subheading character varying,
    space_pt public.enum_works_blocks_tabs_space_pt DEFAULT 'md'::public.enum_works_blocks_tabs_space_pt,
    space_pb public.enum_works_blocks_tabs_space_pb DEFAULT 'md'::public.enum_works_blocks_tabs_space_pb,
    space_mt public.enum_works_blocks_tabs_space_mt DEFAULT 'md'::public.enum_works_blocks_tabs_space_mt,
    space_mb public.enum_works_blocks_tabs_space_mb DEFAULT 'md'::public.enum_works_blocks_tabs_space_mb,
    block_name character varying
);


ALTER TABLE public.works_blocks_tabs OWNER TO postgres;

--
-- Name: works_blocks_tabs_tabs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_tabs_tabs (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    tab_title character varying,
    content_type public.enum_works_blocks_tabs_tabs_content_type DEFAULT 'richText'::public.enum_works_blocks_tabs_tabs_content_type,
    rich_text jsonb,
    slider_style public.enum_works_blocks_tabs_tabs_slider_style DEFAULT 'default'::public.enum_works_blocks_tabs_tabs_slider_style
);


ALTER TABLE public.works_blocks_tabs_tabs OWNER TO postgres;

--
-- Name: works_blocks_tabs_tabs_slider_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_tabs_tabs_slider_slides (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    slide_image_id integer,
    slide_caption character varying
);


ALTER TABLE public.works_blocks_tabs_tabs_slider_slides OWNER TO postgres;

--
-- Name: works_blocks_works; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_blocks_works (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    intro_content jsonb,
    populate_by public.enum_works_blocks_works_populate_by DEFAULT 'collection'::public.enum_works_blocks_works_populate_by,
    relation_to public.enum_works_blocks_works_relation_to DEFAULT 'works'::public.enum_works_blocks_works_relation_to,
    "limit" numeric DEFAULT 4,
    block_name character varying
);


ALTER TABLE public.works_blocks_works OWNER TO postgres;

--
-- Name: works_hero_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_hero_links (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    link_type public.enum_works_hero_links_link_type DEFAULT 'reference'::public.enum_works_hero_links_link_type,
    link_new_tab boolean,
    link_url character varying,
    link_label character varying,
    link_appearance public.enum_works_hero_links_link_appearance DEFAULT 'default'::public.enum_works_hero_links_link_appearance
);


ALTER TABLE public.works_hero_links OWNER TO postgres;

--
-- Name: works_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.works_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.works_id_seq OWNER TO postgres;

--
-- Name: works_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.works_id_seq OWNED BY public.works.id;


--
-- Name: works_rels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    pages_id integer,
    posts_id integer,
    works_id integer,
    categories_id integer
);


ALTER TABLE public.works_rels OWNER TO postgres;

--
-- Name: works_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.works_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.works_rels_id_seq OWNER TO postgres;

--
-- Name: works_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.works_rels_id_seq OWNED BY public.works_rels.id;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: postgres
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO postgres;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: postgres
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO postgres;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: postgres
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO postgres;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: postgres
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


ALTER TABLE storage.buckets OWNER TO postgres;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: postgres
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO postgres;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO postgres;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: postgres
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO postgres;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO postgres;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: _pages_v id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v ALTER COLUMN id SET DEFAULT nextval('public._pages_v_id_seq'::regclass);


--
-- Name: _pages_v_blocks_archive id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_archive ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_archive_id_seq'::regclass);


--
-- Name: _pages_v_blocks_content id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_content ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_content_id_seq'::regclass);


--
-- Name: _pages_v_blocks_content_columns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_content_columns ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_content_columns_id_seq'::regclass);


--
-- Name: _pages_v_blocks_content_columns_slider_slides id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_content_columns_slider_slides ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_content_columns_slider_slides_id_seq'::regclass);


--
-- Name: _pages_v_blocks_cta id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_cta ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_cta_id_seq'::regclass);


--
-- Name: _pages_v_blocks_cta_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_cta_links ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_cta_links_id_seq'::regclass);


--
-- Name: _pages_v_blocks_form_block id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_form_block ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_form_block_id_seq'::regclass);


--
-- Name: _pages_v_blocks_media_block id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_media_block ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_media_block_id_seq'::regclass);


--
-- Name: _pages_v_blocks_slider id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_slider ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_slider_id_seq'::regclass);


--
-- Name: _pages_v_blocks_slider_slides id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_slider_slides ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_slider_slides_id_seq'::regclass);


--
-- Name: _pages_v_blocks_works id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_works ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_works_id_seq'::regclass);


--
-- Name: _pages_v_rels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_rels ALTER COLUMN id SET DEFAULT nextval('public._pages_v_rels_id_seq'::regclass);


--
-- Name: _pages_v_version_hero_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_version_hero_links ALTER COLUMN id SET DEFAULT nextval('public._pages_v_version_hero_links_id_seq'::regclass);


--
-- Name: _posts_v id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v ALTER COLUMN id SET DEFAULT nextval('public._posts_v_id_seq'::regclass);


--
-- Name: _posts_v_rels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v_rels ALTER COLUMN id SET DEFAULT nextval('public._posts_v_rels_id_seq'::regclass);


--
-- Name: _posts_v_version_populated_authors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v_version_populated_authors ALTER COLUMN id SET DEFAULT nextval('public._posts_v_version_populated_authors_id_seq'::regclass);


--
-- Name: _works_v id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v ALTER COLUMN id SET DEFAULT nextval('public._works_v_id_seq'::regclass);


--
-- Name: _works_v_blocks_archive id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_archive ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_archive_id_seq'::regclass);


--
-- Name: _works_v_blocks_content id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_content ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_content_id_seq'::regclass);


--
-- Name: _works_v_blocks_content_columns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_content_columns ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_content_columns_id_seq'::regclass);


--
-- Name: _works_v_blocks_content_columns_slider_slides id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_content_columns_slider_slides ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_content_columns_slider_slides_id_seq'::regclass);


--
-- Name: _works_v_blocks_cta id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_cta ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_cta_id_seq'::regclass);


--
-- Name: _works_v_blocks_cta_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_cta_links ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_cta_links_id_seq'::regclass);


--
-- Name: _works_v_blocks_form_block id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_form_block ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_form_block_id_seq'::regclass);


--
-- Name: _works_v_blocks_media_block id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_media_block ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_media_block_id_seq'::regclass);


--
-- Name: _works_v_blocks_slider id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_slider ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_slider_id_seq'::regclass);


--
-- Name: _works_v_blocks_slider_slides id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_slider_slides ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_slider_slides_id_seq'::regclass);


--
-- Name: _works_v_blocks_tabs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_tabs ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_tabs_id_seq'::regclass);


--
-- Name: _works_v_blocks_tabs_tabs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_tabs_tabs ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_tabs_tabs_id_seq'::regclass);


--
-- Name: _works_v_blocks_tabs_tabs_slider_slides id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_tabs_tabs_slider_slides ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_tabs_tabs_slider_slides_id_seq'::regclass);


--
-- Name: _works_v_blocks_works id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_works ALTER COLUMN id SET DEFAULT nextval('public._works_v_blocks_works_id_seq'::regclass);


--
-- Name: _works_v_rels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_rels ALTER COLUMN id SET DEFAULT nextval('public._works_v_rels_id_seq'::regclass);


--
-- Name: _works_v_version_hero_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_version_hero_links ALTER COLUMN id SET DEFAULT nextval('public._works_v_version_hero_links_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: footer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer ALTER COLUMN id SET DEFAULT nextval('public.footer_id_seq'::regclass);


--
-- Name: footer_rels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_rels ALTER COLUMN id SET DEFAULT nextval('public.footer_rels_id_seq'::regclass);


--
-- Name: form_submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_submissions ALTER COLUMN id SET DEFAULT nextval('public.form_submissions_id_seq'::regclass);


--
-- Name: forms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms ALTER COLUMN id SET DEFAULT nextval('public.forms_id_seq'::regclass);


--
-- Name: header id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.header ALTER COLUMN id SET DEFAULT nextval('public.header_id_seq'::regclass);


--
-- Name: header_rels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.header_rels ALTER COLUMN id SET DEFAULT nextval('public.header_rels_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: pages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);


--
-- Name: pages_rels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_rels ALTER COLUMN id SET DEFAULT nextval('public.pages_rels_id_seq'::regclass);


--
-- Name: payload_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_jobs ALTER COLUMN id SET DEFAULT nextval('public.payload_jobs_id_seq'::regclass);


--
-- Name: payload_locked_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_id_seq'::regclass);


--
-- Name: payload_locked_documents_rels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_rels_id_seq'::regclass);


--
-- Name: payload_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_migrations ALTER COLUMN id SET DEFAULT nextval('public.payload_migrations_id_seq'::regclass);


--
-- Name: payload_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_preferences ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_id_seq'::regclass);


--
-- Name: payload_preferences_rels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_preferences_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_rels_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: posts_rels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts_rels ALTER COLUMN id SET DEFAULT nextval('public.posts_rels_id_seq'::regclass);


--
-- Name: redirects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirects ALTER COLUMN id SET DEFAULT nextval('public.redirects_id_seq'::regclass);


--
-- Name: redirects_rels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirects_rels ALTER COLUMN id SET DEFAULT nextval('public.redirects_rels_id_seq'::regclass);


--
-- Name: search id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search ALTER COLUMN id SET DEFAULT nextval('public.search_id_seq'::regclass);


--
-- Name: search_rels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_rels ALTER COLUMN id SET DEFAULT nextval('public.search_rels_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: works id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works ALTER COLUMN id SET DEFAULT nextval('public.works_id_seq'::regclass);


--
-- Name: works_rels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_rels ALTER COLUMN id SET DEFAULT nextval('public.works_rels_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: _pages_v; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v (id, parent_id, version_title, version_hero_type, version_hero_rich_text, version_hero_media_id, version_meta_title, version_meta_image_id, version_meta_description, version_published_at, version_slug, version_slug_lock, version_updated_at, version_created_at, version__status, created_at, updated_at, latest, autosave) FROM stdin;
\.


--
-- Data for Name: _pages_v_blocks_archive; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_blocks_archive (_order, _parent_id, _path, id, intro_content, populate_by, relation_to, "limit", _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _pages_v_blocks_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_blocks_content (_order, _parent_id, _path, id, theme, space_pt, space_pb, space_mt, space_mb, _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _pages_v_blocks_content_columns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_blocks_content_columns (_order, _parent_id, id, size, content_type, text_rich_text, text_enable_link, text_link_type, text_link_new_tab, text_link_url, text_link_label, text_link_appearance, section_heading_heading, section_heading_subheading, section_heading_size, section_heading_align, section_heading_style, slider_intro_content_heading, slider_intro_content_subheading, slider_intro_content_size, slider_intro_content_align, slider_style, slider_space_pt, slider_space_pb, slider_space_mt, slider_space_mb, media_media_id, media_aspect_ratio, _uuid) FROM stdin;
\.


--
-- Data for Name: _pages_v_blocks_content_columns_slider_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_blocks_content_columns_slider_slides (_order, _parent_id, id, slide_image_id, slide_caption, _uuid) FROM stdin;
\.


--
-- Data for Name: _pages_v_blocks_cta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_blocks_cta (_order, _parent_id, _path, id, rich_text, _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _pages_v_blocks_cta_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_blocks_cta_links (_order, _parent_id, id, link_type, link_new_tab, link_url, link_label, link_appearance, _uuid) FROM stdin;
\.


--
-- Data for Name: _pages_v_blocks_form_block; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_blocks_form_block (_order, _parent_id, _path, id, form_id, enable_intro, intro_content, _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _pages_v_blocks_media_block; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_blocks_media_block (_order, _parent_id, _path, id, media_id, caption_size, _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _pages_v_blocks_slider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_blocks_slider (_order, _parent_id, _path, id, intro_content_heading, intro_content_subheading, intro_content_size, intro_content_align, style, space_pt, space_pb, space_mt, space_mb, _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _pages_v_blocks_slider_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_blocks_slider_slides (_order, _parent_id, id, slide_image_id, slide_caption, _uuid) FROM stdin;
\.


--
-- Data for Name: _pages_v_blocks_works; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_blocks_works (_order, _parent_id, _path, id, intro_content, populate_by, relation_to, "limit", _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _pages_v_rels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_rels (id, "order", parent_id, path, pages_id, posts_id, works_id, categories_id) FROM stdin;
\.


--
-- Data for Name: _pages_v_version_hero_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._pages_v_version_hero_links (_order, _parent_id, id, link_type, link_new_tab, link_url, link_label, link_appearance, _uuid) FROM stdin;
\.


--
-- Data for Name: _posts_v; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._posts_v (id, parent_id, version_title, version_hero_image_id, version_content, version_meta_title, version_meta_image_id, version_meta_description, version_published_at, version_slug, version_slug_lock, version_updated_at, version_created_at, version__status, created_at, updated_at, latest, autosave) FROM stdin;
\.


--
-- Data for Name: _posts_v_rels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._posts_v_rels (id, "order", parent_id, path, posts_id, categories_id, users_id) FROM stdin;
\.


--
-- Data for Name: _posts_v_version_populated_authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._posts_v_version_populated_authors (_order, _parent_id, id, _uuid, name) FROM stdin;
\.


--
-- Data for Name: _works_v; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v (id, parent_id, version_title, version_hero_type, version_hero_rich_text, version_hero_media_id, version_meta_title, version_meta_image_id, version_meta_description, version_published_at, version_slug, version_slug_lock, version_updated_at, version_created_at, version__status, created_at, updated_at, latest, autosave) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_archive; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_archive (_order, _parent_id, _path, id, intro_content, populate_by, relation_to, "limit", _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_content (_order, _parent_id, _path, id, theme, space_pt, space_pb, space_mt, space_mb, _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_content_columns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_content_columns (_order, _parent_id, id, size, content_type, text_rich_text, text_enable_link, text_link_type, text_link_new_tab, text_link_url, text_link_label, text_link_appearance, section_heading_heading, section_heading_subheading, section_heading_size, section_heading_align, section_heading_style, slider_intro_content_heading, slider_intro_content_subheading, slider_intro_content_size, slider_intro_content_align, slider_style, slider_space_pt, slider_space_pb, slider_space_mt, slider_space_mb, media_media_id, media_aspect_ratio, _uuid) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_content_columns_slider_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_content_columns_slider_slides (_order, _parent_id, id, slide_image_id, slide_caption, _uuid) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_cta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_cta (_order, _parent_id, _path, id, rich_text, _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_cta_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_cta_links (_order, _parent_id, id, link_type, link_new_tab, link_url, link_label, link_appearance, _uuid) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_form_block; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_form_block (_order, _parent_id, _path, id, form_id, enable_intro, intro_content, _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_media_block; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_media_block (_order, _parent_id, _path, id, media_id, caption_size, _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_slider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_slider (_order, _parent_id, _path, id, intro_content_heading, intro_content_subheading, intro_content_size, intro_content_align, style, space_pt, space_pb, space_mt, space_mb, _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_slider_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_slider_slides (_order, _parent_id, id, slide_image_id, slide_caption, _uuid) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_tabs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_tabs (_order, _parent_id, _path, id, heading_style, heading_eyebrow, heading_heading, heading_subheading, space_pt, space_pb, space_mt, space_mb, _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_tabs_tabs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_tabs_tabs (_order, _parent_id, id, tab_title, content_type, rich_text, slider_style, _uuid) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_tabs_tabs_slider_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_tabs_tabs_slider_slides (_order, _parent_id, id, slide_image_id, slide_caption, _uuid) FROM stdin;
\.


--
-- Data for Name: _works_v_blocks_works; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_blocks_works (_order, _parent_id, _path, id, intro_content, populate_by, relation_to, "limit", _uuid, block_name) FROM stdin;
\.


--
-- Data for Name: _works_v_rels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_rels (id, "order", parent_id, path, pages_id, posts_id, works_id, categories_id) FROM stdin;
\.


--
-- Data for Name: _works_v_version_hero_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._works_v_version_hero_links (_order, _parent_id, id, link_type, link_new_tab, link_url, link_label, link_appearance, _uuid) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, title, slug, slug_lock, parent_id, updated_at, created_at) FROM stdin;
7	Technology	technology	t	\N	2025-03-15 18:49:20.4-04	2025-03-15 18:49:19.884-04
8	News	news	t	\N	2025-03-15 18:49:20.401-04	2025-03-15 18:49:19.884-04
9	Finance	finance	t	\N	2025-03-15 18:49:20.713-04	2025-03-15 18:49:20.203-04
10	Design	design	t	\N	2025-03-15 18:49:20.726-04	2025-03-15 18:49:20.209-04
11	Software	software	t	\N	2025-03-15 18:49:20.87-04	2025-03-15 18:49:20.367-04
12	Engineering	engineering	t	\N	2025-03-15 18:49:21.336-04	2025-03-15 18:49:20.838-04
\.


--
-- Data for Name: categories_breadcrumbs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories_breadcrumbs (_order, _parent_id, id, doc_id, url, label) FROM stdin;
1	7	67d603f09406846ff623e587	7	/technology	Technology
1	8	67d603f09406846ff623e588	8	/news	News
1	9	67d603f09406846ff623e589	9	/finance	Finance
1	10	67d603f09406846ff623e58a	10	/design	Design
1	11	67d603f09406846ff623e58b	11	/software	Software
1	12	67d603f19406846ff623e58e	12	/engineering	Engineering
\.


--
-- Data for Name: footer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.footer (id, updated_at, created_at) FROM stdin;
1	2025-03-15 18:49:35.469-04	2025-03-15 18:49:17.696-04
\.


--
-- Data for Name: footer_nav_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.footer_nav_items (_order, _parent_id, id, link_type, link_new_tab, link_url, link_label) FROM stdin;
1	1	67d603ff9406846ff623e5c9	custom	\N	/admin	Admin
2	1	67d603ff9406846ff623e5ca	custom	t	https://github.com/payloadcms/payload/tree/main/templates/website	Source Code
3	1	67d603ff9406846ff623e5cb	custom	t	https://payloadcms.com/	Payload
\.


--
-- Data for Name: footer_rels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.footer_rels (id, "order", parent_id, path, pages_id, posts_id) FROM stdin;
\.


--
-- Data for Name: form_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_submissions (id, form_id, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: form_submissions_submission_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_submissions_submission_data (_order, _parent_id, id, field, value) FROM stdin;
\.


--
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms (id, title, submit_button_label, confirmation_type, confirmation_message, redirect_url, updated_at, created_at) FROM stdin;
2	Contact Form	Submit	message	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"tag": "h2", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The contact form has been submitted successfully.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "direction": "ltr"}}	\N	2025-03-15 18:49:32.742-04	2023-01-12 16:47:41.374-05
\.


--
-- Data for Name: forms_blocks_checkbox; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms_blocks_checkbox (_order, _parent_id, _path, id, name, label, width, required, default_value, block_name) FROM stdin;
\.


--
-- Data for Name: forms_blocks_country; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms_blocks_country (_order, _parent_id, _path, id, name, label, width, required, block_name) FROM stdin;
\.


--
-- Data for Name: forms_blocks_email; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms_blocks_email (_order, _parent_id, _path, id, name, label, width, required, block_name) FROM stdin;
2	2	fields	67d603fc9406846ff623e5b7	email	Email	100	t	email
\.


--
-- Data for Name: forms_blocks_message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms_blocks_message (_order, _parent_id, _path, id, message, block_name) FROM stdin;
\.


--
-- Data for Name: forms_blocks_number; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms_blocks_number (_order, _parent_id, _path, id, name, label, width, default_value, required, block_name) FROM stdin;
3	2	fields	67d603fc9406846ff623e5b8	phone	Phone	100	\N	f	phone
\.


--
-- Data for Name: forms_blocks_select; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms_blocks_select (_order, _parent_id, _path, id, name, label, width, default_value, placeholder, required, block_name) FROM stdin;
\.


--
-- Data for Name: forms_blocks_select_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms_blocks_select_options (_order, _parent_id, id, label, value) FROM stdin;
\.


--
-- Data for Name: forms_blocks_state; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms_blocks_state (_order, _parent_id, _path, id, name, label, width, required, block_name) FROM stdin;
\.


--
-- Data for Name: forms_blocks_text; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms_blocks_text (_order, _parent_id, _path, id, name, label, width, default_value, required, block_name) FROM stdin;
1	2	fields	67d603fc9406846ff623e5b6	full-name	Full Name	100	\N	t	full-name
\.


--
-- Data for Name: forms_blocks_textarea; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms_blocks_textarea (_order, _parent_id, _path, id, name, label, width, default_value, required, block_name) FROM stdin;
4	2	fields	67d603fc9406846ff623e5b9	message	Message	100	\N	t	message
\.


--
-- Data for Name: forms_emails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms_emails (_order, _parent_id, id, email_to, cc, bcc, reply_to, email_from, subject, message) FROM stdin;
1	2	67d603fc9406846ff623e5ba	{{email}}	\N	\N	\N	"Payload" <demo@payloadcms.com>	You've received a new message.	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Your contact form submission was successfully received.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}], "direction": "ltr"}}
\.


--
-- Data for Name: header; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.header (id, updated_at, created_at) FROM stdin;
1	2025-04-14 13:14:13.41-04	2025-03-15 18:49:17.695-04
\.


--
-- Data for Name: header_nav_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.header_nav_items (_order, _parent_id, id, link_type, link_new_tab, link_url, link_label) FROM stdin;
1	1	67d603ff9406846ff623e5cc	custom	\N	/works	Works
2	1	67d61ce4aa17eb5c3db6a1b7	custom	\N	/writings	Writings
\.


--
-- Data for Name: header_rels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.header_rels (id, "order", parent_id, path, pages_id, posts_id) FROM stdin;
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media (id, alt, caption, updated_at, created_at, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height, focal_x, focal_y, sizes_thumbnail_url, sizes_thumbnail_width, sizes_thumbnail_height, sizes_thumbnail_mime_type, sizes_thumbnail_filesize, sizes_thumbnail_filename, sizes_square_url, sizes_square_width, sizes_square_height, sizes_square_mime_type, sizes_square_filesize, sizes_square_filename, sizes_small_url, sizes_small_width, sizes_small_height, sizes_small_mime_type, sizes_small_filesize, sizes_small_filename, sizes_medium_url, sizes_medium_width, sizes_medium_height, sizes_medium_mime_type, sizes_medium_filesize, sizes_medium_filename, sizes_large_url, sizes_large_width, sizes_large_height, sizes_large_mime_type, sizes_large_filesize, sizes_large_filename, sizes_xlarge_url, sizes_xlarge_width, sizes_xlarge_height, sizes_xlarge_mime_type, sizes_xlarge_filesize, sizes_xlarge_filename, sizes_og_url, sizes_og_width, sizes_og_height, sizes_og_mime_type, sizes_og_filesize, sizes_og_filename) FROM stdin;
10	\N	\N	2025-04-11 22:27:59.473-04	2025-04-11 22:27:58.175-04	\N	\N	image-hero1.webp	image/webp	47068	3200	1800	50	50	\N	300	169	image/webp	2538	image-hero1-300x169.webp	\N	500	500	image/webp	4754	image-hero1-500x500.webp	\N	600	338	image/webp	5762	image-hero1-600x338.webp	\N	900	506	image/webp	9314	image-hero1-900x506.webp	\N	1400	788	image/webp	16012	image-hero1-1400x788.webp	\N	1920	1080	image/webp	24024	image-hero1-1920x1080.webp	\N	1200	630	image/webp	12664	image-hero1-1200x630.webp
11	fpo	\N	2025-04-11 23:15:20.816-04	2025-04-11 23:15:18.827-04	\N	\N	fpo-vault.jpg	image/jpeg	303040	1064	625	50	50	\N	300	176	image/jpeg	7677	fpo-vault-300x176.jpg	\N	500	500	image/jpeg	23962	fpo-vault-500x500.jpg	\N	600	352	image/jpeg	20751	fpo-vault-600x352.jpg	\N	900	529	image/jpeg	36773	fpo-vault-900x529.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
12	fpo arturo	\N	2025-04-11 23:16:20.667-04	2025-04-11 23:16:19.836-04	\N	\N	fpo-arturo.jpg	image/jpeg	213250	1064	625	50	50	\N	300	176	image/jpeg	8606	fpo-arturo-300x176.jpg	\N	500	500	image/jpeg	29375	fpo-arturo-500x500.jpg	\N	600	352	image/jpeg	25439	fpo-arturo-600x352.jpg	\N	900	529	image/jpeg	45395	fpo-arturo-900x529.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
13	\N	\N	2025-04-11 23:17:02.068-04	2025-04-11 23:17:01.113-04	\N	\N	fpo-gentlebeast.jpg	image/jpeg	348961	1064	625	50	50	\N	300	176	image/jpeg	7791	fpo-gentlebeast-300x176.jpg	\N	500	500	image/jpeg	23624	fpo-gentlebeast-500x500.jpg	\N	600	352	image/jpeg	23040	fpo-gentlebeast-600x352.jpg	\N	900	529	image/jpeg	43734	fpo-gentlebeast-900x529.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
14	\N	\N	2025-04-12 16:12:22.852-04	2025-04-12 16:12:21.846-04	\N	\N	image-post1-1920x1080.webp	image/webp	15432	1920	1080	50	50	\N	300	169	image/webp	1536	image-post1-1920x1080-300x169.webp	\N	500	500	image/webp	3732	image-post1-1920x1080-500x500.webp	\N	600	338	image/webp	3584	image-post1-1920x1080-600x338.webp	\N	900	506	image/webp	5832	image-post1-1920x1080-900x506.webp	\N	1400	788	image/webp	9962	image-post1-1920x1080-1400x788.webp	\N	1920	1080	image/webp	15432	image-post1-1920x1080-1920x1080.webp	\N	1200	630	image/webp	7908	image-post1-1920x1080-1200x630.webp
15	\N	\N	2025-04-12 16:12:49.689-04	2025-04-12 16:12:48.861-04	\N	\N	image-post3-1920x1080.webp	image/webp	14006	1920	1080	50	50	\N	300	169	image/webp	1228	image-post3-1920x1080-300x169.webp	\N	500	500	image/webp	2680	image-post3-1920x1080-500x500.webp	\N	600	338	image/webp	2996	image-post3-1920x1080-600x338.webp	\N	900	506	image/webp	4900	image-post3-1920x1080-900x506.webp	\N	1400	788	image/webp	8860	image-post3-1920x1080-1400x788.webp	\N	1920	1080	image/webp	14006	image-post3-1920x1080-1920x1080.webp	\N	1200	630	image/webp	6830	image-post3-1920x1080-1200x630.webp
16	\N	\N	2025-04-13 18:10:41.101-04	2025-04-13 18:10:39.795-04	\N	\N	video-thumb.jpg	image/jpeg	70087	1280	720	50	50	\N	300	169	image/jpeg	8443	video-thumb-300x169.jpg	\N	500	500	image/jpeg	26947	video-thumb-500x500.jpg	\N	600	338	image/jpeg	22525	video-thumb-600x338.jpg	\N	900	506	image/jpeg	38107	video-thumb-900x506.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1200	630	image/jpeg	54801	video-thumb-1200x630.jpg
17	\N	\N	2025-04-18 11:43:06.308-04	2025-04-18 11:43:06.019-04	\N	\N	654676377e49e325cbd0acb6_641a045586a1e04544993125_1-hero.png	image/png	2946421	1920	1081	50	50	\N	300	169	image/png	89258	654676377e49e325cbd0acb6_641a045586a1e04544993125_1-hero-300x169.png	\N	500	500	image/png	386870	654676377e49e325cbd0acb6_641a045586a1e04544993125_1-hero-500x500.png	\N	600	338	image/png	339683	654676377e49e325cbd0acb6_641a045586a1e04544993125_1-hero-600x338.png	\N	900	507	image/png	766830	654676377e49e325cbd0acb6_641a045586a1e04544993125_1-hero-900x507.png	\N	1400	788	image/png	1898694	654676377e49e325cbd0acb6_641a045586a1e04544993125_1-hero-1400x788.png	\N	1920	1081	image/png	3450466	654676377e49e325cbd0acb6_641a045586a1e04544993125_1-hero-1920x1081.png	\N	1200	630	image/png	1305943	654676377e49e325cbd0acb6_641a045586a1e04544993125_1-hero-1200x630.png
18	\N	\N	2025-04-18 14:35:51.991-04	2025-04-18 14:35:51.711-04	\N	\N	image-post1-1.webp	image/webp	15432	1920	1080	50	50	\N	300	169	image/webp	1536	image-post1-1-300x169.webp	\N	500	500	image/webp	3732	image-post1-1-500x500.webp	\N	600	338	image/webp	3584	image-post1-1-600x338.webp	\N	900	506	image/webp	5832	image-post1-1-900x506.webp	\N	1400	788	image/webp	9962	image-post1-1-1400x788.webp	\N	1920	1080	image/webp	15432	image-post1-1-1920x1080.webp	\N	1200	630	image/webp	7908	image-post1-1-1200x630.webp
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages (id, title, hero_type, hero_rich_text, hero_media_id, meta_title, meta_image_id, meta_description, published_at, slug, slug_lock, updated_at, created_at, _status) FROM stdin;
4	Contact	none	\N	\N	\N	\N	\N	\N	contact	t	2025-03-15 18:49:33.46-04	2025-03-15 18:49:33.428-04	published
6	Works	highImpact	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Works Page", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	\N	\N	\N	\N	2025-03-16 13:28:54.468-04	works	t	2025-03-16 13:28:54.469-04	2025-03-16 13:28:17.54-04	published
5	Home	none	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}], "direction": null}}	\N	Payload Website Template	\N	An open-source website built with Payload and Next.js.	2025-03-15 19:50:12.424-04	home	t	2025-04-11 23:18:12.017-04	2025-03-15 18:49:33.428-04	published
\.


--
-- Data for Name: pages_blocks_archive; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_blocks_archive (_order, _parent_id, _path, id, intro_content, populate_by, relation_to, "limit", block_name) FROM stdin;
1	5	layout	67f9d7d173a74701db3a822f	\N	collection	works	4	\N
\.


--
-- Data for Name: pages_blocks_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_blocks_content (_order, _parent_id, _path, id, theme, space_pt, space_pb, space_mt, space_mb, block_name) FROM stdin;
1	6	layout	67d70a48d50ee3ddcbfd772a	light	md	md	md	md	\N
\.


--
-- Data for Name: pages_blocks_content_columns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_blocks_content_columns (_order, _parent_id, id, size, content_type, text_rich_text, text_enable_link, text_link_type, text_link_new_tab, text_link_url, text_link_label, text_link_appearance, section_heading_heading, section_heading_subheading, section_heading_size, section_heading_align, section_heading_style, slider_intro_content_heading, slider_intro_content_subheading, slider_intro_content_size, slider_intro_content_align, slider_style, slider_space_pt, slider_space_pb, slider_space_mt, slider_space_mb, media_media_id, media_aspect_ratio) FROM stdin;
1	67d70a48d50ee3ddcbfd772a	67d70a4cd50ee3ddcbfd772c	full	text	\N	\N	reference	\N	\N	\N	default	\N	\N	base	left	default	\N	\N	base	left	default	md	md	md	md	\N	landscape
\.


--
-- Data for Name: pages_blocks_content_columns_slider_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_blocks_content_columns_slider_slides (_order, _parent_id, id, slide_image_id, slide_caption) FROM stdin;
\.


--
-- Data for Name: pages_blocks_cta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_blocks_cta (_order, _parent_id, _path, id, rich_text, block_name) FROM stdin;
\.


--
-- Data for Name: pages_blocks_cta_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_blocks_cta_links (_order, _parent_id, id, link_type, link_new_tab, link_url, link_label, link_appearance) FROM stdin;
\.


--
-- Data for Name: pages_blocks_form_block; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_blocks_form_block (_order, _parent_id, _path, id, form_id, enable_intro, intro_content, block_name) FROM stdin;
1	4	layout	67d603fd9406846ff623e5bb	2	t	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Example contact form:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "direction": "ltr"}}	\N
\.


--
-- Data for Name: pages_blocks_media_block; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_blocks_media_block (_order, _parent_id, _path, id, media_id, caption_size, block_name) FROM stdin;
\.


--
-- Data for Name: pages_blocks_slider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_blocks_slider (_order, _parent_id, _path, id, intro_content_heading, intro_content_subheading, intro_content_size, intro_content_align, style, space_pt, space_pb, space_mt, space_mb, block_name) FROM stdin;
\.


--
-- Data for Name: pages_blocks_slider_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_blocks_slider_slides (_order, _parent_id, id, slide_image_id, slide_caption) FROM stdin;
\.


--
-- Data for Name: pages_blocks_works; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_blocks_works (_order, _parent_id, _path, id, intro_content, populate_by, relation_to, "limit", block_name) FROM stdin;
\.


--
-- Data for Name: pages_hero_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_hero_links (_order, _parent_id, id, link_type, link_new_tab, link_url, link_label, link_appearance) FROM stdin;
\.


--
-- Data for Name: pages_rels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages_rels (id, "order", parent_id, path, pages_id, posts_id, works_id, categories_id) FROM stdin;
\.


--
-- Data for Name: payload_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payload_jobs (id, input, completed_at, total_tried, has_error, error, task_slug, queue, wait_until, processing, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: payload_jobs_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payload_jobs_log (_order, _parent_id, id, executed_at, completed_at, task_slug, task_i_d, input, output, state, error) FROM stdin;
\.


--
-- Data for Name: payload_locked_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payload_locked_documents (id, global_slug, updated_at, created_at) FROM stdin;
47	\N	2025-01-04 23:57:13.309-05	2025-01-04 23:57:13.309-05
56	\N	2025-01-05 00:06:26.293-05	2025-01-05 00:06:26.293-05
27	\N	2025-01-03 19:03:42.199-05	2025-01-03 19:03:42.199-05
35	\N	2025-01-03 19:04:20.734-05	2025-01-03 19:04:20.734-05
106	\N	2025-03-16 12:56:43.836-04	2025-03-16 12:56:43.903-04
225	\N	2025-04-14 20:08:30.073-04	2025-04-14 20:08:30.142-04
184	\N	2025-04-12 16:12:24.466-04	2025-04-12 16:12:24.586-04
185	\N	2025-04-12 16:12:51.361-04	2025-04-12 16:12:51.482-04
246	\N	2025-04-15 09:04:07.181-04	2025-04-15 09:04:07.255-04
\.


--
-- Data for Name: payload_locked_documents_rels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payload_locked_documents_rels (id, "order", parent_id, path, pages_id, posts_id, works_id, media_id, categories_id, users_id, redirects_id, forms_id, form_submissions_id, search_id, payload_jobs_id) FROM stdin;
\.


--
-- Data for Name: payload_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payload_migrations (id, name, batch, updated_at, created_at) FROM stdin;
1	dev	-1	2025-04-19 11:01:50.573-04	2025-04-19 08:18:11.561-04
\.


--
-- Data for Name: payload_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payload_preferences (id, key, value, updated_at, created_at) FROM stdin;
3	users-list	{"preset": null}	2025-04-19 08:19:11.098-04	2025-04-19 08:19:11.099-04
2	pages-list	{"limit": 10, "preset": null}	2025-04-19 08:27:32.2-04	2025-04-19 08:19:06.808-04
22	media-list	{"preset": null}	2025-04-19 08:27:36.446-04	2025-04-19 08:27:36.447-04
23	categories-list	{"preset": null}	2025-04-19 08:27:37.506-04	2025-04-19 08:27:37.507-04
24	redirects-list	{"preset": null}	2025-04-19 08:27:39.408-04	2025-04-19 08:27:39.409-04
25	forms-list	{"preset": null}	2025-04-19 08:27:40.052-04	2025-04-19 08:27:40.053-04
27	search-list	{"preset": null}	2025-04-19 08:27:41.674-04	2025-04-19 08:27:41.675-04
26	form-submissions-list	{"limit": 10, "preset": null}	2025-04-19 08:33:25.895-04	2025-04-19 08:27:40.839-04
1	works-list	{"limit": 10, "preset": null, "columns": [{"active": true, "accessor": "title"}, {"active": true, "accessor": "slug"}, {"active": true, "accessor": "updatedAt"}, {"active": false, "accessor": "id"}, {"active": false, "accessor": "hero"}, {"active": false, "accessor": "layout"}, {"active": false, "accessor": "relatedWorks"}, {"active": false, "accessor": "categories"}, {"active": false, "accessor": "meta"}, {"active": false, "accessor": "publishedAt"}, {"active": false, "accessor": "slugLock"}, {"active": false, "accessor": "createdAt"}, {"active": false, "accessor": "_status"}]}	2025-04-19 08:44:33.829-04	2025-04-19 08:19:04.743-04
21	posts-list	{"limit": 10, "preset": null}	2025-04-19 09:02:21.469-04	2025-04-19 08:27:34.498-04
30	posts-list	{"preset": null}	2025-04-19 10:45:10.159-04	2025-04-19 10:45:10.159-04
32	categories-list	{"preset": null}	2025-04-19 10:45:11.382-04	2025-04-19 10:45:11.382-04
33	users-list	{"preset": null}	2025-04-19 10:45:13.475-04	2025-04-19 10:45:13.475-04
34	redirects-list	{"preset": null}	2025-04-19 10:45:13.925-04	2025-04-19 10:45:13.925-04
35	forms-list	{"limit": 10, "preset": null}	2025-04-19 10:50:49.544-04	2025-04-19 10:45:14.369-04
29	pages-list	{"limit": 10, "preset": null}	2025-04-19 10:51:31.241-04	2025-04-19 10:45:07.518-04
31	works-list	{"limit": 100, "preset": null}	2025-04-19 10:55:58.616-04	2025-04-19 10:45:10.912-04
\.


--
-- Data for Name: payload_preferences_rels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payload_preferences_rels (id, "order", parent_id, path, users_id) FROM stdin;
342	\N	30	user	4
344	\N	32	user	4
345	\N	33	user	4
346	\N	34	user	4
348	\N	35	user	4
349	\N	29	user	4
352	\N	31	user	4
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, title, hero_image_id, content, meta_title, meta_image_id, meta_description, published_at, slug, slug_lock, updated_at, created_at, _status) FROM stdin;
6	Dollar and Sense: The Financial Forecast	10	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "block", "fields": {"id": "67d603fa9406846ff623e5b3", "style": "info", "content": {"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Disclaimer: ", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": "This content is fabricated and for demonstration purposes only. To edit this post, ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"type": "link", "fields": {"url": "/admin", "newTab": true, "linkType": "custom"}, "format": "", "indent": 0, "version": 3, "children": [{"mode": "normal", "text": "navigate to the admin dashboard.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "direction": "ltr", "textFormat": 1}], "direction": "ltr"}}, "blockName": "Disclaimer", "blockType": "banner"}, "format": "", "version": 2}, {"tag": "h2", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Money isn't just currency; ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "it's a language. ", "type": "text", "style": "", "detail": 0, "format": 2, "version": 1}, {"mode": "normal", "text": "Dive deep into its nuances, where strategy meets intuition in the vast sea of finance.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Money, in its essence, transcends the mere concept of coins and paper notes; it becomes a profound language that speaks of value, trust, and societal structures. Like any language, it possesses intricate nuances and subtleties that require a discerning understanding. It's in these depths where the calculated world of financial strategy collides with the raw, instinctive nature of human intuition. Just as a seasoned linguist might dissect the syntax and semantics of a sentence, a financial expert navigates the vast and tumultuous ocean of finance, guided not only by logic and data but also by gut feelings and foresight. Every transaction, investment, and financial decision becomes a dialogue in this expansive lexicon of commerce and value.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}, {"type": "block", "fields": {"id": "67d603fa9406846ff623e5b4", "media": 5, "blockName": "", "blockType": "mediaBlock"}, "format": "", "version": 2}, {"tag": "h2", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Stock Market Dynamics: Bulls, Bears, and the Uncertain Middle", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The stock market is a realm of vast opportunity but also poses risks. Discover the forces that drive market trends and the strategies employed by top traders to navigate this complex ecosystem. From market analysis to understanding investor psychology, get a comprehensive insight into the world of stocks.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The stock market, often visualized as a bustling arena of numbers and ticker tapes, is as much about human behavior as it is about economics. It's a place where optimism, represented by the bullish rally, meets the caution of bearish downturns, with each vying to dictate the market's direction. But between these two extremes lies an uncertain middle ground, a zone populated by traders and investors who constantly weigh hope against fear. Successful navigation requires more than just financial acumen; it demands an understanding of collective sentiments and the ability to predict not just market movements, but also the reactions of other market participants. In this intricate dance of numbers and nerves, the most astute players are those who master both the hard data and the soft nuances of human behavior.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}, {"type": "block", "fields": {"id": "67d603fa9406846ff623e5b5", "style": "info", "content": {"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This content above is completely dynamic using custom layout building blocks configured in the CMS. This can be anything you'd like from rich text and images, to highly designed, complex components.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}], "direction": "ltr"}}, "blockName": "Dynamic components", "blockType": "banner"}, "format": "", "version": 2}], "direction": "ltr"}}	Dollar and Sense: The Financial Forecast	\N	Money isn't just currency; it's a language. Dive deep into its nuances, where strategy meets intuition in the vast sea of finance.	2025-03-15 18:49:24.196-04	dollar-and-sense-the-financial-forecast	t	2025-04-12 15:55:29.423-04	2025-03-15 18:49:24.164-04	published
5	Global Gaze: Beyond the Headlines	14	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"tag": "h2", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Explore the untold and overlooked. A magnified view into the corners of the world, where every story deserves its spotlight.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "block", "fields": {"id": "67d603f89406846ff623e5ad", "style": "info", "content": {"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Disclaimer:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " This content is fabricated and for demonstration purposes only. To edit this post, ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"type": "link", "fields": {"url": "/admin", "newTab": true, "linkType": "custom"}, "format": "", "indent": 0, "version": 3, "children": [{"mode": "normal", "text": "navigate to the admin dashboard.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "direction": "ltr", "textFormat": 1}], "direction": "ltr"}}, "blockName": "Disclaimer", "blockType": "banner"}, "format": "", "version": 2}, {"tag": "h2", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The Power of Resilience: Stories of Recovery and Hope", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Throughout history, regions across the globe have faced the devastating impact of natural disasters, the turbulence of political unrest, and the challenging ripples of economic downturns. In these moments of profound crisis, an often-underestimated force emerges: the indomitable resilience of the human spirit. These aren't just tales of mere survival, but stories of communities forging bonds, uniting with a collective purpose, and demonstrating an innate ability to overcome.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}, {"type": "block", "fields": {"id": "67d603f89406846ff623e5ae", "media": 6, "blockName": "", "blockType": "mediaBlock"}, "format": "", "version": 2}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "From neighbors forming makeshift rescue teams during floods to entire cities rallying to rebuild after economic collapse, the essence of humanity is most evident in these acts of solidarity. As we delve into these narratives, we witness the transformative power of community spirit, where adversity becomes a catalyst for growth, unity, and a brighter, rebuilt future.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}, {"type": "block", "fields": {"id": "67d603f89406846ff623e5af", "style": "info", "content": {"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This content above is completely dynamic using custom layout building blocks configured in the CMS. This can be anything you'd like from rich text and images, to highly designed, complex components.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}], "direction": "ltr"}}, "blockName": "Dynamic components", "blockType": "banner"}, "format": "", "version": 2}], "direction": "ltr"}}	Global Gaze: Beyond the Headlines	\N	Explore the untold and overlooked. A magnified view into the corners of the world, where every story deserves its spotlight.	2025-03-15 18:49:23.012-04	global-gaze-beyond-the-headlines	t	2025-04-12 16:12:33.012-04	2025-03-15 18:49:22.98-04	published
4	Digital Horizons: A Glimpse into Tomorrow	15	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"tag": "h2", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Dive into the marvels of modern innovation, where the only constant is change. A journey where pixels and data converge to craft the future.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "block", "fields": {"id": "67d603f59406846ff623e5a3", "style": "info", "content": {"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Disclaimer:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " This content is fabricated and for demonstration purposes only. To edit this post, ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"type": "link", "fields": {"url": "/admin", "newTab": true, "linkType": "custom"}, "format": "", "indent": 0, "version": 3, "children": [{"mode": "normal", "text": "navigate to the admin dashboard", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"mode": "normal", "text": ".", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}], "direction": "ltr"}}, "blockName": "Disclaimer", "blockType": "banner"}, "format": "", "version": 2}, {"tag": "h2", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The Rise of AI and Machine Learning", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "We find ourselves in a transformative era where artificial intelligence (AI) stands at the forefront of technological evolution. The ripple effects of its advancements are reshaping industries at an unprecedented pace. No longer are businesses bound by the limitations of tedious, manual processes. Instead, sophisticated machines, fueled by vast amounts of historical data, are now capable of making decisions previously left to human intuition. These intelligent systems are not only optimizing operations but also pioneering innovative approaches, heralding a new age of business transformation worldwide. ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}, {"tag": "h4", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "To demonstrate basic AI functionality, here is a javascript snippet that makes a POST request to a generic AI API in order to generate text based on a prompt. ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "block", "fields": {"id": "67d603f59406846ff623e5a4", "code": "async function generateText(prompt) {\\n    const apiKey = 'your-api-key';\\n    const apiUrl = 'https://api.example.com/generate-text';\\n\\n    const response = await fetch(apiUrl, {\\n        method: 'POST',\\n        headers: {\\n            'Content-Type': 'application/json',\\n            'Authorization': `Bearer ${apiKey}`\\n        },\\n        body: JSON.stringify({\\n            model: 'text-generation-model',\\n            prompt: prompt,\\n            max_tokens: 50\\n        })\\n    });\\n\\n    const data = await response.json();\\n    console.log(data.choices[0].text.trim());\\n}\\n\\n// Example usage\\ngenerateText(\\"Once upon a time in a faraway land,\\");\\n", "language": "javascript", "blockName": "Generate Text", "blockType": "code"}, "format": "", "version": 2}, {"tag": "h2", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "IoT: Connecting the World Around Us", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "In today's rapidly evolving technological landscape, the Internet of Things (IoT) stands out as a revolutionary force. From transforming our residences with smart home systems to redefining transportation through connected cars, IoT's influence is palpable in nearly every facet of our daily lives.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This technology hinges on the seamless integration of devices and systems, allowing them to communicate and collaborate effortlessly. With each connected device, we move a step closer to a world where convenience and efficiency are embedded in the very fabric of our existence. As a result, we're transitioning into an era where our surroundings intuitively respond to our needs, heralding a smarter and more interconnected global community.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}, {"type": "block", "fields": {"id": "67d603f59406846ff623e5a5", "media": 7, "blockName": "", "blockType": "mediaBlock"}, "format": "", "version": 2}, {"type": "block", "fields": {"id": "67d603f59406846ff623e5a6", "style": "info", "content": {"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This content above is completely dynamic using custom layout building blocks configured in the CMS. This can be anything you'd like from rich text and images, to highly designed, complex components.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0}], "direction": "ltr"}}, "blockName": "Dynamic Components", "blockType": "banner"}, "format": "", "version": 2}], "direction": "ltr"}}	Digital Horizons: A Glimpse into Tomorrow	\N	Dive into the marvels of modern innovation, where the only constant is change. A journey where pixels and data converge to craft the future.	2025-03-15 18:49:21.814-04	digital-horizons-a-glimpse-into-tomorrow	t	2025-04-12 16:12:54.671-04	2025-03-15 18:49:21.781-04	published
7	Leading and Doing: Notes From Running a Small Design Studio	16	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Running a small design studio often means being both the person making decisions and the one doing the actual work. There’s no clear handoff between “leading” and “doing”—you’re just constantly shifting between roles depending on what’s needed that day. Over time, you get used to the pace, but it does take some adjustment.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Leadership Means Staying Involved", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "In small teams, leadership isn’t about directing from a distance. Most of the time, it means being involved in the process—from early concepts to final deliverables. It’s about setting the tone for the work, but also making sure things get across the finish line.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "That doesn’t mean doing everything yourself, but it does mean staying close enough to the work to guide it properly. When you’re in the details, your feedback tends to be more relevant and helpful. You’re not guessing—you’re responding to what’s actually happening.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Collaboration Is Easier When You’re Hands-On", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "One of the benefits of staying involved in production is that collaboration becomes more fluid. You understand the constraints, the trade-offs, and where to push. It keeps the team aligned when you’re all in the same rhythm.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "It also helps with quality. Not because you don’t trust others to do great work—but because when everyone, including leadership, is contributing, there’s more shared accountability. That usually leads to better outcomes.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Time Management Becomes Non-Negotiable", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Wearing multiple hats forces you to be more deliberate with your time. It’s easy to let urgent things eat up your day, but not everything is as urgent as it feels. Blocking time, grouping similar tasks, and creating buffers has made a big difference. I’ve had to get better at saying no—even to things I’d enjoy doing—so I can stay focused on what actually moves the work forward.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Long Hours Happen—Liking the Work Helps", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "There are weeks when the hours stretch. A pitch is due, something breaks, or a big launch is coming up. That’s part of it. And while it’s important to set boundaries where you can, it’s also helpful to recognize that loving the work makes those long stretches a lot more manageable.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "That doesn’t mean overworking is the goal—it’s just something that happens sometimes, especially when you’re building something you care about. When the work is meaningful, you don’t mind putting in the extra time now and then.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "A Few Things That Have Helped", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Block deep work time like a meeting—don’t leave it to chance", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Avoid micro-managing, but stay close enough to support", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Create repeatable systems where you can (templates, checklists, docs)", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Step back occasionally to reassess what’s working and what isn’t", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Wrapping Up", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Running a small studio means constantly switching gears. You’re leading, building, fixing, and refining—all at once. It can be a lot, but it can also be really rewarding if you’re intentional about how you work and stay connected to why you started in the first place.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "It’s not about doing everything perfectly. It’s about finding a rhythm that works for you and your team, and adjusting as you go.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	\N	\N	\N	2025-04-13 13:06:55.475-04	leading-and-doing-notes-from-running-a-small-design-studio	t	2025-04-13 18:10:44.525-04	2025-04-13 13:05:44.301-04	published
\.


--
-- Data for Name: posts_populated_authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts_populated_authors (_order, _parent_id, id, name) FROM stdin;
\.


--
-- Data for Name: posts_rels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts_rels (id, "order", parent_id, path, posts_id, categories_id, users_id) FROM stdin;
\.


--
-- Data for Name: redirects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.redirects (id, "from", to_type, to_url, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: redirects_rels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.redirects_rels (id, "order", parent_id, path, pages_id, posts_id) FROM stdin;
\.


--
-- Data for Name: search; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.search (id, title, priority, slug, meta_title, meta_description, meta_image_id, updated_at, created_at) FROM stdin;
6	Dollar and Sense: The Financial Forecast	0	dollar-and-sense-the-financial-forecast	Dollar and Sense: The Financial Forecast	Money isn't just currency; it's a language. Dive deep into its nuances, where strategy meets intuition in the vast sea of finance.	\N	2025-04-12 15:55:30.77-04	2025-03-15 18:49:24.164-04
5	Global Gaze: Beyond the Headlines	0	global-gaze-beyond-the-headlines	Global Gaze: Beyond the Headlines	Explore the untold and overlooked. A magnified view into the corners of the world, where every story deserves its spotlight.	\N	2025-04-12 16:12:34.67-04	2025-03-15 18:49:22.98-04
4	Digital Horizons: A Glimpse into Tomorrow	0	digital-horizons-a-glimpse-into-tomorrow	Digital Horizons: A Glimpse into Tomorrow	Dive into the marvels of modern innovation, where the only constant is change. A journey where pixels and data converge to craft the future.	\N	2025-04-12 16:12:56.081-04	2025-03-15 18:49:21.781-04
7	Leading and Doing: Notes From Running a Small Design Studio	0	leading-and-doing-notes-from-running-a-small-design-studio	Leading and Doing: Notes From Running a Small Design Studio	\N	\N	2025-04-13 18:10:45.591-04	2025-04-13 13:06:54.825-04
\.


--
-- Data for Name: search_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.search_categories (_order, _parent_id, id, relation_to, title) FROM stdin;
\.


--
-- Data for Name: search_rels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.search_rels (id, "order", parent_id, path, posts_id) FROM stdin;
13	\N	6	doc	6
14	\N	5	doc	5
15	\N	4	doc	4
17	\N	7	doc	7
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, updated_at, created_at, email, reset_password_token, reset_password_expiration, salt, hash, login_attempts, lock_until) FROM stdin;
4	Miles Roxas	2025-04-19 10:45:05.82-04	2025-04-19 10:45:05.752-04	miles@suits-sandals.com	\N	\N	f9012281ad68947b2f58677bc58109b50b00591177b9457aa7de877262c3e51d	ee5accf43d22bf776aa289c016a0404e608dd38708fbc6490d265bbc9ef758d739f2008d319541de5608176545ec8a42a9959dce4da1e924828c45008ece433303a066bd07de088642011490003102424e355907d766d351549aa7c20d10be27ee51a0f710c03fde3a1d0ca17ebab5ace84afe720f6367b0268effca02e1e683d283da800e8d0f08f6ce96f9c425307db162df768dd39f2cd4fc0913bcda1fb48dfae4d4ad7cd5e05f88ddd92c4e1881094b0bb535b1b6344056475b5821e3f6299bf5ccdd4bc5879e9d9344e37af84d7bf44969b22867f7bc837ecd152e725c9838f1cb563dcff47aaa30a19f9a016dd8f47a53d79138ffce34cf2ffd705cd5782caadc0e99b324fe1f130769a6f31e98b77906168e20b14f5f3912741e79573031bc81b22d7d5cc44c7a1a7062ce68d636255f2bb9acf7c9a82b0ebba10a8f63c82732c7ca4ab78a7f56bed6000cd6469143a7fda3e4b78db8e54474c4fbf20c76c9c67ed5d1c10a9e971f122308bbd55140a8a7fa5e4a495b146639647a274f4b4705cd71d6f89be2d3a75f0887900f0ab97e89b91843fe1a8d4a2e568aee70f296e99cc22853c4ba6030206782057f23f02cb9cac3fad762e9c5979f7039a4f3f295811c55406a8599aa36101821d413843658c62a3c6056d3b51aed891b73a05cb64d8565a4e9b0c9c62b07340d1de4f364852c54cfa728a6a47be3f06a	0	\N
\.


--
-- Data for Name: works; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works (id, title, hero_type, hero_rich_text, hero_media_id, meta_title, meta_image_id, meta_description, published_at, slug, slug_lock, updated_at, created_at, _status) FROM stdin;
4	Vault Workforce Screening	highImpact	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Vault Workforce Screening ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	11	\N	11	\N	2025-03-16 15:31:27.433-04	vault-workforce-screening	t	2025-04-12 11:59:23.925-04	2025-03-16 15:30:24.072-04	published
2	Gentle Beast	mediumImpact	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Gentle Beast", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	13	\N	13	\N	2025-03-16 12:56:50.783-04	gentle-beast	t	2025-04-12 11:59:38.732-04	2025-03-16 12:56:08.648-04	published
5	Arturo	highImpact	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Arturo", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	12	\N	12	\N	2025-03-16 15:31:27.433-04	arturo	t	2025-04-18 14:36:46.018-04	2025-03-16 15:37:01.145-04	published
\.


--
-- Data for Name: works_blocks_archive; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_archive (_order, _parent_id, _path, id, intro_content, populate_by, relation_to, "limit", block_name) FROM stdin;
\.


--
-- Data for Name: works_blocks_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_content (_order, _parent_id, _path, id, theme, space_pt, space_pb, space_mt, space_mb, block_name) FROM stdin;
1	4	layout	67d726e0d50ee3ddcbfd772e	light	md	md	md	md	\N
1	2	layout	67d702c0d50ee3ddcbfd7726	light	md	md	md	md	\N
1	5	layout	67fda37ba10a980d40f90735	dark	lg	lg	none	none	Section Heading
2	5	layout	67fd73ce3f587d7698dd28a7	light	xl	none	none	none	\N
5	5	layout	67fe7621d70341464e4444a8	dark	lg	lg	none	none	\N
\.


--
-- Data for Name: works_blocks_content_columns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_content_columns (_order, _parent_id, id, size, content_type, text_rich_text, text_enable_link, text_link_type, text_link_new_tab, text_link_url, text_link_label, text_link_appearance, section_heading_heading, section_heading_subheading, section_heading_size, section_heading_align, section_heading_style, slider_intro_content_heading, slider_intro_content_subheading, slider_intro_content_size, slider_intro_content_align, slider_style, slider_space_pt, slider_space_pb, slider_space_mt, slider_space_mb, media_media_id, media_aspect_ratio) FROM stdin;
1	67d726e0d50ee3ddcbfd772e	67d726e4d50ee3ddcbfd7730	oneThird	text	\N	\N	reference	\N	\N	\N	default	\N	\N	base	left	default	\N	\N	base	left	default	md	md	md	md	\N	landscape
1	67d702c0d50ee3ddcbfd7726	67d702c3d50ee3ddcbfd7728	half	text	\N	\N	reference	\N	\N	\N	default	\N	\N	base	left	default	\N	\N	base	left	default	md	md	md	md	\N	landscape
1	67fda37ba10a980d40f90735	67fda37da10a980d40f90737	twoThirds	sectionHeading	\N	\N	reference	\N	\N	\N	default	The client was an organization that provided innovative solutions for the healthcare industry. They were looking to pivot their business and relaunch as a completely new company.	I lead a team of strategists, copywriters, designers, and front-end developers to deliver a brand identity, collateral templates and assets, and the company’s new website.	lg	left	default	\N	\N	base	left	default	md	md	md	md	\N	landscape
1	67fd73ce3f587d7698dd28a7	67fd73d43f587d7698dd28a9	oneThird	media	\N	\N	reference	\N	\N	\N	default	\N	\N	base	left	default	\N	\N	base	left	default	md	md	md	md	15	portrait
2	67fd73ce3f587d7698dd28a7	67fd9c6b3d0a96d362eb21fc	twoThirds	media	\N	\N	reference	\N	\N	\N	default	\N	\N	base	left	default	\N	\N	base	left	default	md	md	md	md	16	landscape
1	67fe7621d70341464e4444a8	67fe780bd70341464e4444b4	oneThird	text	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The issue is that the center alignment with multiple visible slides on wide screens can make the index tracking inconsistent with visual expectations.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	\N	reference	\N	\N	\N	default	\N	\N	base	left	default	\N	\N	base	left	default	md	md	md	md	\N	landscape
2	67fe7621d70341464e4444a8	67fe7624d70341464e4444aa	twoThirds	slider	\N	\N	reference	\N	\N	\N	default	\N	\N	base	left	default	\N	\N	base	left	single	md	md	md	md	\N	landscape
\.


--
-- Data for Name: works_blocks_content_columns_slider_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_content_columns_slider_slides (_order, _parent_id, id, slide_image_id, slide_caption) FROM stdin;
1	67fe7624d70341464e4444aa	67fe762ed70341464e4444ac	16	\N
2	67fe7624d70341464e4444aa	67fe7636d70341464e4444ae	12	\N
3	67fe7624d70341464e4444aa	67fe763cd70341464e4444b0	11	\N
4	67fe7624d70341464e4444aa	67fe7642d70341464e4444b2	10	\N
\.


--
-- Data for Name: works_blocks_cta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_cta (_order, _parent_id, _path, id, rich_text, block_name) FROM stdin;
\.


--
-- Data for Name: works_blocks_cta_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_cta_links (_order, _parent_id, id, link_type, link_new_tab, link_url, link_label, link_appearance) FROM stdin;
\.


--
-- Data for Name: works_blocks_form_block; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_form_block (_order, _parent_id, _path, id, form_id, enable_intro, intro_content, block_name) FROM stdin;
\.


--
-- Data for Name: works_blocks_media_block; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_media_block (_order, _parent_id, _path, id, media_id, caption_size, block_name) FROM stdin;
\.


--
-- Data for Name: works_blocks_slider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_slider (_order, _parent_id, _path, id, intro_content_heading, intro_content_subheading, intro_content_size, intro_content_align, style, space_pt, space_pb, space_mt, space_mb, block_name) FROM stdin;
4	5	layout	67fdb8915e9f5d504dbd36f2	Creative Direction	Presentation	base	center	cropped	xl	xl	none	none	\N
\.


--
-- Data for Name: works_blocks_slider_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_slider_slides (_order, _parent_id, id, slide_image_id, slide_caption) FROM stdin;
1	67fdb8915e9f5d504dbd36f2	67fdb8955e9f5d504dbd36f4	15	
2	67fdb8915e9f5d504dbd36f2	67fdb89e5e9f5d504dbd36f6	16	\N
3	67fdb8915e9f5d504dbd36f2	67fdb8ad5e9f5d504dbd36f8	12	
4	67fdb8915e9f5d504dbd36f2	67fdb8bc5e9f5d504dbd36fa	11	
\.


--
-- Data for Name: works_blocks_tabs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_tabs (_order, _parent_id, _path, id, heading_style, heading_eyebrow, heading_heading, heading_subheading, space_pt, space_pb, space_mt, space_mb, block_name) FROM stdin;
3	5	layout	6801b38d64a49d7757639335	default	Presentation	Creative Direction	3 distinct ways to tell an impactful story.	xl	xl	none	none	\N
\.


--
-- Data for Name: works_blocks_tabs_tabs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_tabs_tabs (_order, _parent_id, id, tab_title, content_type, rich_text, slider_style) FROM stdin;
1	6801b38d64a49d7757639335	6801b39964a49d7757639337	Humanity	slider	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "start", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}], "direction": null}}	single
2	6801b38d64a49d7757639335	6801b3e364a49d7757639339	Authority	slider	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "I lead a team of strategists, copywriters, designers, and front-end developers to deliver a brand identity, collateral templates and assets, and the company’s new website.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	single
3	6801b38d64a49d7757639335	68029b63e175ae63cad4d78b	Intelligence	slider	\N	single
\.


--
-- Data for Name: works_blocks_tabs_tabs_slider_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_tabs_tabs_slider_slides (_order, _parent_id, id, slide_image_id, slide_caption) FROM stdin;
1	6801b39964a49d7757639337	680272e4ad61ccf441803007	10	
2	6801b39964a49d7757639337	680272f5ad61ccf441803009	17	
1	6801b3e364a49d7757639339	680295eadaf6584ef3c4f275	17	
2	6801b3e364a49d7757639339	68029632daf6584ef3c4f277	10	
1	68029b63e175ae63cad4d78b	68029b6be175ae63cad4d78d	18	
\.


--
-- Data for Name: works_blocks_works; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_blocks_works (_order, _parent_id, _path, id, intro_content, populate_by, relation_to, "limit", block_name) FROM stdin;
\.


--
-- Data for Name: works_hero_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_hero_links (_order, _parent_id, id, link_type, link_new_tab, link_url, link_label, link_appearance) FROM stdin;
\.


--
-- Data for Name: works_rels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_rels (id, "order", parent_id, path, pages_id, posts_id, works_id, categories_id) FROM stdin;
214	\N	5	layout.3.slides.0.slide.link	\N	5	\N	\N
215	\N	5	layout.3.slides.1.slide.link	\N	7	\N	\N
216	\N	5	layout.3.slides.2.slide.link	\N	\N	5	\N
217	\N	5	layout.3.slides.3.slide.link	\N	\N	4	\N
218	1	5	categories	\N	\N	\N	10
154	\N	5	layout.2.slides.0.slide.link	\N	5	\N	\N
155	\N	5	layout.2.slides.1.slide.link	\N	7	\N	\N
156	\N	5	layout.2.slides.2.slide.link	\N	\N	5	\N
157	\N	5	layout.2.slides.3.slide.link	\N	\N	4	\N
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: postgres
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2024-10-23 01:31:29
20211116045059	2024-10-23 01:31:29
20211116050929	2024-10-23 01:31:29
20211116051442	2024-10-23 01:31:29
20211116212300	2024-10-23 01:31:29
20211116213355	2024-10-23 01:31:29
20211116213934	2024-10-23 01:31:29
20211116214523	2024-10-23 01:31:29
20211122062447	2024-10-23 01:31:29
20211124070109	2024-10-23 01:31:29
20211202204204	2024-10-23 01:31:29
20211202204605	2024-10-23 01:31:29
20211210212804	2024-10-23 01:31:29
20211228014915	2024-10-23 01:31:29
20220107221237	2024-10-23 01:31:29
20220228202821	2024-10-23 01:31:29
20220312004840	2024-10-23 01:31:29
20220603231003	2024-10-23 01:31:29
20220603232444	2024-10-23 01:31:29
20220615214548	2024-10-23 01:31:29
20220712093339	2024-10-23 01:31:29
20220908172859	2024-10-23 01:31:29
20220916233421	2024-10-23 01:31:29
20230119133233	2024-10-23 01:31:29
20230128025114	2024-10-23 01:31:29
20230128025212	2024-10-23 01:31:29
20230227211149	2024-10-23 01:31:29
20230228184745	2024-10-23 01:31:29
20230308225145	2024-10-23 01:31:30
20230328144023	2024-10-23 01:31:30
20231018144023	2024-10-23 01:31:30
20231204144023	2024-10-23 01:31:30
20231204144024	2024-10-23 01:31:30
20231204144025	2024-10-23 01:31:30
20240108234812	2024-10-23 01:31:30
20240109165339	2024-10-23 01:31:30
20240227174441	2024-10-23 01:31:30
20240311171622	2024-10-23 01:31:30
20240321100241	2024-10-23 01:31:30
20240401105812	2024-10-23 01:31:30
20240418121054	2024-10-23 01:31:30
20240523004032	2024-10-23 01:31:30
20240618124746	2024-10-23 01:31:30
20240801235015	2024-10-23 01:31:30
20240805133720	2024-10-23 01:31:30
20240827160934	2024-10-23 01:31:30
20240919163303	2024-12-29 20:08:12
20240919163305	2024-12-29 20:08:13
20241019105805	2024-12-29 20:08:14
20241030150047	2024-12-29 20:08:16
20241108114728	2024-12-29 20:08:17
20241121104152	2024-12-29 20:08:18
20241130184212	2024-12-29 20:08:19
20241220035512	2025-03-15 22:48:28
20241220123912	2025-03-15 22:48:29
20241224161212	2025-03-15 22:48:30
20250107150512	2025-03-15 22:48:30
20250110162412	2025-03-15 22:48:31
20250123174212	2025-03-15 22:48:32
20250128220012	2025-03-15 22:48:32
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: postgres
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
payload3	payload3	\N	2024-10-22 21:52:09.369844-04	2024-10-22 21:52:09.369844-04	t	f	\N	\N	\N
payload3-private	payload3-private	\N	2024-10-22 21:52:46.230127-04	2024-10-22 21:52:46.230127-04	t	f	\N	\N	\N
media	media	\N	2025-04-11 20:33:13.163103-04	2025-04-11 20:33:13.163103-04	f	f	\N	\N	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2024-10-23 01:30:33.737748
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2024-10-23 01:30:33.800179
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2024-10-23 01:30:33.855477
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2024-10-23 01:30:33.940427
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2024-10-23 01:30:34.018895
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2024-10-23 01:30:34.07997
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2024-10-23 01:30:34.142945
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2024-10-23 01:30:34.20174
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2024-10-23 01:30:34.213067
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2024-10-23 01:30:34.270688
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2024-10-23 01:30:34.327212
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2024-10-23 01:30:34.383923
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2024-10-23 01:30:34.438937
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2024-10-23 01:30:34.495483
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2024-10-23 01:30:34.551723
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2024-10-23 01:30:34.628057
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2024-10-23 01:30:34.68291
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2024-10-23 01:30:34.739103
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2024-10-23 01:30:34.794949
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2024-10-23 01:30:34.850943
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2024-10-23 01:30:34.906995
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2024-10-23 01:30:34.96713
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2024-10-23 01:30:35.004796
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2024-10-23 01:30:35.081753
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2024-10-23 01:30:35.109584
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2024-10-23 01:30:35.184194
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
2afe83c4-af4a-4d1f-9b21-a689e975352d	payload3-private	media/test-1.png	\N	2024-10-22 21:58:53.695223-04	2024-10-22 21:58:53.695223-04	2024-10-22 21:58:53.695223-04	{"eTag": "\\"6236251a916551698259af18d569a782\\"", "size": 4239099, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2024-10-23T01:58:54.000Z", "contentLength": 4239099, "httpStatusCode": 200}	807c38ed-6b26-4c28-94cf-95da4db80425	\N	{}
bb2f6ead-c6c0-47e4-8b00-c13def3ea189	payload3-private	media/profile.jpg	\N	2024-10-22 23:25:16.321024-04	2024-10-22 23:25:25.719515-04	2024-10-22 23:25:16.321024-04	{"eTag": "\\"67ec9ea5fc9b658b38ecd78c0a56dd12\\"", "size": 57157, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2024-10-23T03:25:26.000Z", "contentLength": 57157, "httpStatusCode": 200}	59e4b6a1-9cf1-4d5b-8558-284991d4d6b2	\N	{}
8d9159e3-f373-4b93-8f7a-f33ae3bf57e2	payload3	Models/low_poly_city.glb	\N	2024-10-23 13:58:10.799107-04	2024-10-23 13:58:10.799107-04	2024-10-23 13:58:10.799107-04	{"eTag": "\\"b081c0c52bbc1774d7e36651228cb0f5-4\\"", "size": 24306244, "mimetype": "model/gltf-binary", "cacheControl": "max-age=3600", "lastModified": "2024-10-23T17:58:04.000Z", "contentLength": 24306244, "httpStatusCode": 200}	bf11c783-06ca-4878-be1c-cf785cb43453	\N	\N
5758739e-2a39-47bd-a4d6-4edf2ec204b4	payload3-private	media/image-post1-600x338.webp	\N	2024-12-29 16:51:40.193662-05	2024-12-29 16:51:40.193662-05	2024-12-29 16:51:40.193662-05	{"eTag": "\\"0a0f28a720aabfe243427338779531df-1\\"", "size": 3506, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:40.000Z", "contentLength": 3506, "httpStatusCode": 200}	8c9ca571-33ea-4953-b089-fa507a1b3a72	\N	\N
437ae625-41cb-4d31-9770-4bc2b6f689cb	payload3-private	media/image-hero1-1920x1080.webp	\N	2024-12-29 16:51:47.694791-05	2024-12-29 16:51:47.694791-05	2024-12-29 16:51:47.694791-05	{"eTag": "\\"4eb0365baa81019ab4fdd0cddddba065-1\\"", "size": 24174, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:48.000Z", "contentLength": 24174, "httpStatusCode": 200}	9577cb45-6851-45b8-98bf-e897e4ce1f18	\N	\N
b354f91e-0dd1-4831-8423-0ac2319ad32a	payload3-private	media/image-hero1-500x500.webp	\N	2024-12-29 16:51:47.777877-05	2024-12-29 16:51:47.777877-05	2024-12-29 16:51:47.777877-05	{"eTag": "\\"47aa0303556f20e36f0f9686b8703320-1\\"", "size": 4720, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:48.000Z", "contentLength": 4720, "httpStatusCode": 200}	d6080607-9e00-4a01-a7f6-ca14c309fada	\N	\N
d8acbd6e-58cd-4f19-ad0f-82e316bf9dbd	payload3-private	media/image-hero1-600x338.webp	\N	2024-12-29 16:51:47.891445-05	2024-12-29 16:51:47.891445-05	2024-12-29 16:51:47.891445-05	{"eTag": "\\"2b3e91c11d2b2bfd30c774dcdbbfcd23-1\\"", "size": 5712, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:48.000Z", "contentLength": 5712, "httpStatusCode": 200}	aa9fc474-f56d-4bfa-91f3-1e33643af5f4	\N	\N
d685866d-2f5e-44d4-b48c-ced625c2c616	payload3-private	media/image-post1-300x169.webp	\N	2024-12-29 16:51:47.91704-05	2024-12-29 16:51:47.91704-05	2024-12-29 16:51:47.91704-05	{"eTag": "\\"f2856fc32c5d1e4e796ae660a7d44103-1\\"", "size": 1506, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:48.000Z", "contentLength": 1506, "httpStatusCode": 200}	0af3622c-3ad6-4e82-96d7-c10a63825084	\N	\N
248a1abe-13af-4bf1-a72a-e8af22933a68	payload3-private	media/image-hero1-1200x630.webp	\N	2024-12-29 16:51:47.951085-05	2024-12-29 16:51:47.951085-05	2024-12-29 16:51:47.951085-05	{"eTag": "\\"02f1ecc70a8052435a8784be3afef3bb-1\\"", "size": 12690, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:48.000Z", "contentLength": 12690, "httpStatusCode": 200}	fa4c1d1f-9671-49f7-9158-8ed93092d3bd	\N	\N
251a7f3c-2eff-404f-bc1e-2700a0419cb3	payload3-private	media/image-hero1-1400x788.webp	\N	2024-12-29 16:51:47.976437-05	2024-12-29 16:51:47.976437-05	2024-12-29 16:51:47.976437-05	{"eTag": "\\"9a761ee54e999c8824219f86139a7cdb-1\\"", "size": 16216, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:48.000Z", "contentLength": 16216, "httpStatusCode": 200}	cee0c4cf-abc9-403d-9e75-6a7091463859	\N	\N
87745c1b-81df-4fc1-b736-4be22d213c13	payload3-private	media/image-hero1-300x169.webp	\N	2024-12-29 16:51:48.054435-05	2024-12-29 16:51:48.054435-05	2024-12-29 16:51:48.054435-05	{"eTag": "\\"a80775180cb4ba6793ebbca7a975bd43-1\\"", "size": 2532, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:48.000Z", "contentLength": 2532, "httpStatusCode": 200}	5b88fba0-848c-46ae-b5f9-bc3f8e206713	\N	\N
9bc9bc40-c4c4-47f8-be29-4eb39369d9fe	payload3-private	media/image-post1-500x500.webp	\N	2024-12-29 16:51:48.095965-05	2024-12-29 16:51:48.095965-05	2024-12-29 16:51:48.095965-05	{"eTag": "\\"a0a54d804ab90781d325d61b0d93f350-1\\"", "size": 3718, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:48.000Z", "contentLength": 3718, "httpStatusCode": 200}	0a2f18da-d95b-41f2-ba9f-4cfe262384f6	\N	\N
be005c71-e23a-42b2-9014-0c24fa5d29ec	payload3-private	media/image-hero1-900x506.webp	\N	2024-12-29 16:51:48.129265-05	2024-12-29 16:51:48.129265-05	2024-12-29 16:51:48.129265-05	{"eTag": "\\"e2f1ca6ebc7aade078c4c083c78b2803-1\\"", "size": 9372, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:48.000Z", "contentLength": 9372, "httpStatusCode": 200}	97725ac7-b99a-4507-aa92-6040a9b4684b	\N	\N
21d4708a-3300-4469-9428-02e4fcc46aed	payload3-private	media/image-post1-1920x1080.webp	\N	2024-12-29 16:51:48.864247-05	2024-12-29 16:51:48.864247-05	2024-12-29 16:51:48.864247-05	{"eTag": "\\"7fb7dd8194ba99589bf4ba6a56dae010-1\\"", "size": 15924, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:49.000Z", "contentLength": 15924, "httpStatusCode": 200}	f603a4e4-8eb2-4e8e-b897-7349427f967a	\N	\N
1b7fb757-f195-45a3-8f2c-521ffdefde38	payload3-private	media/image-post3-600x338.webp	\N	2024-12-29 16:51:50.33986-05	2024-12-29 16:51:50.33986-05	2024-12-29 16:51:50.33986-05	{"eTag": "\\"c0376f4ad546330eb3c804cd48f91816-1\\"", "size": 3012, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:50.000Z", "contentLength": 3012, "httpStatusCode": 200}	1ce2941a-2e8c-4e34-96a3-7d650f201ad5	\N	\N
bae805f1-b936-401a-9652-69eec820a6f1	payload3-private	media/image-post3-1920x1080.webp	\N	2024-12-29 16:51:50.890899-05	2024-12-29 16:51:50.890899-05	2024-12-29 16:51:50.890899-05	{"eTag": "\\"2c851b5b4a85605da17cb1004bf338b5-1\\"", "size": 14662, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:51.000Z", "contentLength": 14662, "httpStatusCode": 200}	702b2646-5652-466d-93af-ce45850e3f2b	\N	\N
4d63b14a-e35a-4067-bf63-f096bc942a96	payload3-private	media/image-hero1.webp	\N	2024-12-29 16:51:48.168675-05	2024-12-29 16:51:48.168675-05	2024-12-29 16:51:48.168675-05	{"eTag": "\\"7668905f0e750ae63021eec6b89f5f89-1\\"", "size": 49432, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:48.000Z", "contentLength": 49432, "httpStatusCode": 200}	d4a7b6ee-954d-4107-8bee-85e773ad6513	\N	\N
964f604a-fcba-4553-8b60-f693c6595e54	payload3-private	media/image-post1-900x506.webp	\N	2024-12-29 16:51:48.809279-05	2024-12-29 16:51:48.809279-05	2024-12-29 16:51:48.809279-05	{"eTag": "\\"a383fc069dcc31aed1f7dee2c43fdfc1-1\\"", "size": 5718, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:49.000Z", "contentLength": 5718, "httpStatusCode": 200}	e0a9c677-4810-461d-8ca5-e1dceeccb0aa	\N	\N
06cc182f-609c-466b-a9c9-8152618917eb	payload3-private	media/image-post2-900x506.webp	\N	2024-12-29 16:51:49.007758-05	2024-12-29 16:51:49.007758-05	2024-12-29 16:51:49.007758-05	{"eTag": "\\"54d2337c60f88f08bad5485e706476d3-1\\"", "size": 7826, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:49.000Z", "contentLength": 7826, "httpStatusCode": 200}	f0cd81e3-0eaa-4c48-bf58-5b6aa03bd053	\N	\N
187e39df-c74a-4701-840d-c902c0af29ef	payload3-private	media/image-post2-300x169.webp	\N	2024-12-29 16:51:49.40555-05	2024-12-29 16:51:49.40555-05	2024-12-29 16:51:49.40555-05	{"eTag": "\\"a533e4ffb6749c368d9792c6a86700f4-1\\"", "size": 2168, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:49.000Z", "contentLength": 2168, "httpStatusCode": 200}	239a56f3-3833-4c98-8401-9b10f5ada5fe	\N	\N
182761d7-7b9e-4adf-9797-2e97e57a957a	payload3-private	media/image-post2.webp	\N	2024-12-29 16:51:50.12848-05	2024-12-29 16:51:50.12848-05	2024-12-29 16:51:50.12848-05	{"eTag": "\\"905420c676d5561cf823c55552694879-1\\"", "size": 22332, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:50.000Z", "contentLength": 22332, "httpStatusCode": 200}	3e2a5f19-d3e8-4033-98fa-07373a67f101	\N	\N
ee7d458c-07a7-4bd4-af4f-f647853cb3a1	payload3-private	media/image-post2-600x338.webp	\N	2024-12-29 16:51:48.961104-05	2024-12-29 16:51:48.961104-05	2024-12-29 16:51:48.961104-05	{"eTag": "\\"f73329fed250ddead25faeddbed4199b-1\\"", "size": 4932, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:49.000Z", "contentLength": 4932, "httpStatusCode": 200}	e9ffa2e8-ded1-4e31-9f2b-85d91a79e608	\N	\N
8edb2f40-a46d-4fb3-bc2a-6a7664e47ebd	payload3-private	media/image-post3-1400x788.webp	\N	2024-12-29 16:51:50.314534-05	2024-12-29 16:51:50.314534-05	2024-12-29 16:51:50.314534-05	{"eTag": "\\"ff3eaad134a176e55e5ca3f5c4f13733-1\\"", "size": 8998, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:50.000Z", "contentLength": 8998, "httpStatusCode": 200}	2f92a73d-3373-455f-a26f-8c9f1b5ffc39	\N	\N
23cb9b52-7b1e-4a1c-b961-32f28a379008	payload3-private	media/image-post3.webp	\N	2024-12-29 16:51:51.107506-05	2024-12-29 16:51:51.107506-05	2024-12-29 16:51:51.107506-05	{"eTag": "\\"2c851b5b4a85605da17cb1004bf338b5-1\\"", "size": 14662, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:51.000Z", "contentLength": 14662, "httpStatusCode": 200}	5253eb1d-a921-4674-8e4a-d69bef90c139	\N	\N
88b217ff-0228-42ae-ba8e-bf4611500456	payload3-private	media/image-post1-1400x788.webp	\N	2024-12-29 16:51:49.078716-05	2024-12-29 16:51:49.078716-05	2024-12-29 16:51:49.078716-05	{"eTag": "\\"0f61db48c4a2953eb81e4dbdcb2a8557-1\\"", "size": 9810, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:49.000Z", "contentLength": 9810, "httpStatusCode": 200}	e433929d-d3f7-4665-b520-b891ee6b4fda	\N	\N
880a6650-45cc-4963-a2bc-a2b4e73a0d49	payload3-private	media/image-post3-1200x630.webp	\N	2024-12-29 16:51:50.121971-05	2024-12-29 16:51:50.121971-05	2024-12-29 16:51:50.121971-05	{"eTag": "\\"52a697d2cb83e885f391397af35c35da-1\\"", "size": 6820, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:50.000Z", "contentLength": 6820, "httpStatusCode": 200}	930380c6-16b7-4731-8579-30bf0cacdcec	\N	\N
ee8f87a9-660f-480b-a3fc-340e5b6c4c6f	payload3-private	media/image-post3-500x500.webp	\N	2024-12-29 16:51:49.96565-05	2024-12-29 16:51:49.96565-05	2024-12-29 16:51:49.96565-05	{"eTag": "\\"784af16215e5ba711fa679a174d969cf-1\\"", "size": 2668, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:50.000Z", "contentLength": 2668, "httpStatusCode": 200}	57270416-d6a2-4106-956c-b334a8c3ea0b	\N	\N
b1922ebc-cfdd-426e-90ec-caab8f37c8c2	payload3-private	media/image-post1-1200x630.webp	\N	2024-12-29 16:51:49.079963-05	2024-12-29 16:51:49.079963-05	2024-12-29 16:51:49.079963-05	{"eTag": "\\"d2ec10165c9952a9be365d24fff3061a-1\\"", "size": 7798, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:49.000Z", "contentLength": 7798, "httpStatusCode": 200}	9c9c323f-c5de-4b2c-a587-f8abe11b643b	\N	\N
78f0ac80-0e41-44d6-84f2-19b2345f30a0	payload3-private	media/image-post1.webp	\N	2024-12-29 16:51:49.114609-05	2024-12-29 16:51:49.114609-05	2024-12-29 16:51:49.114609-05	{"eTag": "\\"7fb7dd8194ba99589bf4ba6a56dae010-1\\"", "size": 15924, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:49.000Z", "contentLength": 15924, "httpStatusCode": 200}	529da2ec-94a0-4ded-a19a-68940a991016	\N	\N
63d377f2-862f-4adc-8fea-95fa6e785c88	payload3-private	media/image-post2-500x500.webp	\N	2024-12-29 16:51:49.144258-05	2024-12-29 16:51:49.144258-05	2024-12-29 16:51:49.144258-05	{"eTag": "\\"6fa60410372a8003af1b76f1435e52b2-1\\"", "size": 4816, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:49.000Z", "contentLength": 4816, "httpStatusCode": 200}	9567f162-a671-4e15-91fe-c87de22b645f	\N	\N
a5419fa8-7946-4155-ab11-db05e7ebb532	payload3-private	media/image-post2-1200x630.webp	\N	2024-12-29 16:51:50.081615-05	2024-12-29 16:51:50.081615-05	2024-12-29 16:51:50.081615-05	{"eTag": "\\"ff51dc3a426f0131f17d8fd4bb208bb4-1\\"", "size": 10686, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:50.000Z", "contentLength": 10686, "httpStatusCode": 200}	62b1a149-12b6-4474-ac22-69b4c4efbb9b	\N	\N
944db578-035e-46c7-8272-1dfe1cf64cfb	payload3-private	media/image-post1-600x338 (1).webp	\N	2024-12-29 16:51:49.106329-05	2024-12-29 16:51:49.106329-05	2024-12-29 16:51:49.106329-05	{"eTag": "\\"0a0f28a720aabfe243427338779531df-1\\"", "size": 3506, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:49.000Z", "contentLength": 3506, "httpStatusCode": 200}	8a5d4af4-89f7-4d61-9c78-4a897208b3ce	\N	\N
fa973683-4d77-47e8-8f1d-d876557c1963	payload3-private	media/image-post2-1920x1080.webp	\N	2024-12-29 16:51:50.00567-05	2024-12-29 16:51:50.00567-05	2024-12-29 16:51:50.00567-05	{"eTag": "\\"905420c676d5561cf823c55552694879-1\\"", "size": 22332, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:50.000Z", "contentLength": 22332, "httpStatusCode": 200}	3c55d6d4-4e76-4b6a-9916-59a73e4144ae	\N	\N
e2276d1e-3b67-49db-802a-07ee6aba8484	payload3-private	media/image-post3-300x169.webp	\N	2024-12-29 16:51:50.222521-05	2024-12-29 16:51:50.222521-05	2024-12-29 16:51:50.222521-05	{"eTag": "\\"81fddbf0be0cf1ec30d751d4ff46da72-1\\"", "size": 1234, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:50.000Z", "contentLength": 1234, "httpStatusCode": 200}	24220f07-7b9d-45a3-a91b-930f502b7c98	\N	\N
e5a879f3-cd3b-46c7-8dc0-b72d5d44a362	payload3-private	media/image-post2-1400x788.webp	\N	2024-12-29 16:51:49.960032-05	2024-12-29 16:51:49.960032-05	2024-12-29 16:51:49.960032-05	{"eTag": "\\"59c26c8da4f787bd944d88bb089a24e3-1\\"", "size": 13594, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:50.000Z", "contentLength": 13594, "httpStatusCode": 200}	0056c350-e178-4b89-beec-0a8f404eae09	\N	\N
73517d16-a8c3-4dc3-9fcf-e47d9d1245f4	payload3-private	media/image-post3-900x506.webp	\N	2024-12-29 16:51:49.977655-05	2024-12-29 16:51:49.977655-05	2024-12-29 16:51:49.977655-05	{"eTag": "\\"3cacad27012f48ec24bf1faee5e78073-1\\"", "size": 4988, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2024-12-29T21:51:50.000Z", "contentLength": 4988, "httpStatusCode": 200}	cb8fc5e8-7967-4b6f-b90e-f87ceb75c15a	\N	\N
e3740fa8-2323-45bc-9b25-41d0e8095816	media	image-hero1-1920x1080.webp	\N	2025-04-11 22:27:59.160755-04	2025-04-11 22:27:59.160755-04	2025-04-11 22:27:59.160755-04	{"eTag": "\\"f040c0531c918baa4f7adf40864ff76f\\"", "size": 24024, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T02:28:00.000Z", "contentLength": 24024, "httpStatusCode": 200}	1f643e5b-2656-4955-96a7-02b80086d789	\N	{}
14005821-922d-4b41-9732-c3403cc35fdb	media	image-hero1-1400x788.webp	\N	2025-04-11 22:27:59.163857-04	2025-04-11 22:27:59.163857-04	2025-04-11 22:27:59.163857-04	{"eTag": "\\"6431a39142990537287416676170eece\\"", "size": 16012, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T02:28:00.000Z", "contentLength": 16012, "httpStatusCode": 200}	c02af9b5-ae1c-43b0-aae9-3e223f076049	\N	{}
f16d8a06-acf9-4232-98c3-994a48b0cd15	media	image-hero1-900x506.webp	\N	2025-04-11 22:27:59.16108-04	2025-04-11 22:27:59.16108-04	2025-04-11 22:27:59.16108-04	{"eTag": "\\"9ef7541a652362d9f9523800bf8d4122\\"", "size": 9314, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T02:28:00.000Z", "contentLength": 9314, "httpStatusCode": 200}	31637096-6b7d-44bc-96fc-c158edb8b123	\N	{}
6fcc1837-11ce-4830-9369-d2f595ba28ec	media	image-hero1-500x500.webp	\N	2025-04-11 22:27:59.172487-04	2025-04-11 22:27:59.172487-04	2025-04-11 22:27:59.172487-04	{"eTag": "\\"bcacd5400e252096b28cfeff12848576\\"", "size": 4754, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T02:28:00.000Z", "contentLength": 4754, "httpStatusCode": 200}	b9e4d2c8-68ef-48c9-bbc8-1376d8c26314	\N	{}
7f34403e-0ced-4891-b563-cf1b19bb906d	media	image-hero1-1200x630.webp	\N	2025-04-11 22:27:59.271536-04	2025-04-11 22:27:59.271536-04	2025-04-11 22:27:59.271536-04	{"eTag": "\\"6c20d615ec3461e6ce8eb514f496f5d2\\"", "size": 12664, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T02:28:00.000Z", "contentLength": 12664, "httpStatusCode": 200}	62b07600-2375-4713-8664-1db854912b25	\N	{}
da51a85f-b60a-441f-9861-3e86dc65b8f0	media	image-hero1-600x338.webp	\N	2025-04-11 22:27:59.299088-04	2025-04-11 22:27:59.299088-04	2025-04-11 22:27:59.299088-04	{"eTag": "\\"1e3a7f118e1120907ad0663057acbb56\\"", "size": 5762, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T02:28:00.000Z", "contentLength": 5762, "httpStatusCode": 200}	3428373a-c334-4134-9447-8223cb2a624e	\N	{}
68b23372-78b9-4ce4-b2aa-736bc2005f4d	media	image-hero1-300x169.webp	\N	2025-04-11 22:27:59.288832-04	2025-04-11 22:27:59.288832-04	2025-04-11 22:27:59.288832-04	{"eTag": "\\"306706a527a1ade709e483c411659c62\\"", "size": 2538, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T02:28:00.000Z", "contentLength": 2538, "httpStatusCode": 200}	2f214f7c-72ee-45d2-8733-325714ac4640	\N	{}
95f9dfd8-8241-4ed4-a4b2-31d8bd5cd90e	media	image-hero1.webp	\N	2025-04-11 22:27:59.461767-04	2025-04-11 22:27:59.461767-04	2025-04-11 22:27:59.461767-04	{"eTag": "\\"a9b06e35f59c0e063c28cf161e529338\\"", "size": 47068, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T02:28:00.000Z", "contentLength": 47068, "httpStatusCode": 200}	175a2b6c-e163-445a-8baf-ceda2c83f44f	\N	{}
4fd758b0-b105-4b54-9e92-3333a8d89ba4	media	fpo-vault-500x500.jpg	\N	2025-04-11 23:15:19.422134-04	2025-04-11 23:15:19.422134-04	2025-04-11 23:15:19.422134-04	{"eTag": "\\"9b585232853ffdf753e2937a4cbf73c4\\"", "size": 23962, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:15:20.000Z", "contentLength": 23962, "httpStatusCode": 200}	e62c7511-70ae-4f6d-b008-54b66da0e8af	\N	{}
11f5c519-c3b5-4128-9d43-ba596cc62cfb	media	fpo-vault-300x176.jpg	\N	2025-04-11 23:15:19.428571-04	2025-04-11 23:15:19.428571-04	2025-04-11 23:15:19.428571-04	{"eTag": "\\"15c16a4b6ddba239ebb91bfbda3b57f8\\"", "size": 7677, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:15:20.000Z", "contentLength": 7677, "httpStatusCode": 200}	f669b0ba-7e64-4b4a-b1fe-7984da464fe2	\N	{}
500ace29-e53d-4e10-b937-29a8adfe50eb	media	fpo-vault-600x352.jpg	\N	2025-04-11 23:15:19.448324-04	2025-04-11 23:15:19.448324-04	2025-04-11 23:15:19.448324-04	{"eTag": "\\"63d71dcf2764a6ceb745ff72d8313626\\"", "size": 20751, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:15:20.000Z", "contentLength": 20751, "httpStatusCode": 200}	ec0066f4-50a2-409f-b500-7ceb0b3728c5	\N	{}
6eedcd41-40a2-461b-beb5-ed06479c2b2a	media	fpo-vault-900x529.jpg	\N	2025-04-11 23:15:19.488203-04	2025-04-11 23:15:19.488203-04	2025-04-11 23:15:19.488203-04	{"eTag": "\\"c337edd2822a1a5ec46462708d231278\\"", "size": 36773, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:15:20.000Z", "contentLength": 36773, "httpStatusCode": 200}	5c8446ef-ca32-489b-a643-e5560d264a5c	\N	{}
8c084564-882e-4249-922e-f483cb59c44e	media	fpo-vault.jpg	\N	2025-04-11 23:15:20.744565-04	2025-04-11 23:15:20.744565-04	2025-04-11 23:15:20.744565-04	{"eTag": "\\"a637ab9311afbef88262e2bca528bb53\\"", "size": 303040, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:15:21.000Z", "contentLength": 303040, "httpStatusCode": 200}	5fb4a926-3986-4db2-b0ed-ba564d9489f8	\N	{}
d56bb6bc-c3b0-4abe-b4bf-7b762afd687f	media	fpo-arturo-500x500.jpg	\N	2025-04-11 23:16:20.33539-04	2025-04-11 23:16:20.33539-04	2025-04-11 23:16:20.33539-04	{"eTag": "\\"8b9ab1b85fb57c20735363a9264f6b19\\"", "size": 29375, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:16:21.000Z", "contentLength": 29375, "httpStatusCode": 200}	5b5adf44-b925-471c-9d5a-4add922ae9c8	\N	{}
6a4d625d-032f-4d51-9dec-b93928275a35	media	fpo-arturo-600x352.jpg	\N	2025-04-11 23:16:20.35138-04	2025-04-11 23:16:20.35138-04	2025-04-11 23:16:20.35138-04	{"eTag": "\\"3c65159bff24a752d9e247cf91ffc475\\"", "size": 25439, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:16:21.000Z", "contentLength": 25439, "httpStatusCode": 200}	2ef00185-903a-4c77-a0da-d09be9a08fdf	\N	{}
f6df9727-99a5-423a-a1da-ca0d7f332c29	media	fpo-arturo-900x529.jpg	\N	2025-04-11 23:16:20.381335-04	2025-04-11 23:16:20.381335-04	2025-04-11 23:16:20.381335-04	{"eTag": "\\"faef7ff4840464945699c2ae24e86e6b\\"", "size": 45395, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:16:21.000Z", "contentLength": 45395, "httpStatusCode": 200}	962e4773-1f8b-46ed-8323-9a1b803cbdc3	\N	{}
5c1fca09-ff4f-434f-9e98-3cf769175ea3	media	fpo-arturo-300x176.jpg	\N	2025-04-11 23:16:20.388091-04	2025-04-11 23:16:20.388091-04	2025-04-11 23:16:20.388091-04	{"eTag": "\\"3d3913af127b56344f6a9282ea4528f3\\"", "size": 8606, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:16:21.000Z", "contentLength": 8606, "httpStatusCode": 200}	7d5c7e0e-75bf-4d4d-9def-9c59ed79f6d6	\N	{}
15a6e53e-1966-47eb-aff7-4022430fe0f9	media	fpo-arturo.jpg	\N	2025-04-11 23:16:20.607424-04	2025-04-11 23:16:20.607424-04	2025-04-11 23:16:20.607424-04	{"eTag": "\\"80a5248b5aee20e0902a6067b4e210cb\\"", "size": 213250, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:16:21.000Z", "contentLength": 213250, "httpStatusCode": 200}	de41b5a0-c1b6-4a4d-b31b-37cc94aa409b	\N	{}
43f6aa0e-6691-4e48-9b41-767b42609c4c	media	fpo-gentlebeast-600x352.jpg	\N	2025-04-11 23:17:01.429763-04	2025-04-11 23:17:01.429763-04	2025-04-11 23:17:01.429763-04	{"eTag": "\\"d78aa36be8d40fc3e914430f1d87144e\\"", "size": 23040, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:17:02.000Z", "contentLength": 23040, "httpStatusCode": 200}	1947acd4-ad9e-42c8-8048-787c60cef39f	\N	{}
f27592e8-c518-43b8-8f91-0450816b3293	media	fpo-gentlebeast-300x176.jpg	\N	2025-04-11 23:17:01.634714-04	2025-04-11 23:17:01.634714-04	2025-04-11 23:17:01.634714-04	{"eTag": "\\"88c26fd5fd3d6d745a3aaef020c491e7\\"", "size": 7791, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:17:02.000Z", "contentLength": 7791, "httpStatusCode": 200}	5ae0c08b-9b68-4957-b3b6-9d0572cd96c2	\N	{}
75b23030-bc80-4af9-a3dc-00883fe225bf	media	fpo-gentlebeast-900x529.jpg	\N	2025-04-11 23:17:01.800869-04	2025-04-11 23:17:01.800869-04	2025-04-11 23:17:01.800869-04	{"eTag": "\\"c5c3f625354f591d466037bbb29e1d77\\"", "size": 43734, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:17:02.000Z", "contentLength": 43734, "httpStatusCode": 200}	8b8f1ac4-2522-42a8-acac-22e350faf416	\N	{}
4b323a68-ba8c-414a-901e-b43e308d0790	media	fpo-gentlebeast.jpg	\N	2025-04-11 23:17:02.012396-04	2025-04-11 23:17:02.012396-04	2025-04-11 23:17:02.012396-04	{"eTag": "\\"420be60758613e6b9b071caa28997950\\"", "size": 348961, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:17:02.000Z", "contentLength": 348961, "httpStatusCode": 200}	503f752c-c576-44e4-b7a7-f470c6c26eaa	\N	{}
d92de74c-e3f1-4da7-a71f-454de3d4aa1f	media	fpo-gentlebeast-500x500.jpg	\N	2025-04-11 23:17:01.614018-04	2025-04-11 23:17:01.614018-04	2025-04-11 23:17:01.614018-04	{"eTag": "\\"f31cb28f7fe1e67b58f183fb894358cf\\"", "size": 23624, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-12T03:17:02.000Z", "contentLength": 23624, "httpStatusCode": 200}	9eff98c5-05c2-4f37-94f7-19c9cb63a797	\N	{}
186e89a7-8570-4e9d-b0a4-493976cf20a3	media	image-post1-1920x1080-500x500.webp	\N	2025-04-12 16:12:22.584486-04	2025-04-12 16:12:22.584486-04	2025-04-12 16:12:22.584486-04	{"eTag": "\\"4a453c333c76cf2a95412d3596c8c09e\\"", "size": 3732, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:23.000Z", "contentLength": 3732, "httpStatusCode": 200}	6a81d075-145b-4ca0-ae8c-64d0e67d8c6d	\N	{}
09abf903-8871-4d90-9cda-6c8bbd74f945	media	image-post1-1920x1080.webp	\N	2025-04-12 16:12:22.586735-04	2025-04-12 16:12:22.586735-04	2025-04-12 16:12:22.586735-04	{"eTag": "\\"9f51af679846f7aee4f5b06203a9cc2f\\"", "size": 15432, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:23.000Z", "contentLength": 15432, "httpStatusCode": 200}	c523b23d-283e-4a23-a070-9164aa360ab7	\N	{}
66c18d1e-9b07-4778-a57b-e47c3985d42a	media	image-post1-1920x1080-300x169.webp	\N	2025-04-12 16:12:22.593869-04	2025-04-12 16:12:22.593869-04	2025-04-12 16:12:22.593869-04	{"eTag": "\\"57f503c6aa1c1e0eb12096ab45c64f9a\\"", "size": 1536, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:23.000Z", "contentLength": 1536, "httpStatusCode": 200}	25e96b40-b93e-43bb-b46b-e81cb45b6679	\N	{}
ac39e200-870e-451b-9778-3bb66caf33f6	media	image-post1-1920x1080-900x506.webp	\N	2025-04-12 16:12:22.709856-04	2025-04-12 16:12:22.709856-04	2025-04-12 16:12:22.709856-04	{"eTag": "\\"af2dea51857cd15c1d838a937c23cf40\\"", "size": 5832, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:23.000Z", "contentLength": 5832, "httpStatusCode": 200}	e3513fec-a4f1-4086-a3d0-108521627ccf	\N	{}
628dd144-d111-4fec-a915-4576a34ed1a4	media	image-post1-1920x1080-1400x788.webp	\N	2025-04-12 16:12:22.760187-04	2025-04-12 16:12:22.760187-04	2025-04-12 16:12:22.760187-04	{"eTag": "\\"153ad40bd79bd004ecf8ec4486169157\\"", "size": 9962, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:23.000Z", "contentLength": 9962, "httpStatusCode": 200}	70f76b44-0378-4077-a605-9deedbdbf366	\N	{}
4322b6d9-c63e-4b68-927f-9cd26a58574b	media	image-post1-1920x1080-1920x1080.webp	\N	2025-04-12 16:12:22.783455-04	2025-04-12 16:12:22.783455-04	2025-04-12 16:12:22.783455-04	{"eTag": "\\"9f51af679846f7aee4f5b06203a9cc2f\\"", "size": 15432, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:23.000Z", "contentLength": 15432, "httpStatusCode": 200}	05066789-a8bb-41bd-b16d-10ecc044658b	\N	{}
bb2200a1-7d97-4fbb-b55b-4782df55dc96	media	image-post1-1920x1080-1200x630.webp	\N	2025-04-12 16:12:22.800367-04	2025-04-12 16:12:22.800367-04	2025-04-12 16:12:22.800367-04	{"eTag": "\\"f17c963244c92e14d90320777ad00776\\"", "size": 7908, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:23.000Z", "contentLength": 7908, "httpStatusCode": 200}	f4443c08-c455-4a54-8237-5dbc6374bc80	\N	{}
b269fcd5-b467-4761-baac-99669d55358b	media	image-post1-1920x1080-600x338.webp	\N	2025-04-12 16:12:22.851583-04	2025-04-12 16:12:22.851583-04	2025-04-12 16:12:22.851583-04	{"eTag": "\\"e9aeadcf6c635d0b1e246ccde80bd982\\"", "size": 3584, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:23.000Z", "contentLength": 3584, "httpStatusCode": 200}	f10d0c64-3b92-4a6f-8858-e28eba88d55c	\N	{}
51fe4939-af16-415f-920b-01e1445e5ded	media	image-post3-1920x1080-1400x788.webp	\N	2025-04-12 16:12:49.485716-04	2025-04-12 16:12:49.485716-04	2025-04-12 16:12:49.485716-04	{"eTag": "\\"742a30f9bd6f6a86fea239564d8524fb\\"", "size": 8860, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:50.000Z", "contentLength": 8860, "httpStatusCode": 200}	3b19409e-190d-456d-b046-328bfe1c9ec3	\N	{}
b15ba47e-1092-4bb5-a9cf-89b9175aaf44	media	image-post3-1920x1080-1200x630.webp	\N	2025-04-12 16:12:49.495977-04	2025-04-12 16:12:49.495977-04	2025-04-12 16:12:49.495977-04	{"eTag": "\\"9d90d65d2485ee1cda1bf2214a702271\\"", "size": 6830, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:50.000Z", "contentLength": 6830, "httpStatusCode": 200}	500581f1-add5-4e08-94bf-83da602c8bd0	\N	{}
33193dc4-4d5e-4351-b92b-1d2f454db9f0	media	image-post3-1920x1080-900x506.webp	\N	2025-04-12 16:12:49.511044-04	2025-04-12 16:12:49.511044-04	2025-04-12 16:12:49.511044-04	{"eTag": "\\"f66e36f16507bb2756622657553f5343\\"", "size": 4900, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:50.000Z", "contentLength": 4900, "httpStatusCode": 200}	50936e02-7811-407c-9204-301e25fffb8d	\N	{}
09ae15ef-6de2-4a90-912c-040013979e12	media	image-post3-1920x1080-600x338.webp	\N	2025-04-12 16:12:49.587456-04	2025-04-12 16:12:49.587456-04	2025-04-12 16:12:49.587456-04	{"eTag": "\\"b0a0917ececc9f408156fc20b4dc6f11\\"", "size": 2996, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:50.000Z", "contentLength": 2996, "httpStatusCode": 200}	d76538c8-7d07-47f9-9d7a-46bc993215fb	\N	{}
f4e8ed9c-c40a-48a7-8c87-d593ec42a1c1	media	image-post3-1920x1080-500x500.webp	\N	2025-04-12 16:12:49.676608-04	2025-04-12 16:12:49.676608-04	2025-04-12 16:12:49.676608-04	{"eTag": "\\"97959d2eb497809adf29dcf05af28fcd\\"", "size": 2680, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:50.000Z", "contentLength": 2680, "httpStatusCode": 200}	c323d9ce-e406-4523-96e4-9467e7ae4fbb	\N	{}
91710616-0a81-41dd-9503-0bb57c36d432	media	image-post3-1920x1080-300x169.webp	\N	2025-04-12 16:12:49.676339-04	2025-04-12 16:12:49.676339-04	2025-04-12 16:12:49.676339-04	{"eTag": "\\"b1b9c5e1ff30f8ba22d08f0a8ee083c5\\"", "size": 1228, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:50.000Z", "contentLength": 1228, "httpStatusCode": 200}	23f5def4-ff9f-4562-a22a-94a4701ef3bf	\N	{}
5e535240-e6a0-4573-b06c-76fd20f25f39	media	image-post3-1920x1080.webp	\N	2025-04-12 16:12:49.696131-04	2025-04-12 16:12:49.696131-04	2025-04-12 16:12:49.696131-04	{"eTag": "\\"7b3b506a85a0d4f9c46c10d58ffb4c26\\"", "size": 14006, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:50.000Z", "contentLength": 14006, "httpStatusCode": 200}	eac24c16-880e-4f9f-ad56-48507c050674	\N	{}
34c26f89-189d-491f-a844-2169c0bf1007	media	image-post3-1920x1080-1920x1080.webp	\N	2025-04-12 16:12:49.678095-04	2025-04-12 16:12:49.678095-04	2025-04-12 16:12:49.678095-04	{"eTag": "\\"7b3b506a85a0d4f9c46c10d58ffb4c26\\"", "size": 14006, "mimetype": "image/webp", "cacheControl": "no-cache", "lastModified": "2025-04-12T20:12:50.000Z", "contentLength": 14006, "httpStatusCode": 200}	b3820564-979f-4058-9e19-bfd9e860b313	\N	{}
2bc8631c-3901-432f-80bd-7e82e84936ff	media	video-thumb-600x338.jpg	\N	2025-04-13 18:10:40.211477-04	2025-04-13 18:10:40.211477-04	2025-04-13 18:10:40.211477-04	{"eTag": "\\"bc1167df96f2ed36e76f611716345ee1\\"", "size": 22525, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-13T22:10:41.000Z", "contentLength": 22525, "httpStatusCode": 200}	fc8ad2bb-2f43-40e4-bb2f-339c5901b0b7	\N	{}
bac02138-e1ac-4b85-9ad0-773eb75c6b9c	media	video-thumb.jpg	\N	2025-04-13 18:10:40.245285-04	2025-04-13 18:10:40.245285-04	2025-04-13 18:10:40.245285-04	{"eTag": "\\"008930a810380accd4316276467f8e80\\"", "size": 70087, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-13T22:10:41.000Z", "contentLength": 70087, "httpStatusCode": 200}	e33816f6-21cc-4804-8016-81635f1cb33f	\N	{}
b9a0dac2-7fa8-4d01-bf66-e1b036f889c2	media	video-thumb-1200x630.jpg	\N	2025-04-13 18:10:40.254197-04	2025-04-13 18:10:40.254197-04	2025-04-13 18:10:40.254197-04	{"eTag": "\\"8c8c13afded889cd5246379a72305bf9\\"", "size": 54801, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-13T22:10:41.000Z", "contentLength": 54801, "httpStatusCode": 200}	548003b8-45e9-4c25-bebf-42543edeff78	\N	{}
bd1054f8-54b8-4c5a-8d98-358e760642ab	media	video-thumb-300x169.jpg	\N	2025-04-13 18:10:40.344557-04	2025-04-13 18:10:40.344557-04	2025-04-13 18:10:40.344557-04	{"eTag": "\\"3963f2b9ee53df0d412a33d36c829aed\\"", "size": 8443, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-13T22:10:41.000Z", "contentLength": 8443, "httpStatusCode": 200}	5076bcd8-588a-4322-9000-70319bc235eb	\N	{}
c68010ae-bce8-47a0-bf18-c7bb68d8b8e2	media	video-thumb-500x500.jpg	\N	2025-04-13 18:10:40.408186-04	2025-04-13 18:10:40.408186-04	2025-04-13 18:10:40.408186-04	{"eTag": "\\"3326ae798552eee3876626cf83493ed6\\"", "size": 26947, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-13T22:10:41.000Z", "contentLength": 26947, "httpStatusCode": 200}	891caf1f-e348-4130-972b-2cfc7ae947ab	\N	{}
afc09fed-954d-48c7-9507-46d0dc459609	media	video-thumb-900x506.jpg	\N	2025-04-13 18:10:41.041078-04	2025-04-13 18:10:41.041078-04	2025-04-13 18:10:41.041078-04	{"eTag": "\\"ad0b7af370c24347ceb03fec0608fb5f\\"", "size": 38107, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-04-13T22:10:41.000Z", "contentLength": 38107, "httpStatusCode": 200}	d60944f3-22e0-4805-86ee-24441f7bf14a	\N	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: _pages_v_blocks_archive_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_blocks_archive_id_seq', 153, true);


--
-- Name: _pages_v_blocks_content_columns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_blocks_content_columns_id_seq', 514, true);


--
-- Name: _pages_v_blocks_content_columns_slider_slides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_blocks_content_columns_slider_slides_id_seq', 1, false);


--
-- Name: _pages_v_blocks_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_blocks_content_id_seq', 195, true);


--
-- Name: _pages_v_blocks_cta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_blocks_cta_id_seq', 152, true);


--
-- Name: _pages_v_blocks_cta_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_blocks_cta_links_id_seq', 152, true);


--
-- Name: _pages_v_blocks_form_block_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_blocks_form_block_id_seq', 2, true);


--
-- Name: _pages_v_blocks_media_block_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_blocks_media_block_id_seq', 64, true);


--
-- Name: _pages_v_blocks_slider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_blocks_slider_id_seq', 1, false);


--
-- Name: _pages_v_blocks_slider_slides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_blocks_slider_slides_id_seq', 1, false);


--
-- Name: _pages_v_blocks_works_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_blocks_works_id_seq', 1, false);


--
-- Name: _pages_v_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_id_seq', 50, true);


--
-- Name: _pages_v_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_rels_id_seq', 32, true);


--
-- Name: _pages_v_version_hero_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._pages_v_version_hero_links_id_seq', 287, true);


--
-- Name: _posts_v_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._posts_v_id_seq', 23, true);


--
-- Name: _posts_v_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._posts_v_rels_id_seq', 54, true);


--
-- Name: _posts_v_version_populated_authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._posts_v_version_populated_authors_id_seq', 1, false);


--
-- Name: _works_v_blocks_archive_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_archive_id_seq', 1, false);


--
-- Name: _works_v_blocks_content_columns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_content_columns_id_seq', 1893, true);


--
-- Name: _works_v_blocks_content_columns_slider_slides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_content_columns_slider_slides_id_seq', 1043, true);


--
-- Name: _works_v_blocks_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_content_id_seq', 1221, true);


--
-- Name: _works_v_blocks_cta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_cta_id_seq', 1, false);


--
-- Name: _works_v_blocks_cta_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_cta_links_id_seq', 1, false);


--
-- Name: _works_v_blocks_form_block_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_form_block_id_seq', 1, false);


--
-- Name: _works_v_blocks_media_block_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_media_block_id_seq', 1, false);


--
-- Name: _works_v_blocks_slider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_slider_id_seq', 346, true);


--
-- Name: _works_v_blocks_slider_slides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_slider_slides_id_seq', 1338, true);


--
-- Name: _works_v_blocks_tabs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_tabs_id_seq', 151, true);


--
-- Name: _works_v_blocks_tabs_tabs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_tabs_tabs_id_seq', 304, true);


--
-- Name: _works_v_blocks_tabs_tabs_slider_slides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_tabs_tabs_slider_slides_id_seq', 217, true);


--
-- Name: _works_v_blocks_works_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_blocks_works_id_seq', 1, false);


--
-- Name: _works_v_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_id_seq', 153, true);


--
-- Name: _works_v_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_rels_id_seq', 1728, true);


--
-- Name: _works_v_version_hero_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._works_v_version_hero_links_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 12, true);


--
-- Name: footer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.footer_id_seq', 1, true);


--
-- Name: footer_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.footer_rels_id_seq', 1, false);


--
-- Name: form_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.form_submissions_id_seq', 1, false);


--
-- Name: forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.forms_id_seq', 2, true);


--
-- Name: header_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.header_id_seq', 1, true);


--
-- Name: header_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.header_rels_id_seq', 13, true);


--
-- Name: media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_id_seq', 18, true);


--
-- Name: pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pages_id_seq', 6, true);


--
-- Name: pages_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pages_rels_id_seq', 6, true);


--
-- Name: payload_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payload_jobs_id_seq', 1, false);


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payload_locked_documents_id_seq', 392, true);


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payload_locked_documents_rels_id_seq', 774, true);


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payload_migrations_id_seq', 1, true);


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payload_preferences_id_seq', 35, true);


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payload_preferences_rels_id_seq', 352, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_id_seq', 7, true);


--
-- Name: posts_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_rels_id_seq', 39, true);


--
-- Name: redirects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.redirects_id_seq', 1, true);


--
-- Name: redirects_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.redirects_rels_id_seq', 1, true);


--
-- Name: search_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.search_id_seq', 7, true);


--
-- Name: search_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.search_rels_id_seq', 17, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: works_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.works_id_seq', 6, true);


--
-- Name: works_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.works_rels_id_seq', 218, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: postgres
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_blocks_archive _pages_v_blocks_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_archive
    ADD CONSTRAINT _pages_v_blocks_archive_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_blocks_content_columns _pages_v_blocks_content_columns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_content_columns
    ADD CONSTRAINT _pages_v_blocks_content_columns_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_blocks_content_columns_slider_slides _pages_v_blocks_content_columns_slider_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_content_columns_slider_slides
    ADD CONSTRAINT _pages_v_blocks_content_columns_slider_slides_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_blocks_content _pages_v_blocks_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_content
    ADD CONSTRAINT _pages_v_blocks_content_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_blocks_cta_links _pages_v_blocks_cta_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_cta_links
    ADD CONSTRAINT _pages_v_blocks_cta_links_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_blocks_cta _pages_v_blocks_cta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_cta
    ADD CONSTRAINT _pages_v_blocks_cta_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_blocks_form_block _pages_v_blocks_form_block_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_form_block
    ADD CONSTRAINT _pages_v_blocks_form_block_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_blocks_media_block _pages_v_blocks_media_block_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_media_block
    ADD CONSTRAINT _pages_v_blocks_media_block_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_blocks_slider _pages_v_blocks_slider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_slider
    ADD CONSTRAINT _pages_v_blocks_slider_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_blocks_slider_slides _pages_v_blocks_slider_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_slider_slides
    ADD CONSTRAINT _pages_v_blocks_slider_slides_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_blocks_works _pages_v_blocks_works_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_works
    ADD CONSTRAINT _pages_v_blocks_works_pkey PRIMARY KEY (id);


--
-- Name: _pages_v _pages_v_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v
    ADD CONSTRAINT _pages_v_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_rels _pages_v_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_rels
    ADD CONSTRAINT _pages_v_rels_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_version_hero_links _pages_v_version_hero_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_version_hero_links
    ADD CONSTRAINT _pages_v_version_hero_links_pkey PRIMARY KEY (id);


--
-- Name: _posts_v _posts_v_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v
    ADD CONSTRAINT _posts_v_pkey PRIMARY KEY (id);


--
-- Name: _posts_v_rels _posts_v_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v_rels
    ADD CONSTRAINT _posts_v_rels_pkey PRIMARY KEY (id);


--
-- Name: _posts_v_version_populated_authors _posts_v_version_populated_authors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v_version_populated_authors
    ADD CONSTRAINT _posts_v_version_populated_authors_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_archive _works_v_blocks_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_archive
    ADD CONSTRAINT _works_v_blocks_archive_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_content_columns _works_v_blocks_content_columns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_content_columns
    ADD CONSTRAINT _works_v_blocks_content_columns_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_content_columns_slider_slides _works_v_blocks_content_columns_slider_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_content_columns_slider_slides
    ADD CONSTRAINT _works_v_blocks_content_columns_slider_slides_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_content _works_v_blocks_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_content
    ADD CONSTRAINT _works_v_blocks_content_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_cta_links _works_v_blocks_cta_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_cta_links
    ADD CONSTRAINT _works_v_blocks_cta_links_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_cta _works_v_blocks_cta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_cta
    ADD CONSTRAINT _works_v_blocks_cta_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_form_block _works_v_blocks_form_block_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_form_block
    ADD CONSTRAINT _works_v_blocks_form_block_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_media_block _works_v_blocks_media_block_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_media_block
    ADD CONSTRAINT _works_v_blocks_media_block_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_slider _works_v_blocks_slider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_slider
    ADD CONSTRAINT _works_v_blocks_slider_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_slider_slides _works_v_blocks_slider_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_slider_slides
    ADD CONSTRAINT _works_v_blocks_slider_slides_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_tabs _works_v_blocks_tabs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_tabs
    ADD CONSTRAINT _works_v_blocks_tabs_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_tabs_tabs _works_v_blocks_tabs_tabs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_tabs_tabs
    ADD CONSTRAINT _works_v_blocks_tabs_tabs_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_tabs_tabs_slider_slides _works_v_blocks_tabs_tabs_slider_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_tabs_tabs_slider_slides
    ADD CONSTRAINT _works_v_blocks_tabs_tabs_slider_slides_pkey PRIMARY KEY (id);


--
-- Name: _works_v_blocks_works _works_v_blocks_works_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_works
    ADD CONSTRAINT _works_v_blocks_works_pkey PRIMARY KEY (id);


--
-- Name: _works_v _works_v_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v
    ADD CONSTRAINT _works_v_pkey PRIMARY KEY (id);


--
-- Name: _works_v_rels _works_v_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_rels
    ADD CONSTRAINT _works_v_rels_pkey PRIMARY KEY (id);


--
-- Name: _works_v_version_hero_links _works_v_version_hero_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_version_hero_links
    ADD CONSTRAINT _works_v_version_hero_links_pkey PRIMARY KEY (id);


--
-- Name: categories_breadcrumbs categories_breadcrumbs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories_breadcrumbs
    ADD CONSTRAINT categories_breadcrumbs_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: footer_nav_items footer_nav_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_nav_items
    ADD CONSTRAINT footer_nav_items_pkey PRIMARY KEY (id);


--
-- Name: footer footer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer
    ADD CONSTRAINT footer_pkey PRIMARY KEY (id);


--
-- Name: footer_rels footer_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_rels
    ADD CONSTRAINT footer_rels_pkey PRIMARY KEY (id);


--
-- Name: form_submissions form_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT form_submissions_pkey PRIMARY KEY (id);


--
-- Name: form_submissions_submission_data form_submissions_submission_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_submissions_submission_data
    ADD CONSTRAINT form_submissions_submission_data_pkey PRIMARY KEY (id);


--
-- Name: forms_blocks_checkbox forms_blocks_checkbox_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_checkbox
    ADD CONSTRAINT forms_blocks_checkbox_pkey PRIMARY KEY (id);


--
-- Name: forms_blocks_country forms_blocks_country_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_country
    ADD CONSTRAINT forms_blocks_country_pkey PRIMARY KEY (id);


--
-- Name: forms_blocks_email forms_blocks_email_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_email
    ADD CONSTRAINT forms_blocks_email_pkey PRIMARY KEY (id);


--
-- Name: forms_blocks_message forms_blocks_message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_message
    ADD CONSTRAINT forms_blocks_message_pkey PRIMARY KEY (id);


--
-- Name: forms_blocks_number forms_blocks_number_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_number
    ADD CONSTRAINT forms_blocks_number_pkey PRIMARY KEY (id);


--
-- Name: forms_blocks_select_options forms_blocks_select_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_select_options
    ADD CONSTRAINT forms_blocks_select_options_pkey PRIMARY KEY (id);


--
-- Name: forms_blocks_select forms_blocks_select_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_select
    ADD CONSTRAINT forms_blocks_select_pkey PRIMARY KEY (id);


--
-- Name: forms_blocks_state forms_blocks_state_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_state
    ADD CONSTRAINT forms_blocks_state_pkey PRIMARY KEY (id);


--
-- Name: forms_blocks_text forms_blocks_text_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_text
    ADD CONSTRAINT forms_blocks_text_pkey PRIMARY KEY (id);


--
-- Name: forms_blocks_textarea forms_blocks_textarea_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_textarea
    ADD CONSTRAINT forms_blocks_textarea_pkey PRIMARY KEY (id);


--
-- Name: forms_emails forms_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_emails
    ADD CONSTRAINT forms_emails_pkey PRIMARY KEY (id);


--
-- Name: forms forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_pkey PRIMARY KEY (id);


--
-- Name: header_nav_items header_nav_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.header_nav_items
    ADD CONSTRAINT header_nav_items_pkey PRIMARY KEY (id);


--
-- Name: header header_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.header
    ADD CONSTRAINT header_pkey PRIMARY KEY (id);


--
-- Name: header_rels header_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.header_rels
    ADD CONSTRAINT header_rels_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_archive pages_blocks_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_archive
    ADD CONSTRAINT pages_blocks_archive_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_content_columns pages_blocks_content_columns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_content_columns
    ADD CONSTRAINT pages_blocks_content_columns_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_content_columns_slider_slides pages_blocks_content_columns_slider_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_content_columns_slider_slides
    ADD CONSTRAINT pages_blocks_content_columns_slider_slides_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_content pages_blocks_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_content
    ADD CONSTRAINT pages_blocks_content_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_cta_links pages_blocks_cta_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_cta_links
    ADD CONSTRAINT pages_blocks_cta_links_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_cta pages_blocks_cta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_cta
    ADD CONSTRAINT pages_blocks_cta_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_form_block pages_blocks_form_block_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_form_block
    ADD CONSTRAINT pages_blocks_form_block_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_media_block pages_blocks_media_block_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_media_block
    ADD CONSTRAINT pages_blocks_media_block_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_slider pages_blocks_slider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_slider
    ADD CONSTRAINT pages_blocks_slider_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_slider_slides pages_blocks_slider_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_slider_slides
    ADD CONSTRAINT pages_blocks_slider_slides_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_works pages_blocks_works_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_works
    ADD CONSTRAINT pages_blocks_works_pkey PRIMARY KEY (id);


--
-- Name: pages_hero_links pages_hero_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_hero_links
    ADD CONSTRAINT pages_hero_links_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: pages_rels pages_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_rels
    ADD CONSTRAINT pages_rels_pkey PRIMARY KEY (id);


--
-- Name: payload_jobs_log payload_jobs_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_jobs_log
    ADD CONSTRAINT payload_jobs_log_pkey PRIMARY KEY (id);


--
-- Name: payload_jobs payload_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_jobs
    ADD CONSTRAINT payload_jobs_pkey PRIMARY KEY (id);


--
-- Name: payload_locked_documents payload_locked_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents
    ADD CONSTRAINT payload_locked_documents_pkey PRIMARY KEY (id);


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_pkey PRIMARY KEY (id);


--
-- Name: payload_migrations payload_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_migrations
    ADD CONSTRAINT payload_migrations_pkey PRIMARY KEY (id);


--
-- Name: payload_preferences payload_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_preferences
    ADD CONSTRAINT payload_preferences_pkey PRIMARY KEY (id);


--
-- Name: payload_preferences_rels payload_preferences_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: posts_populated_authors posts_populated_authors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts_populated_authors
    ADD CONSTRAINT posts_populated_authors_pkey PRIMARY KEY (id);


--
-- Name: posts_rels posts_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts_rels
    ADD CONSTRAINT posts_rels_pkey PRIMARY KEY (id);


--
-- Name: redirects redirects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirects
    ADD CONSTRAINT redirects_pkey PRIMARY KEY (id);


--
-- Name: redirects_rels redirects_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirects_rels
    ADD CONSTRAINT redirects_rels_pkey PRIMARY KEY (id);


--
-- Name: search_categories search_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_categories
    ADD CONSTRAINT search_categories_pkey PRIMARY KEY (id);


--
-- Name: search search_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search
    ADD CONSTRAINT search_pkey PRIMARY KEY (id);


--
-- Name: search_rels search_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_rels
    ADD CONSTRAINT search_rels_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_archive works_blocks_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_archive
    ADD CONSTRAINT works_blocks_archive_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_content_columns works_blocks_content_columns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_content_columns
    ADD CONSTRAINT works_blocks_content_columns_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_content_columns_slider_slides works_blocks_content_columns_slider_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_content_columns_slider_slides
    ADD CONSTRAINT works_blocks_content_columns_slider_slides_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_content works_blocks_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_content
    ADD CONSTRAINT works_blocks_content_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_cta_links works_blocks_cta_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_cta_links
    ADD CONSTRAINT works_blocks_cta_links_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_cta works_blocks_cta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_cta
    ADD CONSTRAINT works_blocks_cta_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_form_block works_blocks_form_block_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_form_block
    ADD CONSTRAINT works_blocks_form_block_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_media_block works_blocks_media_block_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_media_block
    ADD CONSTRAINT works_blocks_media_block_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_slider works_blocks_slider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_slider
    ADD CONSTRAINT works_blocks_slider_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_slider_slides works_blocks_slider_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_slider_slides
    ADD CONSTRAINT works_blocks_slider_slides_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_tabs works_blocks_tabs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_tabs
    ADD CONSTRAINT works_blocks_tabs_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_tabs_tabs works_blocks_tabs_tabs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_tabs_tabs
    ADD CONSTRAINT works_blocks_tabs_tabs_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_tabs_tabs_slider_slides works_blocks_tabs_tabs_slider_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_tabs_tabs_slider_slides
    ADD CONSTRAINT works_blocks_tabs_tabs_slider_slides_pkey PRIMARY KEY (id);


--
-- Name: works_blocks_works works_blocks_works_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_works
    ADD CONSTRAINT works_blocks_works_pkey PRIMARY KEY (id);


--
-- Name: works_hero_links works_hero_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_hero_links
    ADD CONSTRAINT works_hero_links_pkey PRIMARY KEY (id);


--
-- Name: works works_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works
    ADD CONSTRAINT works_pkey PRIMARY KEY (id);


--
-- Name: works_rels works_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_rels
    ADD CONSTRAINT works_rels_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: postgres
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: postgres
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: postgres
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: _pages_v_autosave_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_autosave_idx ON public._pages_v USING btree (autosave);


--
-- Name: _pages_v_blocks_archive_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_archive_order_idx ON public._pages_v_blocks_archive USING btree (_order);


--
-- Name: _pages_v_blocks_archive_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_archive_parent_id_idx ON public._pages_v_blocks_archive USING btree (_parent_id);


--
-- Name: _pages_v_blocks_archive_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_archive_path_idx ON public._pages_v_blocks_archive USING btree (_path);


--
-- Name: _pages_v_blocks_content_columns_media_media_media_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_content_columns_media_media_media_idx ON public._pages_v_blocks_content_columns USING btree (media_media_id);


--
-- Name: _pages_v_blocks_content_columns_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_content_columns_order_idx ON public._pages_v_blocks_content_columns USING btree (_order);


--
-- Name: _pages_v_blocks_content_columns_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_content_columns_parent_id_idx ON public._pages_v_blocks_content_columns USING btree (_parent_id);


--
-- Name: _pages_v_blocks_content_columns_slider_slides_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_content_columns_slider_slides_order_idx ON public._pages_v_blocks_content_columns_slider_slides USING btree (_order);


--
-- Name: _pages_v_blocks_content_columns_slider_slides_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_content_columns_slider_slides_parent_id_idx ON public._pages_v_blocks_content_columns_slider_slides USING btree (_parent_id);


--
-- Name: _pages_v_blocks_content_columns_slider_slides_slide_slide_image; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_content_columns_slider_slides_slide_slide_image ON public._pages_v_blocks_content_columns_slider_slides USING btree (slide_image_id);


--
-- Name: _pages_v_blocks_content_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_content_order_idx ON public._pages_v_blocks_content USING btree (_order);


--
-- Name: _pages_v_blocks_content_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_content_parent_id_idx ON public._pages_v_blocks_content USING btree (_parent_id);


--
-- Name: _pages_v_blocks_content_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_content_path_idx ON public._pages_v_blocks_content USING btree (_path);


--
-- Name: _pages_v_blocks_cta_links_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_cta_links_order_idx ON public._pages_v_blocks_cta_links USING btree (_order);


--
-- Name: _pages_v_blocks_cta_links_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_cta_links_parent_id_idx ON public._pages_v_blocks_cta_links USING btree (_parent_id);


--
-- Name: _pages_v_blocks_cta_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_cta_order_idx ON public._pages_v_blocks_cta USING btree (_order);


--
-- Name: _pages_v_blocks_cta_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_cta_parent_id_idx ON public._pages_v_blocks_cta USING btree (_parent_id);


--
-- Name: _pages_v_blocks_cta_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_cta_path_idx ON public._pages_v_blocks_cta USING btree (_path);


--
-- Name: _pages_v_blocks_form_block_form_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_form_block_form_idx ON public._pages_v_blocks_form_block USING btree (form_id);


--
-- Name: _pages_v_blocks_form_block_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_form_block_order_idx ON public._pages_v_blocks_form_block USING btree (_order);


--
-- Name: _pages_v_blocks_form_block_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_form_block_parent_id_idx ON public._pages_v_blocks_form_block USING btree (_parent_id);


--
-- Name: _pages_v_blocks_form_block_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_form_block_path_idx ON public._pages_v_blocks_form_block USING btree (_path);


--
-- Name: _pages_v_blocks_media_block_media_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_media_block_media_idx ON public._pages_v_blocks_media_block USING btree (media_id);


--
-- Name: _pages_v_blocks_media_block_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_media_block_order_idx ON public._pages_v_blocks_media_block USING btree (_order);


--
-- Name: _pages_v_blocks_media_block_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_media_block_parent_id_idx ON public._pages_v_blocks_media_block USING btree (_parent_id);


--
-- Name: _pages_v_blocks_media_block_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_media_block_path_idx ON public._pages_v_blocks_media_block USING btree (_path);


--
-- Name: _pages_v_blocks_slider_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_slider_order_idx ON public._pages_v_blocks_slider USING btree (_order);


--
-- Name: _pages_v_blocks_slider_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_slider_parent_id_idx ON public._pages_v_blocks_slider USING btree (_parent_id);


--
-- Name: _pages_v_blocks_slider_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_slider_path_idx ON public._pages_v_blocks_slider USING btree (_path);


--
-- Name: _pages_v_blocks_slider_slides_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_slider_slides_order_idx ON public._pages_v_blocks_slider_slides USING btree (_order);


--
-- Name: _pages_v_blocks_slider_slides_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_slider_slides_parent_id_idx ON public._pages_v_blocks_slider_slides USING btree (_parent_id);


--
-- Name: _pages_v_blocks_slider_slides_slide_slide_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_slider_slides_slide_slide_image_idx ON public._pages_v_blocks_slider_slides USING btree (slide_image_id);


--
-- Name: _pages_v_blocks_works_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_works_order_idx ON public._pages_v_blocks_works USING btree (_order);


--
-- Name: _pages_v_blocks_works_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_works_parent_id_idx ON public._pages_v_blocks_works USING btree (_parent_id);


--
-- Name: _pages_v_blocks_works_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_blocks_works_path_idx ON public._pages_v_blocks_works USING btree (_path);


--
-- Name: _pages_v_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_created_at_idx ON public._pages_v USING btree (created_at);


--
-- Name: _pages_v_latest_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_latest_idx ON public._pages_v USING btree (latest);


--
-- Name: _pages_v_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_parent_idx ON public._pages_v USING btree (parent_id);


--
-- Name: _pages_v_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_rels_categories_id_idx ON public._pages_v_rels USING btree (categories_id);


--
-- Name: _pages_v_rels_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_rels_order_idx ON public._pages_v_rels USING btree ("order");


--
-- Name: _pages_v_rels_pages_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_rels_pages_id_idx ON public._pages_v_rels USING btree (pages_id);


--
-- Name: _pages_v_rels_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_rels_parent_idx ON public._pages_v_rels USING btree (parent_id);


--
-- Name: _pages_v_rels_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_rels_path_idx ON public._pages_v_rels USING btree (path);


--
-- Name: _pages_v_rels_posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_rels_posts_id_idx ON public._pages_v_rels USING btree (posts_id);


--
-- Name: _pages_v_rels_works_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_rels_works_id_idx ON public._pages_v_rels USING btree (works_id);


--
-- Name: _pages_v_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_updated_at_idx ON public._pages_v USING btree (updated_at);


--
-- Name: _pages_v_version_hero_links_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_version_hero_links_order_idx ON public._pages_v_version_hero_links USING btree (_order);


--
-- Name: _pages_v_version_hero_links_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_version_hero_links_parent_id_idx ON public._pages_v_version_hero_links USING btree (_parent_id);


--
-- Name: _pages_v_version_hero_version_hero_media_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_version_hero_version_hero_media_idx ON public._pages_v USING btree (version_hero_media_id);


--
-- Name: _pages_v_version_meta_version_meta_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_version_meta_version_meta_image_idx ON public._pages_v USING btree (version_meta_image_id);


--
-- Name: _pages_v_version_version__status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_version_version__status_idx ON public._pages_v USING btree (version__status);


--
-- Name: _pages_v_version_version_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_version_version_created_at_idx ON public._pages_v USING btree (version_created_at);


--
-- Name: _pages_v_version_version_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_version_version_slug_idx ON public._pages_v USING btree (version_slug);


--
-- Name: _pages_v_version_version_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _pages_v_version_version_updated_at_idx ON public._pages_v USING btree (version_updated_at);


--
-- Name: _posts_v_autosave_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_autosave_idx ON public._posts_v USING btree (autosave);


--
-- Name: _posts_v_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_created_at_idx ON public._posts_v USING btree (created_at);


--
-- Name: _posts_v_latest_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_latest_idx ON public._posts_v USING btree (latest);


--
-- Name: _posts_v_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_parent_idx ON public._posts_v USING btree (parent_id);


--
-- Name: _posts_v_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_rels_categories_id_idx ON public._posts_v_rels USING btree (categories_id);


--
-- Name: _posts_v_rels_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_rels_order_idx ON public._posts_v_rels USING btree ("order");


--
-- Name: _posts_v_rels_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_rels_parent_idx ON public._posts_v_rels USING btree (parent_id);


--
-- Name: _posts_v_rels_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_rels_path_idx ON public._posts_v_rels USING btree (path);


--
-- Name: _posts_v_rels_posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_rels_posts_id_idx ON public._posts_v_rels USING btree (posts_id);


--
-- Name: _posts_v_rels_users_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_rels_users_id_idx ON public._posts_v_rels USING btree (users_id);


--
-- Name: _posts_v_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_updated_at_idx ON public._posts_v USING btree (updated_at);


--
-- Name: _posts_v_version_meta_version_meta_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_version_meta_version_meta_image_idx ON public._posts_v USING btree (version_meta_image_id);


--
-- Name: _posts_v_version_populated_authors_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_version_populated_authors_order_idx ON public._posts_v_version_populated_authors USING btree (_order);


--
-- Name: _posts_v_version_populated_authors_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_version_populated_authors_parent_id_idx ON public._posts_v_version_populated_authors USING btree (_parent_id);


--
-- Name: _posts_v_version_version__status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_version_version__status_idx ON public._posts_v USING btree (version__status);


--
-- Name: _posts_v_version_version_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_version_version_created_at_idx ON public._posts_v USING btree (version_created_at);


--
-- Name: _posts_v_version_version_hero_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_version_version_hero_image_idx ON public._posts_v USING btree (version_hero_image_id);


--
-- Name: _posts_v_version_version_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_version_version_slug_idx ON public._posts_v USING btree (version_slug);


--
-- Name: _posts_v_version_version_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _posts_v_version_version_updated_at_idx ON public._posts_v USING btree (version_updated_at);


--
-- Name: _works_v_autosave_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_autosave_idx ON public._works_v USING btree (autosave);


--
-- Name: _works_v_blocks_archive_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_archive_order_idx ON public._works_v_blocks_archive USING btree (_order);


--
-- Name: _works_v_blocks_archive_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_archive_parent_id_idx ON public._works_v_blocks_archive USING btree (_parent_id);


--
-- Name: _works_v_blocks_archive_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_archive_path_idx ON public._works_v_blocks_archive USING btree (_path);


--
-- Name: _works_v_blocks_content_columns_media_media_media_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_content_columns_media_media_media_idx ON public._works_v_blocks_content_columns USING btree (media_media_id);


--
-- Name: _works_v_blocks_content_columns_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_content_columns_order_idx ON public._works_v_blocks_content_columns USING btree (_order);


--
-- Name: _works_v_blocks_content_columns_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_content_columns_parent_id_idx ON public._works_v_blocks_content_columns USING btree (_parent_id);


--
-- Name: _works_v_blocks_content_columns_slider_slides_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_content_columns_slider_slides_order_idx ON public._works_v_blocks_content_columns_slider_slides USING btree (_order);


--
-- Name: _works_v_blocks_content_columns_slider_slides_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_content_columns_slider_slides_parent_id_idx ON public._works_v_blocks_content_columns_slider_slides USING btree (_parent_id);


--
-- Name: _works_v_blocks_content_columns_slider_slides_slide_slide_image; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_content_columns_slider_slides_slide_slide_image ON public._works_v_blocks_content_columns_slider_slides USING btree (slide_image_id);


--
-- Name: _works_v_blocks_content_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_content_order_idx ON public._works_v_blocks_content USING btree (_order);


--
-- Name: _works_v_blocks_content_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_content_parent_id_idx ON public._works_v_blocks_content USING btree (_parent_id);


--
-- Name: _works_v_blocks_content_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_content_path_idx ON public._works_v_blocks_content USING btree (_path);


--
-- Name: _works_v_blocks_cta_links_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_cta_links_order_idx ON public._works_v_blocks_cta_links USING btree (_order);


--
-- Name: _works_v_blocks_cta_links_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_cta_links_parent_id_idx ON public._works_v_blocks_cta_links USING btree (_parent_id);


--
-- Name: _works_v_blocks_cta_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_cta_order_idx ON public._works_v_blocks_cta USING btree (_order);


--
-- Name: _works_v_blocks_cta_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_cta_parent_id_idx ON public._works_v_blocks_cta USING btree (_parent_id);


--
-- Name: _works_v_blocks_cta_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_cta_path_idx ON public._works_v_blocks_cta USING btree (_path);


--
-- Name: _works_v_blocks_form_block_form_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_form_block_form_idx ON public._works_v_blocks_form_block USING btree (form_id);


--
-- Name: _works_v_blocks_form_block_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_form_block_order_idx ON public._works_v_blocks_form_block USING btree (_order);


--
-- Name: _works_v_blocks_form_block_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_form_block_parent_id_idx ON public._works_v_blocks_form_block USING btree (_parent_id);


--
-- Name: _works_v_blocks_form_block_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_form_block_path_idx ON public._works_v_blocks_form_block USING btree (_path);


--
-- Name: _works_v_blocks_media_block_media_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_media_block_media_idx ON public._works_v_blocks_media_block USING btree (media_id);


--
-- Name: _works_v_blocks_media_block_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_media_block_order_idx ON public._works_v_blocks_media_block USING btree (_order);


--
-- Name: _works_v_blocks_media_block_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_media_block_parent_id_idx ON public._works_v_blocks_media_block USING btree (_parent_id);


--
-- Name: _works_v_blocks_media_block_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_media_block_path_idx ON public._works_v_blocks_media_block USING btree (_path);


--
-- Name: _works_v_blocks_slider_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_slider_order_idx ON public._works_v_blocks_slider USING btree (_order);


--
-- Name: _works_v_blocks_slider_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_slider_parent_id_idx ON public._works_v_blocks_slider USING btree (_parent_id);


--
-- Name: _works_v_blocks_slider_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_slider_path_idx ON public._works_v_blocks_slider USING btree (_path);


--
-- Name: _works_v_blocks_slider_slides_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_slider_slides_order_idx ON public._works_v_blocks_slider_slides USING btree (_order);


--
-- Name: _works_v_blocks_slider_slides_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_slider_slides_parent_id_idx ON public._works_v_blocks_slider_slides USING btree (_parent_id);


--
-- Name: _works_v_blocks_slider_slides_slide_slide_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_slider_slides_slide_slide_image_idx ON public._works_v_blocks_slider_slides USING btree (slide_image_id);


--
-- Name: _works_v_blocks_tabs_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_tabs_order_idx ON public._works_v_blocks_tabs USING btree (_order);


--
-- Name: _works_v_blocks_tabs_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_tabs_parent_id_idx ON public._works_v_blocks_tabs USING btree (_parent_id);


--
-- Name: _works_v_blocks_tabs_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_tabs_path_idx ON public._works_v_blocks_tabs USING btree (_path);


--
-- Name: _works_v_blocks_tabs_tabs_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_tabs_tabs_order_idx ON public._works_v_blocks_tabs_tabs USING btree (_order);


--
-- Name: _works_v_blocks_tabs_tabs_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_tabs_tabs_parent_id_idx ON public._works_v_blocks_tabs_tabs USING btree (_parent_id);


--
-- Name: _works_v_blocks_tabs_tabs_slider_slides_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_tabs_tabs_slider_slides_order_idx ON public._works_v_blocks_tabs_tabs_slider_slides USING btree (_order);


--
-- Name: _works_v_blocks_tabs_tabs_slider_slides_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_tabs_tabs_slider_slides_parent_id_idx ON public._works_v_blocks_tabs_tabs_slider_slides USING btree (_parent_id);


--
-- Name: _works_v_blocks_tabs_tabs_slider_slides_slide_slide_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_tabs_tabs_slider_slides_slide_slide_image_idx ON public._works_v_blocks_tabs_tabs_slider_slides USING btree (slide_image_id);


--
-- Name: _works_v_blocks_works_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_works_order_idx ON public._works_v_blocks_works USING btree (_order);


--
-- Name: _works_v_blocks_works_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_works_parent_id_idx ON public._works_v_blocks_works USING btree (_parent_id);


--
-- Name: _works_v_blocks_works_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_blocks_works_path_idx ON public._works_v_blocks_works USING btree (_path);


--
-- Name: _works_v_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_created_at_idx ON public._works_v USING btree (created_at);


--
-- Name: _works_v_latest_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_latest_idx ON public._works_v USING btree (latest);


--
-- Name: _works_v_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_parent_idx ON public._works_v USING btree (parent_id);


--
-- Name: _works_v_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_rels_categories_id_idx ON public._works_v_rels USING btree (categories_id);


--
-- Name: _works_v_rels_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_rels_order_idx ON public._works_v_rels USING btree ("order");


--
-- Name: _works_v_rels_pages_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_rels_pages_id_idx ON public._works_v_rels USING btree (pages_id);


--
-- Name: _works_v_rels_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_rels_parent_idx ON public._works_v_rels USING btree (parent_id);


--
-- Name: _works_v_rels_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_rels_path_idx ON public._works_v_rels USING btree (path);


--
-- Name: _works_v_rels_posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_rels_posts_id_idx ON public._works_v_rels USING btree (posts_id);


--
-- Name: _works_v_rels_works_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_rels_works_id_idx ON public._works_v_rels USING btree (works_id);


--
-- Name: _works_v_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_updated_at_idx ON public._works_v USING btree (updated_at);


--
-- Name: _works_v_version_hero_links_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_version_hero_links_order_idx ON public._works_v_version_hero_links USING btree (_order);


--
-- Name: _works_v_version_hero_links_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_version_hero_links_parent_id_idx ON public._works_v_version_hero_links USING btree (_parent_id);


--
-- Name: _works_v_version_hero_version_hero_media_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_version_hero_version_hero_media_idx ON public._works_v USING btree (version_hero_media_id);


--
-- Name: _works_v_version_meta_version_meta_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_version_meta_version_meta_image_idx ON public._works_v USING btree (version_meta_image_id);


--
-- Name: _works_v_version_version__status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_version_version__status_idx ON public._works_v USING btree (version__status);


--
-- Name: _works_v_version_version_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_version_version_created_at_idx ON public._works_v USING btree (version_created_at);


--
-- Name: _works_v_version_version_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_version_version_slug_idx ON public._works_v USING btree (version_slug);


--
-- Name: _works_v_version_version_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX _works_v_version_version_updated_at_idx ON public._works_v USING btree (version_updated_at);


--
-- Name: categories_breadcrumbs_doc_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_breadcrumbs_doc_idx ON public.categories_breadcrumbs USING btree (doc_id);


--
-- Name: categories_breadcrumbs_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_breadcrumbs_order_idx ON public.categories_breadcrumbs USING btree (_order);


--
-- Name: categories_breadcrumbs_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_breadcrumbs_parent_id_idx ON public.categories_breadcrumbs USING btree (_parent_id);


--
-- Name: categories_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_created_at_idx ON public.categories USING btree (created_at);


--
-- Name: categories_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_parent_idx ON public.categories USING btree (parent_id);


--
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- Name: categories_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_updated_at_idx ON public.categories USING btree (updated_at);


--
-- Name: footer_nav_items_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX footer_nav_items_order_idx ON public.footer_nav_items USING btree (_order);


--
-- Name: footer_nav_items_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX footer_nav_items_parent_id_idx ON public.footer_nav_items USING btree (_parent_id);


--
-- Name: footer_rels_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX footer_rels_order_idx ON public.footer_rels USING btree ("order");


--
-- Name: footer_rels_pages_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX footer_rels_pages_id_idx ON public.footer_rels USING btree (pages_id);


--
-- Name: footer_rels_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX footer_rels_parent_idx ON public.footer_rels USING btree (parent_id);


--
-- Name: footer_rels_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX footer_rels_path_idx ON public.footer_rels USING btree (path);


--
-- Name: footer_rels_posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX footer_rels_posts_id_idx ON public.footer_rels USING btree (posts_id);


--
-- Name: form_submissions_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX form_submissions_created_at_idx ON public.form_submissions USING btree (created_at);


--
-- Name: form_submissions_form_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX form_submissions_form_idx ON public.form_submissions USING btree (form_id);


--
-- Name: form_submissions_submission_data_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX form_submissions_submission_data_order_idx ON public.form_submissions_submission_data USING btree (_order);


--
-- Name: form_submissions_submission_data_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX form_submissions_submission_data_parent_id_idx ON public.form_submissions_submission_data USING btree (_parent_id);


--
-- Name: form_submissions_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX form_submissions_updated_at_idx ON public.form_submissions USING btree (updated_at);


--
-- Name: forms_blocks_checkbox_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_checkbox_order_idx ON public.forms_blocks_checkbox USING btree (_order);


--
-- Name: forms_blocks_checkbox_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_checkbox_parent_id_idx ON public.forms_blocks_checkbox USING btree (_parent_id);


--
-- Name: forms_blocks_checkbox_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_checkbox_path_idx ON public.forms_blocks_checkbox USING btree (_path);


--
-- Name: forms_blocks_country_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_country_order_idx ON public.forms_blocks_country USING btree (_order);


--
-- Name: forms_blocks_country_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_country_parent_id_idx ON public.forms_blocks_country USING btree (_parent_id);


--
-- Name: forms_blocks_country_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_country_path_idx ON public.forms_blocks_country USING btree (_path);


--
-- Name: forms_blocks_email_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_email_order_idx ON public.forms_blocks_email USING btree (_order);


--
-- Name: forms_blocks_email_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_email_parent_id_idx ON public.forms_blocks_email USING btree (_parent_id);


--
-- Name: forms_blocks_email_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_email_path_idx ON public.forms_blocks_email USING btree (_path);


--
-- Name: forms_blocks_message_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_message_order_idx ON public.forms_blocks_message USING btree (_order);


--
-- Name: forms_blocks_message_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_message_parent_id_idx ON public.forms_blocks_message USING btree (_parent_id);


--
-- Name: forms_blocks_message_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_message_path_idx ON public.forms_blocks_message USING btree (_path);


--
-- Name: forms_blocks_number_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_number_order_idx ON public.forms_blocks_number USING btree (_order);


--
-- Name: forms_blocks_number_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_number_parent_id_idx ON public.forms_blocks_number USING btree (_parent_id);


--
-- Name: forms_blocks_number_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_number_path_idx ON public.forms_blocks_number USING btree (_path);


--
-- Name: forms_blocks_select_options_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_select_options_order_idx ON public.forms_blocks_select_options USING btree (_order);


--
-- Name: forms_blocks_select_options_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_select_options_parent_id_idx ON public.forms_blocks_select_options USING btree (_parent_id);


--
-- Name: forms_blocks_select_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_select_order_idx ON public.forms_blocks_select USING btree (_order);


--
-- Name: forms_blocks_select_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_select_parent_id_idx ON public.forms_blocks_select USING btree (_parent_id);


--
-- Name: forms_blocks_select_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_select_path_idx ON public.forms_blocks_select USING btree (_path);


--
-- Name: forms_blocks_state_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_state_order_idx ON public.forms_blocks_state USING btree (_order);


--
-- Name: forms_blocks_state_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_state_parent_id_idx ON public.forms_blocks_state USING btree (_parent_id);


--
-- Name: forms_blocks_state_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_state_path_idx ON public.forms_blocks_state USING btree (_path);


--
-- Name: forms_blocks_text_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_text_order_idx ON public.forms_blocks_text USING btree (_order);


--
-- Name: forms_blocks_text_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_text_parent_id_idx ON public.forms_blocks_text USING btree (_parent_id);


--
-- Name: forms_blocks_text_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_text_path_idx ON public.forms_blocks_text USING btree (_path);


--
-- Name: forms_blocks_textarea_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_textarea_order_idx ON public.forms_blocks_textarea USING btree (_order);


--
-- Name: forms_blocks_textarea_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_textarea_parent_id_idx ON public.forms_blocks_textarea USING btree (_parent_id);


--
-- Name: forms_blocks_textarea_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_blocks_textarea_path_idx ON public.forms_blocks_textarea USING btree (_path);


--
-- Name: forms_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_created_at_idx ON public.forms USING btree (created_at);


--
-- Name: forms_emails_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_emails_order_idx ON public.forms_emails USING btree (_order);


--
-- Name: forms_emails_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_emails_parent_id_idx ON public.forms_emails USING btree (_parent_id);


--
-- Name: forms_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forms_updated_at_idx ON public.forms USING btree (updated_at);


--
-- Name: header_nav_items_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX header_nav_items_order_idx ON public.header_nav_items USING btree (_order);


--
-- Name: header_nav_items_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX header_nav_items_parent_id_idx ON public.header_nav_items USING btree (_parent_id);


--
-- Name: header_rels_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX header_rels_order_idx ON public.header_rels USING btree ("order");


--
-- Name: header_rels_pages_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX header_rels_pages_id_idx ON public.header_rels USING btree (pages_id);


--
-- Name: header_rels_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX header_rels_parent_idx ON public.header_rels USING btree (parent_id);


--
-- Name: header_rels_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX header_rels_path_idx ON public.header_rels USING btree (path);


--
-- Name: header_rels_posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX header_rels_posts_id_idx ON public.header_rels USING btree (posts_id);


--
-- Name: media_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_created_at_idx ON public.media USING btree (created_at);


--
-- Name: media_filename_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX media_filename_idx ON public.media USING btree (filename);


--
-- Name: media_sizes_large_sizes_large_filename_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_sizes_large_sizes_large_filename_idx ON public.media USING btree (sizes_large_filename);


--
-- Name: media_sizes_medium_sizes_medium_filename_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_sizes_medium_sizes_medium_filename_idx ON public.media USING btree (sizes_medium_filename);


--
-- Name: media_sizes_og_sizes_og_filename_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_sizes_og_sizes_og_filename_idx ON public.media USING btree (sizes_og_filename);


--
-- Name: media_sizes_small_sizes_small_filename_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_sizes_small_sizes_small_filename_idx ON public.media USING btree (sizes_small_filename);


--
-- Name: media_sizes_square_sizes_square_filename_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_sizes_square_sizes_square_filename_idx ON public.media USING btree (sizes_square_filename);


--
-- Name: media_sizes_thumbnail_sizes_thumbnail_filename_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_sizes_thumbnail_sizes_thumbnail_filename_idx ON public.media USING btree (sizes_thumbnail_filename);


--
-- Name: media_sizes_xlarge_sizes_xlarge_filename_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_sizes_xlarge_sizes_xlarge_filename_idx ON public.media USING btree (sizes_xlarge_filename);


--
-- Name: media_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_updated_at_idx ON public.media USING btree (updated_at);


--
-- Name: pages__status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages__status_idx ON public.pages USING btree (_status);


--
-- Name: pages_blocks_archive_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_archive_order_idx ON public.pages_blocks_archive USING btree (_order);


--
-- Name: pages_blocks_archive_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_archive_parent_id_idx ON public.pages_blocks_archive USING btree (_parent_id);


--
-- Name: pages_blocks_archive_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_archive_path_idx ON public.pages_blocks_archive USING btree (_path);


--
-- Name: pages_blocks_content_columns_media_media_media_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_content_columns_media_media_media_idx ON public.pages_blocks_content_columns USING btree (media_media_id);


--
-- Name: pages_blocks_content_columns_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_content_columns_order_idx ON public.pages_blocks_content_columns USING btree (_order);


--
-- Name: pages_blocks_content_columns_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_content_columns_parent_id_idx ON public.pages_blocks_content_columns USING btree (_parent_id);


--
-- Name: pages_blocks_content_columns_slider_slides_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_content_columns_slider_slides_order_idx ON public.pages_blocks_content_columns_slider_slides USING btree (_order);


--
-- Name: pages_blocks_content_columns_slider_slides_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_content_columns_slider_slides_parent_id_idx ON public.pages_blocks_content_columns_slider_slides USING btree (_parent_id);


--
-- Name: pages_blocks_content_columns_slider_slides_slide_slide_image_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_content_columns_slider_slides_slide_slide_image_id ON public.pages_blocks_content_columns_slider_slides USING btree (slide_image_id);


--
-- Name: pages_blocks_content_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_content_order_idx ON public.pages_blocks_content USING btree (_order);


--
-- Name: pages_blocks_content_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_content_parent_id_idx ON public.pages_blocks_content USING btree (_parent_id);


--
-- Name: pages_blocks_content_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_content_path_idx ON public.pages_blocks_content USING btree (_path);


--
-- Name: pages_blocks_cta_links_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_cta_links_order_idx ON public.pages_blocks_cta_links USING btree (_order);


--
-- Name: pages_blocks_cta_links_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_cta_links_parent_id_idx ON public.pages_blocks_cta_links USING btree (_parent_id);


--
-- Name: pages_blocks_cta_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_cta_order_idx ON public.pages_blocks_cta USING btree (_order);


--
-- Name: pages_blocks_cta_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_cta_parent_id_idx ON public.pages_blocks_cta USING btree (_parent_id);


--
-- Name: pages_blocks_cta_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_cta_path_idx ON public.pages_blocks_cta USING btree (_path);


--
-- Name: pages_blocks_form_block_form_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_form_block_form_idx ON public.pages_blocks_form_block USING btree (form_id);


--
-- Name: pages_blocks_form_block_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_form_block_order_idx ON public.pages_blocks_form_block USING btree (_order);


--
-- Name: pages_blocks_form_block_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_form_block_parent_id_idx ON public.pages_blocks_form_block USING btree (_parent_id);


--
-- Name: pages_blocks_form_block_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_form_block_path_idx ON public.pages_blocks_form_block USING btree (_path);


--
-- Name: pages_blocks_media_block_media_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_media_block_media_idx ON public.pages_blocks_media_block USING btree (media_id);


--
-- Name: pages_blocks_media_block_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_media_block_order_idx ON public.pages_blocks_media_block USING btree (_order);


--
-- Name: pages_blocks_media_block_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_media_block_parent_id_idx ON public.pages_blocks_media_block USING btree (_parent_id);


--
-- Name: pages_blocks_media_block_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_media_block_path_idx ON public.pages_blocks_media_block USING btree (_path);


--
-- Name: pages_blocks_slider_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_slider_order_idx ON public.pages_blocks_slider USING btree (_order);


--
-- Name: pages_blocks_slider_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_slider_parent_id_idx ON public.pages_blocks_slider USING btree (_parent_id);


--
-- Name: pages_blocks_slider_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_slider_path_idx ON public.pages_blocks_slider USING btree (_path);


--
-- Name: pages_blocks_slider_slides_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_slider_slides_order_idx ON public.pages_blocks_slider_slides USING btree (_order);


--
-- Name: pages_blocks_slider_slides_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_slider_slides_parent_id_idx ON public.pages_blocks_slider_slides USING btree (_parent_id);


--
-- Name: pages_blocks_slider_slides_slide_slide_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_slider_slides_slide_slide_image_idx ON public.pages_blocks_slider_slides USING btree (slide_image_id);


--
-- Name: pages_blocks_works_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_works_order_idx ON public.pages_blocks_works USING btree (_order);


--
-- Name: pages_blocks_works_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_works_parent_id_idx ON public.pages_blocks_works USING btree (_parent_id);


--
-- Name: pages_blocks_works_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_blocks_works_path_idx ON public.pages_blocks_works USING btree (_path);


--
-- Name: pages_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_created_at_idx ON public.pages USING btree (created_at);


--
-- Name: pages_hero_hero_media_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_hero_hero_media_idx ON public.pages USING btree (hero_media_id);


--
-- Name: pages_hero_links_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_hero_links_order_idx ON public.pages_hero_links USING btree (_order);


--
-- Name: pages_hero_links_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_hero_links_parent_id_idx ON public.pages_hero_links USING btree (_parent_id);


--
-- Name: pages_meta_meta_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_meta_meta_image_idx ON public.pages USING btree (meta_image_id);


--
-- Name: pages_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_rels_categories_id_idx ON public.pages_rels USING btree (categories_id);


--
-- Name: pages_rels_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_rels_order_idx ON public.pages_rels USING btree ("order");


--
-- Name: pages_rels_pages_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_rels_pages_id_idx ON public.pages_rels USING btree (pages_id);


--
-- Name: pages_rels_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_rels_parent_idx ON public.pages_rels USING btree (parent_id);


--
-- Name: pages_rels_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_rels_path_idx ON public.pages_rels USING btree (path);


--
-- Name: pages_rels_posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_rels_posts_id_idx ON public.pages_rels USING btree (posts_id);


--
-- Name: pages_rels_works_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_rels_works_id_idx ON public.pages_rels USING btree (works_id);


--
-- Name: pages_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_slug_idx ON public.pages USING btree (slug);


--
-- Name: pages_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_updated_at_idx ON public.pages USING btree (updated_at);


--
-- Name: payload_jobs_completed_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_jobs_completed_at_idx ON public.payload_jobs USING btree (completed_at);


--
-- Name: payload_jobs_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_jobs_created_at_idx ON public.payload_jobs USING btree (created_at);


--
-- Name: payload_jobs_has_error_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_jobs_has_error_idx ON public.payload_jobs USING btree (has_error);


--
-- Name: payload_jobs_log_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_jobs_log_order_idx ON public.payload_jobs_log USING btree (_order);


--
-- Name: payload_jobs_log_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_jobs_log_parent_id_idx ON public.payload_jobs_log USING btree (_parent_id);


--
-- Name: payload_jobs_processing_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_jobs_processing_idx ON public.payload_jobs USING btree (processing);


--
-- Name: payload_jobs_queue_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_jobs_queue_idx ON public.payload_jobs USING btree (queue);


--
-- Name: payload_jobs_task_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_jobs_task_slug_idx ON public.payload_jobs USING btree (task_slug);


--
-- Name: payload_jobs_total_tried_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_jobs_total_tried_idx ON public.payload_jobs USING btree (total_tried);


--
-- Name: payload_jobs_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_jobs_updated_at_idx ON public.payload_jobs USING btree (updated_at);


--
-- Name: payload_jobs_wait_until_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_jobs_wait_until_idx ON public.payload_jobs USING btree (wait_until);


--
-- Name: payload_locked_documents_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_created_at_idx ON public.payload_locked_documents USING btree (created_at);


--
-- Name: payload_locked_documents_global_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_global_slug_idx ON public.payload_locked_documents USING btree (global_slug);


--
-- Name: payload_locked_documents_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_categories_id_idx ON public.payload_locked_documents_rels USING btree (categories_id);


--
-- Name: payload_locked_documents_rels_form_submissions_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_form_submissions_id_idx ON public.payload_locked_documents_rels USING btree (form_submissions_id);


--
-- Name: payload_locked_documents_rels_forms_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_forms_id_idx ON public.payload_locked_documents_rels USING btree (forms_id);


--
-- Name: payload_locked_documents_rels_media_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_media_id_idx ON public.payload_locked_documents_rels USING btree (media_id);


--
-- Name: payload_locked_documents_rels_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_order_idx ON public.payload_locked_documents_rels USING btree ("order");


--
-- Name: payload_locked_documents_rels_pages_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_pages_id_idx ON public.payload_locked_documents_rels USING btree (pages_id);


--
-- Name: payload_locked_documents_rels_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_parent_idx ON public.payload_locked_documents_rels USING btree (parent_id);


--
-- Name: payload_locked_documents_rels_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_path_idx ON public.payload_locked_documents_rels USING btree (path);


--
-- Name: payload_locked_documents_rels_payload_jobs_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_payload_jobs_id_idx ON public.payload_locked_documents_rels USING btree (payload_jobs_id);


--
-- Name: payload_locked_documents_rels_posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_posts_id_idx ON public.payload_locked_documents_rels USING btree (posts_id);


--
-- Name: payload_locked_documents_rels_redirects_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_redirects_id_idx ON public.payload_locked_documents_rels USING btree (redirects_id);


--
-- Name: payload_locked_documents_rels_search_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_search_id_idx ON public.payload_locked_documents_rels USING btree (search_id);


--
-- Name: payload_locked_documents_rels_users_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_users_id_idx ON public.payload_locked_documents_rels USING btree (users_id);


--
-- Name: payload_locked_documents_rels_works_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_rels_works_id_idx ON public.payload_locked_documents_rels USING btree (works_id);


--
-- Name: payload_locked_documents_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_locked_documents_updated_at_idx ON public.payload_locked_documents USING btree (updated_at);


--
-- Name: payload_migrations_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_migrations_created_at_idx ON public.payload_migrations USING btree (created_at);


--
-- Name: payload_migrations_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_migrations_updated_at_idx ON public.payload_migrations USING btree (updated_at);


--
-- Name: payload_preferences_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_preferences_created_at_idx ON public.payload_preferences USING btree (created_at);


--
-- Name: payload_preferences_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_preferences_key_idx ON public.payload_preferences USING btree (key);


--
-- Name: payload_preferences_rels_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_preferences_rels_order_idx ON public.payload_preferences_rels USING btree ("order");


--
-- Name: payload_preferences_rels_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_preferences_rels_parent_idx ON public.payload_preferences_rels USING btree (parent_id);


--
-- Name: payload_preferences_rels_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_preferences_rels_path_idx ON public.payload_preferences_rels USING btree (path);


--
-- Name: payload_preferences_rels_users_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_preferences_rels_users_id_idx ON public.payload_preferences_rels USING btree (users_id);


--
-- Name: payload_preferences_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payload_preferences_updated_at_idx ON public.payload_preferences USING btree (updated_at);


--
-- Name: posts__status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts__status_idx ON public.posts USING btree (_status);


--
-- Name: posts_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_created_at_idx ON public.posts USING btree (created_at);


--
-- Name: posts_hero_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_hero_image_idx ON public.posts USING btree (hero_image_id);


--
-- Name: posts_meta_meta_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_meta_meta_image_idx ON public.posts USING btree (meta_image_id);


--
-- Name: posts_populated_authors_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_populated_authors_order_idx ON public.posts_populated_authors USING btree (_order);


--
-- Name: posts_populated_authors_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_populated_authors_parent_id_idx ON public.posts_populated_authors USING btree (_parent_id);


--
-- Name: posts_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_rels_categories_id_idx ON public.posts_rels USING btree (categories_id);


--
-- Name: posts_rels_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_rels_order_idx ON public.posts_rels USING btree ("order");


--
-- Name: posts_rels_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_rels_parent_idx ON public.posts_rels USING btree (parent_id);


--
-- Name: posts_rels_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_rels_path_idx ON public.posts_rels USING btree (path);


--
-- Name: posts_rels_posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_rels_posts_id_idx ON public.posts_rels USING btree (posts_id);


--
-- Name: posts_rels_users_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_rels_users_id_idx ON public.posts_rels USING btree (users_id);


--
-- Name: posts_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_slug_idx ON public.posts USING btree (slug);


--
-- Name: posts_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_updated_at_idx ON public.posts USING btree (updated_at);


--
-- Name: redirects_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX redirects_created_at_idx ON public.redirects USING btree (created_at);


--
-- Name: redirects_from_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX redirects_from_idx ON public.redirects USING btree ("from");


--
-- Name: redirects_rels_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX redirects_rels_order_idx ON public.redirects_rels USING btree ("order");


--
-- Name: redirects_rels_pages_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX redirects_rels_pages_id_idx ON public.redirects_rels USING btree (pages_id);


--
-- Name: redirects_rels_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX redirects_rels_parent_idx ON public.redirects_rels USING btree (parent_id);


--
-- Name: redirects_rels_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX redirects_rels_path_idx ON public.redirects_rels USING btree (path);


--
-- Name: redirects_rels_posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX redirects_rels_posts_id_idx ON public.redirects_rels USING btree (posts_id);


--
-- Name: redirects_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX redirects_updated_at_idx ON public.redirects USING btree (updated_at);


--
-- Name: search_categories_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX search_categories_order_idx ON public.search_categories USING btree (_order);


--
-- Name: search_categories_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX search_categories_parent_id_idx ON public.search_categories USING btree (_parent_id);


--
-- Name: search_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX search_created_at_idx ON public.search USING btree (created_at);


--
-- Name: search_meta_meta_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX search_meta_meta_image_idx ON public.search USING btree (meta_image_id);


--
-- Name: search_rels_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX search_rels_order_idx ON public.search_rels USING btree ("order");


--
-- Name: search_rels_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX search_rels_parent_idx ON public.search_rels USING btree (parent_id);


--
-- Name: search_rels_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX search_rels_path_idx ON public.search_rels USING btree (path);


--
-- Name: search_rels_posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX search_rels_posts_id_idx ON public.search_rels USING btree (posts_id);


--
-- Name: search_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX search_slug_idx ON public.search USING btree (slug);


--
-- Name: search_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX search_updated_at_idx ON public.search USING btree (updated_at);


--
-- Name: users_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_created_at_idx ON public.users USING btree (created_at);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_updated_at_idx ON public.users USING btree (updated_at);


--
-- Name: works__status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works__status_idx ON public.works USING btree (_status);


--
-- Name: works_blocks_archive_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_archive_order_idx ON public.works_blocks_archive USING btree (_order);


--
-- Name: works_blocks_archive_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_archive_parent_id_idx ON public.works_blocks_archive USING btree (_parent_id);


--
-- Name: works_blocks_archive_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_archive_path_idx ON public.works_blocks_archive USING btree (_path);


--
-- Name: works_blocks_content_columns_media_media_media_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_content_columns_media_media_media_idx ON public.works_blocks_content_columns USING btree (media_media_id);


--
-- Name: works_blocks_content_columns_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_content_columns_order_idx ON public.works_blocks_content_columns USING btree (_order);


--
-- Name: works_blocks_content_columns_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_content_columns_parent_id_idx ON public.works_blocks_content_columns USING btree (_parent_id);


--
-- Name: works_blocks_content_columns_slider_slides_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_content_columns_slider_slides_order_idx ON public.works_blocks_content_columns_slider_slides USING btree (_order);


--
-- Name: works_blocks_content_columns_slider_slides_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_content_columns_slider_slides_parent_id_idx ON public.works_blocks_content_columns_slider_slides USING btree (_parent_id);


--
-- Name: works_blocks_content_columns_slider_slides_slide_slide_image_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_content_columns_slider_slides_slide_slide_image_id ON public.works_blocks_content_columns_slider_slides USING btree (slide_image_id);


--
-- Name: works_blocks_content_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_content_order_idx ON public.works_blocks_content USING btree (_order);


--
-- Name: works_blocks_content_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_content_parent_id_idx ON public.works_blocks_content USING btree (_parent_id);


--
-- Name: works_blocks_content_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_content_path_idx ON public.works_blocks_content USING btree (_path);


--
-- Name: works_blocks_cta_links_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_cta_links_order_idx ON public.works_blocks_cta_links USING btree (_order);


--
-- Name: works_blocks_cta_links_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_cta_links_parent_id_idx ON public.works_blocks_cta_links USING btree (_parent_id);


--
-- Name: works_blocks_cta_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_cta_order_idx ON public.works_blocks_cta USING btree (_order);


--
-- Name: works_blocks_cta_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_cta_parent_id_idx ON public.works_blocks_cta USING btree (_parent_id);


--
-- Name: works_blocks_cta_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_cta_path_idx ON public.works_blocks_cta USING btree (_path);


--
-- Name: works_blocks_form_block_form_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_form_block_form_idx ON public.works_blocks_form_block USING btree (form_id);


--
-- Name: works_blocks_form_block_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_form_block_order_idx ON public.works_blocks_form_block USING btree (_order);


--
-- Name: works_blocks_form_block_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_form_block_parent_id_idx ON public.works_blocks_form_block USING btree (_parent_id);


--
-- Name: works_blocks_form_block_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_form_block_path_idx ON public.works_blocks_form_block USING btree (_path);


--
-- Name: works_blocks_media_block_media_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_media_block_media_idx ON public.works_blocks_media_block USING btree (media_id);


--
-- Name: works_blocks_media_block_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_media_block_order_idx ON public.works_blocks_media_block USING btree (_order);


--
-- Name: works_blocks_media_block_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_media_block_parent_id_idx ON public.works_blocks_media_block USING btree (_parent_id);


--
-- Name: works_blocks_media_block_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_media_block_path_idx ON public.works_blocks_media_block USING btree (_path);


--
-- Name: works_blocks_slider_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_slider_order_idx ON public.works_blocks_slider USING btree (_order);


--
-- Name: works_blocks_slider_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_slider_parent_id_idx ON public.works_blocks_slider USING btree (_parent_id);


--
-- Name: works_blocks_slider_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_slider_path_idx ON public.works_blocks_slider USING btree (_path);


--
-- Name: works_blocks_slider_slides_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_slider_slides_order_idx ON public.works_blocks_slider_slides USING btree (_order);


--
-- Name: works_blocks_slider_slides_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_slider_slides_parent_id_idx ON public.works_blocks_slider_slides USING btree (_parent_id);


--
-- Name: works_blocks_slider_slides_slide_slide_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_slider_slides_slide_slide_image_idx ON public.works_blocks_slider_slides USING btree (slide_image_id);


--
-- Name: works_blocks_tabs_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_tabs_order_idx ON public.works_blocks_tabs USING btree (_order);


--
-- Name: works_blocks_tabs_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_tabs_parent_id_idx ON public.works_blocks_tabs USING btree (_parent_id);


--
-- Name: works_blocks_tabs_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_tabs_path_idx ON public.works_blocks_tabs USING btree (_path);


--
-- Name: works_blocks_tabs_tabs_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_tabs_tabs_order_idx ON public.works_blocks_tabs_tabs USING btree (_order);


--
-- Name: works_blocks_tabs_tabs_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_tabs_tabs_parent_id_idx ON public.works_blocks_tabs_tabs USING btree (_parent_id);


--
-- Name: works_blocks_tabs_tabs_slider_slides_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_tabs_tabs_slider_slides_order_idx ON public.works_blocks_tabs_tabs_slider_slides USING btree (_order);


--
-- Name: works_blocks_tabs_tabs_slider_slides_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_tabs_tabs_slider_slides_parent_id_idx ON public.works_blocks_tabs_tabs_slider_slides USING btree (_parent_id);


--
-- Name: works_blocks_tabs_tabs_slider_slides_slide_slide_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_tabs_tabs_slider_slides_slide_slide_image_idx ON public.works_blocks_tabs_tabs_slider_slides USING btree (slide_image_id);


--
-- Name: works_blocks_works_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_works_order_idx ON public.works_blocks_works USING btree (_order);


--
-- Name: works_blocks_works_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_works_parent_id_idx ON public.works_blocks_works USING btree (_parent_id);


--
-- Name: works_blocks_works_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_blocks_works_path_idx ON public.works_blocks_works USING btree (_path);


--
-- Name: works_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_created_at_idx ON public.works USING btree (created_at);


--
-- Name: works_hero_hero_media_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_hero_hero_media_idx ON public.works USING btree (hero_media_id);


--
-- Name: works_hero_links_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_hero_links_order_idx ON public.works_hero_links USING btree (_order);


--
-- Name: works_hero_links_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_hero_links_parent_id_idx ON public.works_hero_links USING btree (_parent_id);


--
-- Name: works_meta_meta_image_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_meta_meta_image_idx ON public.works USING btree (meta_image_id);


--
-- Name: works_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_rels_categories_id_idx ON public.works_rels USING btree (categories_id);


--
-- Name: works_rels_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_rels_order_idx ON public.works_rels USING btree ("order");


--
-- Name: works_rels_pages_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_rels_pages_id_idx ON public.works_rels USING btree (pages_id);


--
-- Name: works_rels_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_rels_parent_idx ON public.works_rels USING btree (parent_id);


--
-- Name: works_rels_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_rels_path_idx ON public.works_rels USING btree (path);


--
-- Name: works_rels_posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_rels_posts_id_idx ON public.works_rels USING btree (posts_id);


--
-- Name: works_rels_works_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_rels_works_id_idx ON public.works_rels USING btree (works_id);


--
-- Name: works_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_slug_idx ON public.works USING btree (slug);


--
-- Name: works_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_updated_at_idx ON public.works USING btree (updated_at);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: postgres
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: postgres
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: postgres
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: postgres
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: _pages_v_blocks_archive _pages_v_blocks_archive_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_archive
    ADD CONSTRAINT _pages_v_blocks_archive_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;


--
-- Name: _pages_v_blocks_content_columns _pages_v_blocks_content_columns_media_media_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_content_columns
    ADD CONSTRAINT _pages_v_blocks_content_columns_media_media_id_media_id_fk FOREIGN KEY (media_media_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _pages_v_blocks_content_columns _pages_v_blocks_content_columns_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_content_columns
    ADD CONSTRAINT _pages_v_blocks_content_columns_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v_blocks_content(id) ON DELETE CASCADE;


--
-- Name: _pages_v_blocks_content_columns_slider_slides _pages_v_blocks_content_columns_slider_slides_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_content_columns_slider_slides
    ADD CONSTRAINT _pages_v_blocks_content_columns_slider_slides_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v_blocks_content_columns(id) ON DELETE CASCADE;


--
-- Name: _pages_v_blocks_content_columns_slider_slides _pages_v_blocks_content_columns_slider_slides_slide_image_id_me; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_content_columns_slider_slides
    ADD CONSTRAINT _pages_v_blocks_content_columns_slider_slides_slide_image_id_me FOREIGN KEY (slide_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _pages_v_blocks_content _pages_v_blocks_content_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_content
    ADD CONSTRAINT _pages_v_blocks_content_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;


--
-- Name: _pages_v_blocks_cta_links _pages_v_blocks_cta_links_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_cta_links
    ADD CONSTRAINT _pages_v_blocks_cta_links_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v_blocks_cta(id) ON DELETE CASCADE;


--
-- Name: _pages_v_blocks_cta _pages_v_blocks_cta_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_cta
    ADD CONSTRAINT _pages_v_blocks_cta_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;


--
-- Name: _pages_v_blocks_form_block _pages_v_blocks_form_block_form_id_forms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_form_block
    ADD CONSTRAINT _pages_v_blocks_form_block_form_id_forms_id_fk FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE SET NULL;


--
-- Name: _pages_v_blocks_form_block _pages_v_blocks_form_block_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_form_block
    ADD CONSTRAINT _pages_v_blocks_form_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;


--
-- Name: _pages_v_blocks_media_block _pages_v_blocks_media_block_media_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_media_block
    ADD CONSTRAINT _pages_v_blocks_media_block_media_id_media_id_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _pages_v_blocks_media_block _pages_v_blocks_media_block_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_media_block
    ADD CONSTRAINT _pages_v_blocks_media_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;


--
-- Name: _pages_v_blocks_slider _pages_v_blocks_slider_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_slider
    ADD CONSTRAINT _pages_v_blocks_slider_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;


--
-- Name: _pages_v_blocks_slider_slides _pages_v_blocks_slider_slides_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_slider_slides
    ADD CONSTRAINT _pages_v_blocks_slider_slides_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v_blocks_slider(id) ON DELETE CASCADE;


--
-- Name: _pages_v_blocks_slider_slides _pages_v_blocks_slider_slides_slide_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_slider_slides
    ADD CONSTRAINT _pages_v_blocks_slider_slides_slide_image_id_media_id_fk FOREIGN KEY (slide_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _pages_v_blocks_works _pages_v_blocks_works_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_blocks_works
    ADD CONSTRAINT _pages_v_blocks_works_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;


--
-- Name: _pages_v _pages_v_parent_id_pages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v
    ADD CONSTRAINT _pages_v_parent_id_pages_id_fk FOREIGN KEY (parent_id) REFERENCES public.pages(id) ON DELETE SET NULL;


--
-- Name: _pages_v_rels _pages_v_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_rels
    ADD CONSTRAINT _pages_v_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: _pages_v_rels _pages_v_rels_pages_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_rels
    ADD CONSTRAINT _pages_v_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: _pages_v_rels _pages_v_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_rels
    ADD CONSTRAINT _pages_v_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;


--
-- Name: _pages_v_rels _pages_v_rels_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_rels
    ADD CONSTRAINT _pages_v_rels_posts_fk FOREIGN KEY (posts_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: _pages_v_rels _pages_v_rels_works_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_rels
    ADD CONSTRAINT _pages_v_rels_works_fk FOREIGN KEY (works_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: _pages_v_version_hero_links _pages_v_version_hero_links_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v_version_hero_links
    ADD CONSTRAINT _pages_v_version_hero_links_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;


--
-- Name: _pages_v _pages_v_version_hero_media_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v
    ADD CONSTRAINT _pages_v_version_hero_media_id_media_id_fk FOREIGN KEY (version_hero_media_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _pages_v _pages_v_version_meta_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._pages_v
    ADD CONSTRAINT _pages_v_version_meta_image_id_media_id_fk FOREIGN KEY (version_meta_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _posts_v _posts_v_parent_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v
    ADD CONSTRAINT _posts_v_parent_id_posts_id_fk FOREIGN KEY (parent_id) REFERENCES public.posts(id) ON DELETE SET NULL;


--
-- Name: _posts_v_rels _posts_v_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v_rels
    ADD CONSTRAINT _posts_v_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: _posts_v_rels _posts_v_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v_rels
    ADD CONSTRAINT _posts_v_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public._posts_v(id) ON DELETE CASCADE;


--
-- Name: _posts_v_rels _posts_v_rels_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v_rels
    ADD CONSTRAINT _posts_v_rels_posts_fk FOREIGN KEY (posts_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: _posts_v_rels _posts_v_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v_rels
    ADD CONSTRAINT _posts_v_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: _posts_v _posts_v_version_hero_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v
    ADD CONSTRAINT _posts_v_version_hero_image_id_media_id_fk FOREIGN KEY (version_hero_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _posts_v _posts_v_version_meta_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v
    ADD CONSTRAINT _posts_v_version_meta_image_id_media_id_fk FOREIGN KEY (version_meta_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _posts_v_version_populated_authors _posts_v_version_populated_authors_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posts_v_version_populated_authors
    ADD CONSTRAINT _posts_v_version_populated_authors_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._posts_v(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_archive _works_v_blocks_archive_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_archive
    ADD CONSTRAINT _works_v_blocks_archive_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_content_columns _works_v_blocks_content_columns_media_media_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_content_columns
    ADD CONSTRAINT _works_v_blocks_content_columns_media_media_id_media_id_fk FOREIGN KEY (media_media_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _works_v_blocks_content_columns _works_v_blocks_content_columns_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_content_columns
    ADD CONSTRAINT _works_v_blocks_content_columns_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v_blocks_content(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_content_columns_slider_slides _works_v_blocks_content_columns_slider_slides_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_content_columns_slider_slides
    ADD CONSTRAINT _works_v_blocks_content_columns_slider_slides_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v_blocks_content_columns(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_content_columns_slider_slides _works_v_blocks_content_columns_slider_slides_slide_image_id_me; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_content_columns_slider_slides
    ADD CONSTRAINT _works_v_blocks_content_columns_slider_slides_slide_image_id_me FOREIGN KEY (slide_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _works_v_blocks_content _works_v_blocks_content_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_content
    ADD CONSTRAINT _works_v_blocks_content_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_cta_links _works_v_blocks_cta_links_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_cta_links
    ADD CONSTRAINT _works_v_blocks_cta_links_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v_blocks_cta(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_cta _works_v_blocks_cta_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_cta
    ADD CONSTRAINT _works_v_blocks_cta_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_form_block _works_v_blocks_form_block_form_id_forms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_form_block
    ADD CONSTRAINT _works_v_blocks_form_block_form_id_forms_id_fk FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE SET NULL;


--
-- Name: _works_v_blocks_form_block _works_v_blocks_form_block_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_form_block
    ADD CONSTRAINT _works_v_blocks_form_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_media_block _works_v_blocks_media_block_media_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_media_block
    ADD CONSTRAINT _works_v_blocks_media_block_media_id_media_id_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _works_v_blocks_media_block _works_v_blocks_media_block_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_media_block
    ADD CONSTRAINT _works_v_blocks_media_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_slider _works_v_blocks_slider_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_slider
    ADD CONSTRAINT _works_v_blocks_slider_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_slider_slides _works_v_blocks_slider_slides_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_slider_slides
    ADD CONSTRAINT _works_v_blocks_slider_slides_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v_blocks_slider(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_slider_slides _works_v_blocks_slider_slides_slide_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_slider_slides
    ADD CONSTRAINT _works_v_blocks_slider_slides_slide_image_id_media_id_fk FOREIGN KEY (slide_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _works_v_blocks_tabs _works_v_blocks_tabs_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_tabs
    ADD CONSTRAINT _works_v_blocks_tabs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_tabs_tabs _works_v_blocks_tabs_tabs_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_tabs_tabs
    ADD CONSTRAINT _works_v_blocks_tabs_tabs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v_blocks_tabs(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_tabs_tabs_slider_slides _works_v_blocks_tabs_tabs_slider_slides_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_tabs_tabs_slider_slides
    ADD CONSTRAINT _works_v_blocks_tabs_tabs_slider_slides_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v_blocks_tabs_tabs(id) ON DELETE CASCADE;


--
-- Name: _works_v_blocks_tabs_tabs_slider_slides _works_v_blocks_tabs_tabs_slider_slides_slide_image_id_media_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_tabs_tabs_slider_slides
    ADD CONSTRAINT _works_v_blocks_tabs_tabs_slider_slides_slide_image_id_media_id FOREIGN KEY (slide_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _works_v_blocks_works _works_v_blocks_works_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_blocks_works
    ADD CONSTRAINT _works_v_blocks_works_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v(id) ON DELETE CASCADE;


--
-- Name: _works_v _works_v_parent_id_works_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v
    ADD CONSTRAINT _works_v_parent_id_works_id_fk FOREIGN KEY (parent_id) REFERENCES public.works(id) ON DELETE SET NULL;


--
-- Name: _works_v_rels _works_v_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_rels
    ADD CONSTRAINT _works_v_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: _works_v_rels _works_v_rels_pages_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_rels
    ADD CONSTRAINT _works_v_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: _works_v_rels _works_v_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_rels
    ADD CONSTRAINT _works_v_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public._works_v(id) ON DELETE CASCADE;


--
-- Name: _works_v_rels _works_v_rels_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_rels
    ADD CONSTRAINT _works_v_rels_posts_fk FOREIGN KEY (posts_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: _works_v_rels _works_v_rels_works_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_rels
    ADD CONSTRAINT _works_v_rels_works_fk FOREIGN KEY (works_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: _works_v_version_hero_links _works_v_version_hero_links_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v_version_hero_links
    ADD CONSTRAINT _works_v_version_hero_links_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._works_v(id) ON DELETE CASCADE;


--
-- Name: _works_v _works_v_version_hero_media_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v
    ADD CONSTRAINT _works_v_version_hero_media_id_media_id_fk FOREIGN KEY (version_hero_media_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _works_v _works_v_version_meta_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._works_v
    ADD CONSTRAINT _works_v_version_meta_image_id_media_id_fk FOREIGN KEY (version_meta_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: categories_breadcrumbs categories_breadcrumbs_doc_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories_breadcrumbs
    ADD CONSTRAINT categories_breadcrumbs_doc_id_categories_id_fk FOREIGN KEY (doc_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: categories_breadcrumbs categories_breadcrumbs_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories_breadcrumbs
    ADD CONSTRAINT categories_breadcrumbs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_categories_id_fk FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: footer_nav_items footer_nav_items_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_nav_items
    ADD CONSTRAINT footer_nav_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.footer(id) ON DELETE CASCADE;


--
-- Name: footer_rels footer_rels_pages_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_rels
    ADD CONSTRAINT footer_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: footer_rels footer_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_rels
    ADD CONSTRAINT footer_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.footer(id) ON DELETE CASCADE;


--
-- Name: footer_rels footer_rels_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_rels
    ADD CONSTRAINT footer_rels_posts_fk FOREIGN KEY (posts_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: form_submissions form_submissions_form_id_forms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT form_submissions_form_id_forms_id_fk FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE SET NULL;


--
-- Name: form_submissions_submission_data form_submissions_submission_data_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_submissions_submission_data
    ADD CONSTRAINT form_submissions_submission_data_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.form_submissions(id) ON DELETE CASCADE;


--
-- Name: forms_blocks_checkbox forms_blocks_checkbox_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_checkbox
    ADD CONSTRAINT forms_blocks_checkbox_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: forms_blocks_country forms_blocks_country_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_country
    ADD CONSTRAINT forms_blocks_country_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: forms_blocks_email forms_blocks_email_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_email
    ADD CONSTRAINT forms_blocks_email_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: forms_blocks_message forms_blocks_message_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_message
    ADD CONSTRAINT forms_blocks_message_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: forms_blocks_number forms_blocks_number_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_number
    ADD CONSTRAINT forms_blocks_number_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: forms_blocks_select_options forms_blocks_select_options_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_select_options
    ADD CONSTRAINT forms_blocks_select_options_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.forms_blocks_select(id) ON DELETE CASCADE;


--
-- Name: forms_blocks_select forms_blocks_select_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_select
    ADD CONSTRAINT forms_blocks_select_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: forms_blocks_state forms_blocks_state_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_state
    ADD CONSTRAINT forms_blocks_state_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: forms_blocks_text forms_blocks_text_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_text
    ADD CONSTRAINT forms_blocks_text_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: forms_blocks_textarea forms_blocks_textarea_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_blocks_textarea
    ADD CONSTRAINT forms_blocks_textarea_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: forms_emails forms_emails_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms_emails
    ADD CONSTRAINT forms_emails_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: header_nav_items header_nav_items_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.header_nav_items
    ADD CONSTRAINT header_nav_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.header(id) ON DELETE CASCADE;


--
-- Name: header_rels header_rels_pages_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.header_rels
    ADD CONSTRAINT header_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: header_rels header_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.header_rels
    ADD CONSTRAINT header_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.header(id) ON DELETE CASCADE;


--
-- Name: header_rels header_rels_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.header_rels
    ADD CONSTRAINT header_rels_posts_fk FOREIGN KEY (posts_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_archive pages_blocks_archive_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_archive
    ADD CONSTRAINT pages_blocks_archive_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_content_columns pages_blocks_content_columns_media_media_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_content_columns
    ADD CONSTRAINT pages_blocks_content_columns_media_media_id_media_id_fk FOREIGN KEY (media_media_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_blocks_content_columns pages_blocks_content_columns_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_content_columns
    ADD CONSTRAINT pages_blocks_content_columns_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_content(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_content_columns_slider_slides pages_blocks_content_columns_slider_slides_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_content_columns_slider_slides
    ADD CONSTRAINT pages_blocks_content_columns_slider_slides_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_content_columns(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_content_columns_slider_slides pages_blocks_content_columns_slider_slides_slide_image_id_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_content_columns_slider_slides
    ADD CONSTRAINT pages_blocks_content_columns_slider_slides_slide_image_id_media FOREIGN KEY (slide_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_blocks_content pages_blocks_content_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_content
    ADD CONSTRAINT pages_blocks_content_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_cta_links pages_blocks_cta_links_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_cta_links
    ADD CONSTRAINT pages_blocks_cta_links_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_cta(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_cta pages_blocks_cta_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_cta
    ADD CONSTRAINT pages_blocks_cta_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_form_block pages_blocks_form_block_form_id_forms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_form_block
    ADD CONSTRAINT pages_blocks_form_block_form_id_forms_id_fk FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE SET NULL;


--
-- Name: pages_blocks_form_block pages_blocks_form_block_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_form_block
    ADD CONSTRAINT pages_blocks_form_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_media_block pages_blocks_media_block_media_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_media_block
    ADD CONSTRAINT pages_blocks_media_block_media_id_media_id_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_blocks_media_block pages_blocks_media_block_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_media_block
    ADD CONSTRAINT pages_blocks_media_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_slider pages_blocks_slider_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_slider
    ADD CONSTRAINT pages_blocks_slider_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_slider_slides pages_blocks_slider_slides_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_slider_slides
    ADD CONSTRAINT pages_blocks_slider_slides_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_slider(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_slider_slides pages_blocks_slider_slides_slide_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_slider_slides
    ADD CONSTRAINT pages_blocks_slider_slides_slide_image_id_media_id_fk FOREIGN KEY (slide_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_blocks_works pages_blocks_works_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_blocks_works
    ADD CONSTRAINT pages_blocks_works_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_hero_links pages_hero_links_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_hero_links
    ADD CONSTRAINT pages_hero_links_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages pages_hero_media_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_hero_media_id_media_id_fk FOREIGN KEY (hero_media_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages pages_meta_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_meta_image_id_media_id_fk FOREIGN KEY (meta_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_rels pages_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_rels
    ADD CONSTRAINT pages_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: pages_rels pages_rels_pages_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_rels
    ADD CONSTRAINT pages_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_rels pages_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_rels
    ADD CONSTRAINT pages_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_rels pages_rels_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_rels
    ADD CONSTRAINT pages_rels_posts_fk FOREIGN KEY (posts_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: pages_rels pages_rels_works_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages_rels
    ADD CONSTRAINT pages_rels_works_fk FOREIGN KEY (works_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: payload_jobs_log payload_jobs_log_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_jobs_log
    ADD CONSTRAINT payload_jobs_log_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.payload_jobs(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_form_submissions_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_form_submissions_fk FOREIGN KEY (form_submissions_id) REFERENCES public.form_submissions(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_forms_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_forms_fk FOREIGN KEY (forms_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_media_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_pages_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_locked_documents(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_payload_jobs_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_payload_jobs_fk FOREIGN KEY (payload_jobs_id) REFERENCES public.payload_jobs(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_posts_fk FOREIGN KEY (posts_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_redirects_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_redirects_fk FOREIGN KEY (redirects_id) REFERENCES public.redirects(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_search_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_search_fk FOREIGN KEY (search_id) REFERENCES public.search(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_works_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_works_fk FOREIGN KEY (works_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_preferences(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_hero_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_hero_image_id_media_id_fk FOREIGN KEY (hero_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: posts posts_meta_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_meta_image_id_media_id_fk FOREIGN KEY (meta_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: posts_populated_authors posts_populated_authors_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts_populated_authors
    ADD CONSTRAINT posts_populated_authors_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: posts_rels posts_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts_rels
    ADD CONSTRAINT posts_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: posts_rels posts_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts_rels
    ADD CONSTRAINT posts_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: posts_rels posts_rels_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts_rels
    ADD CONSTRAINT posts_rels_posts_fk FOREIGN KEY (posts_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: posts_rels posts_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts_rels
    ADD CONSTRAINT posts_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: redirects_rels redirects_rels_pages_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirects_rels
    ADD CONSTRAINT redirects_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: redirects_rels redirects_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirects_rels
    ADD CONSTRAINT redirects_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.redirects(id) ON DELETE CASCADE;


--
-- Name: redirects_rels redirects_rels_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirects_rels
    ADD CONSTRAINT redirects_rels_posts_fk FOREIGN KEY (posts_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: search_categories search_categories_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_categories
    ADD CONSTRAINT search_categories_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.search(id) ON DELETE CASCADE;


--
-- Name: search search_meta_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search
    ADD CONSTRAINT search_meta_image_id_media_id_fk FOREIGN KEY (meta_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: search_rels search_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_rels
    ADD CONSTRAINT search_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.search(id) ON DELETE CASCADE;


--
-- Name: search_rels search_rels_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_rels
    ADD CONSTRAINT search_rels_posts_fk FOREIGN KEY (posts_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: works_blocks_archive works_blocks_archive_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_archive
    ADD CONSTRAINT works_blocks_archive_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: works_blocks_content_columns works_blocks_content_columns_media_media_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_content_columns
    ADD CONSTRAINT works_blocks_content_columns_media_media_id_media_id_fk FOREIGN KEY (media_media_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: works_blocks_content_columns works_blocks_content_columns_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_content_columns
    ADD CONSTRAINT works_blocks_content_columns_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works_blocks_content(id) ON DELETE CASCADE;


--
-- Name: works_blocks_content_columns_slider_slides works_blocks_content_columns_slider_slides_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_content_columns_slider_slides
    ADD CONSTRAINT works_blocks_content_columns_slider_slides_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works_blocks_content_columns(id) ON DELETE CASCADE;


--
-- Name: works_blocks_content_columns_slider_slides works_blocks_content_columns_slider_slides_slide_image_id_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_content_columns_slider_slides
    ADD CONSTRAINT works_blocks_content_columns_slider_slides_slide_image_id_media FOREIGN KEY (slide_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: works_blocks_content works_blocks_content_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_content
    ADD CONSTRAINT works_blocks_content_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: works_blocks_cta_links works_blocks_cta_links_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_cta_links
    ADD CONSTRAINT works_blocks_cta_links_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works_blocks_cta(id) ON DELETE CASCADE;


--
-- Name: works_blocks_cta works_blocks_cta_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_cta
    ADD CONSTRAINT works_blocks_cta_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: works_blocks_form_block works_blocks_form_block_form_id_forms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_form_block
    ADD CONSTRAINT works_blocks_form_block_form_id_forms_id_fk FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE SET NULL;


--
-- Name: works_blocks_form_block works_blocks_form_block_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_form_block
    ADD CONSTRAINT works_blocks_form_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: works_blocks_media_block works_blocks_media_block_media_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_media_block
    ADD CONSTRAINT works_blocks_media_block_media_id_media_id_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: works_blocks_media_block works_blocks_media_block_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_media_block
    ADD CONSTRAINT works_blocks_media_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: works_blocks_slider works_blocks_slider_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_slider
    ADD CONSTRAINT works_blocks_slider_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: works_blocks_slider_slides works_blocks_slider_slides_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_slider_slides
    ADD CONSTRAINT works_blocks_slider_slides_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works_blocks_slider(id) ON DELETE CASCADE;


--
-- Name: works_blocks_slider_slides works_blocks_slider_slides_slide_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_slider_slides
    ADD CONSTRAINT works_blocks_slider_slides_slide_image_id_media_id_fk FOREIGN KEY (slide_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: works_blocks_tabs works_blocks_tabs_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_tabs
    ADD CONSTRAINT works_blocks_tabs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: works_blocks_tabs_tabs works_blocks_tabs_tabs_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_tabs_tabs
    ADD CONSTRAINT works_blocks_tabs_tabs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works_blocks_tabs(id) ON DELETE CASCADE;


--
-- Name: works_blocks_tabs_tabs_slider_slides works_blocks_tabs_tabs_slider_slides_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_tabs_tabs_slider_slides
    ADD CONSTRAINT works_blocks_tabs_tabs_slider_slides_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works_blocks_tabs_tabs(id) ON DELETE CASCADE;


--
-- Name: works_blocks_tabs_tabs_slider_slides works_blocks_tabs_tabs_slider_slides_slide_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_tabs_tabs_slider_slides
    ADD CONSTRAINT works_blocks_tabs_tabs_slider_slides_slide_image_id_media_id_fk FOREIGN KEY (slide_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: works_blocks_works works_blocks_works_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_blocks_works
    ADD CONSTRAINT works_blocks_works_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: works_hero_links works_hero_links_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_hero_links
    ADD CONSTRAINT works_hero_links_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: works works_hero_media_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works
    ADD CONSTRAINT works_hero_media_id_media_id_fk FOREIGN KEY (hero_media_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: works works_meta_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works
    ADD CONSTRAINT works_meta_image_id_media_id_fk FOREIGN KEY (meta_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: works_rels works_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_rels
    ADD CONSTRAINT works_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: works_rels works_rels_pages_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_rels
    ADD CONSTRAINT works_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: works_rels works_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_rels
    ADD CONSTRAINT works_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: works_rels works_rels_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_rels
    ADD CONSTRAINT works_rels_posts_fk FOREIGN KEY (posts_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: works_rels works_rels_works_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_rels
    ADD CONSTRAINT works_rels_works_fk FOREIGN KEY (works_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: postgres
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: postgres
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO postgres;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO postgres;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO postgres;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO postgres;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO postgres;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO postgres;

--
-- PostgreSQL database dump complete
--

