import { authenticatedOr } from './authenticatedOr'

export const authenticatedOrPublished = authenticatedOr({
  _status: {
    equals: 'published',
  },
})
