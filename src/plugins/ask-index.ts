import type { CollectionConfig, GlobalConfig, Plugin } from 'payload'
import {
  askIndexAfterChange,
  askIndexAfterDelete,
  askIndexGlobalAfterChange,
} from '@/features/ask/indexSync'
import { globalSurfaceBySlug, surfaceByCollection } from '@/shared/content/surfaces'

/**
 * Attaches the Ask RAG embedding-sync hooks to every public content surface
 * and the global surfaces (Site Info). Which documents participate is decided
 * by the shared surface registry — adding a surface there wires it into the
 * embedding index automatically. sas-site also re-embeds pages when their
 * Content Hub record changes; this site has no hub.
 */
export const askIndexPlugin = (): Plugin => (config) => {
  const withHooks = (collection: CollectionConfig): CollectionConfig => {
    const surface = surfaceByCollection.get(collection.slug)
    if (surface) {
      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          afterChange: [...(collection.hooks?.afterChange ?? []), askIndexAfterChange(surface)],
          afterDelete: [...(collection.hooks?.afterDelete ?? []), askIndexAfterDelete(surface)],
        },
      }
    }

    return collection
  }

  const withGlobalHooks = (global: GlobalConfig): GlobalConfig => {
    const surface = globalSurfaceBySlug.get(global.slug)
    if (!surface) return global
    return {
      ...global,
      hooks: {
        ...global.hooks,
        afterChange: [...(global.hooks?.afterChange ?? []), askIndexGlobalAfterChange(surface)],
      },
    }
  }

  return {
    ...config,
    collections: (config.collections ?? []).map(withHooks),
    globals: (config.globals ?? []).map(withGlobalHooks),
  }
}
