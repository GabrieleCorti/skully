import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// RTL only auto-cleans when test globals are enabled; this project imports them explicitly.
afterEach(cleanup)
