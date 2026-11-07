import { setupWorker } from 'msw/browser'
import { payment } from './handlers'

export const worker = setupWorker(...payment)