import { setProjectAnnotations } from '@storybook/nextjs-vite'
import { beforeAll } from 'vitest'

import * as projectAnnotations from './preview'

// Apply Storybook project-level annotations (decorators, parameters, loaders)
// to portable stories executed by the Vitest addon.
const project = setProjectAnnotations([projectAnnotations])

beforeAll(project.beforeAll)
