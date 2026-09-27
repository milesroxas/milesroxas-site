import { FolderTypeField as FolderTypeField_2b8867833a34864a02ddf429b0728a40 } from '@payloadcms/next/client'
import {
  CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1,
  FolderField as FolderField_f9c02e79a4aed9a3924487c0cd4cafb1,
  FolderTableCell as FolderTableCell_f9c02e79a4aed9a3924487c0cd4cafb1,
} from '@payloadcms/next/rsc'
import {
  LinkToDoc as LinkToDoc_aead06e4cbf6b2620c5c51c9ab283634,
  ReindexButton as ReindexButton_aead06e4cbf6b2620c5c51c9ab283634,
} from '@payloadcms/plugin-search/client'
import {
  MetaDescriptionComponent as MetaDescriptionComponent_a8a977ebc872c5d5ea7ee689724c0860,
  MetaImageComponent as MetaImageComponent_a8a977ebc872c5d5ea7ee689724c0860,
  MetaTitleComponent as MetaTitleComponent_a8a977ebc872c5d5ea7ee689724c0860,
  OverviewComponent as OverviewComponent_a8a977ebc872c5d5ea7ee689724c0860,
  PreviewComponent as PreviewComponent_a8a977ebc872c5d5ea7ee689724c0860,
} from '@payloadcms/plugin-seo/client'
import {
  BlocksFeatureClient as BlocksFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  BoldFeatureClient as BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  FixedToolbarFeatureClient as FixedToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  HeadingFeatureClient as HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  HorizontalRuleFeatureClient as HorizontalRuleFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  InlineToolbarFeatureClient as InlineToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ItalicFeatureClient as ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  LinkFeatureClient as LinkFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ParagraphFeatureClient as ParagraphFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  UnderlineFeatureClient as UnderlineFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
} from '@payloadcms/richtext-lexical/client'
import {
  LexicalDiffComponent as LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e,
  RscEntryLexicalCell as RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e,
  RscEntryLexicalField as RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e,
} from '@payloadcms/richtext-lexical/rsc'
import { VercelBlobClientUploadHandler as VercelBlobClientUploadHandler_16c82c5e25f430251a3e3ba57219ff4e } from '@payloadcms/storage-vercel-blob/client'
import { default as default_8a7ab0eb7ab5c511aba12e68480bfe5e } from '@/components/BeforeLogin'
import { SlugComponent as SlugComponent_92cc057d0a2abb4f6cf0307edf59f986 } from '@/fields/slug/SlugComponent'
import { RowLabel as RowLabel_ec255a65fa6fa8d1faeb09cf35284224 } from '@/Header/RowLabel'
import { History as History_4be2a5fde2810193c74b9d93c9793bbd } from '@/plugins/streak-studio/components/History'
import { Inspector as Inspector_c908c334a499ea35a5af24c62f06c61c } from '@/plugins/streak-studio/components/Inspector'
import { PublishButton as PublishButton_5a35448d00732a2cb070b7da7922d784 } from '@/plugins/streak-studio/components/PublishButton'
import { Stage as Stage_7b45ac79883b0d422de0bee16320128f } from '@/plugins/streak-studio/components/Stage'
import { Thumbnail as Thumbnail_4f6b75b91ac41b6260620bec0703da81 } from '@/plugins/streak-studio/components/Thumbnail'
import { Usage as Usage_5e194be06d689c8c93729d21ad0b750b } from '@/plugins/streak-studio/components/Usage'

/** @type import('payload').ImportMap */
export const importMap = {
  '@payloadcms/richtext-lexical/rsc#RscEntryLexicalCell':
    RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e,
  '@payloadcms/richtext-lexical/rsc#RscEntryLexicalField':
    RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e,
  '@payloadcms/richtext-lexical/rsc#LexicalDiffComponent':
    LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e,
  '@payloadcms/richtext-lexical/client#InlineToolbarFeatureClient':
    InlineToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#FixedToolbarFeatureClient':
    FixedToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#HeadingFeatureClient':
    HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#ParagraphFeatureClient':
    ParagraphFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#UnderlineFeatureClient':
    UnderlineFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#BoldFeatureClient':
    BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#ItalicFeatureClient':
    ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#LinkFeatureClient':
    LinkFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#BlocksFeatureClient':
    BlocksFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/plugin-seo/client#OverviewComponent':
    OverviewComponent_a8a977ebc872c5d5ea7ee689724c0860,
  '@payloadcms/plugin-seo/client#MetaTitleComponent':
    MetaTitleComponent_a8a977ebc872c5d5ea7ee689724c0860,
  '@payloadcms/plugin-seo/client#MetaImageComponent':
    MetaImageComponent_a8a977ebc872c5d5ea7ee689724c0860,
  '@payloadcms/plugin-seo/client#MetaDescriptionComponent':
    MetaDescriptionComponent_a8a977ebc872c5d5ea7ee689724c0860,
  '@payloadcms/plugin-seo/client#PreviewComponent':
    PreviewComponent_a8a977ebc872c5d5ea7ee689724c0860,
  '@/fields/slug/SlugComponent#SlugComponent': SlugComponent_92cc057d0a2abb4f6cf0307edf59f986,
  '@payloadcms/richtext-lexical/client#HorizontalRuleFeatureClient':
    HorizontalRuleFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/next/rsc#FolderTableCell': FolderTableCell_f9c02e79a4aed9a3924487c0cd4cafb1,
  '@payloadcms/next/rsc#FolderField': FolderField_f9c02e79a4aed9a3924487c0cd4cafb1,
  '@/plugins/streak-studio/components/Stage#Stage': Stage_7b45ac79883b0d422de0bee16320128f,
  '@/plugins/streak-studio/components/Thumbnail#Thumbnail':
    Thumbnail_4f6b75b91ac41b6260620bec0703da81,
  '@/plugins/streak-studio/components/Usage#Usage': Usage_5e194be06d689c8c93729d21ad0b750b,
  '@/plugins/streak-studio/components/History#History': History_4be2a5fde2810193c74b9d93c9793bbd,
  '@/plugins/streak-studio/components/Inspector#Inspector':
    Inspector_c908c334a499ea35a5af24c62f06c61c,
  '@/plugins/streak-studio/components/PublishButton#PublishButton':
    PublishButton_5a35448d00732a2cb070b7da7922d784,
  '@payloadcms/plugin-search/client#LinkToDoc': LinkToDoc_aead06e4cbf6b2620c5c51c9ab283634,
  '@payloadcms/plugin-search/client#ReindexButton': ReindexButton_aead06e4cbf6b2620c5c51c9ab283634,
  '@payloadcms/next/client#FolderTypeField': FolderTypeField_2b8867833a34864a02ddf429b0728a40,
  '@/Header/RowLabel#RowLabel': RowLabel_ec255a65fa6fa8d1faeb09cf35284224,
  '@/components/BeforeLogin#default': default_8a7ab0eb7ab5c511aba12e68480bfe5e,
  '@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler':
    VercelBlobClientUploadHandler_16c82c5e25f430251a3e3ba57219ff4e,
  '@payloadcms/next/rsc#CollectionCards': CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1,
}
