import React from 'react'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
})

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: vi.fn(),
})

const createQueryMock = () => {
  const result = { data: [], error: null }
  const query: any = {
    select: vi.fn(() => query),
    insert: vi.fn(() => query),
    update: vi.fn(() => query),
    upsert: vi.fn(() => query),
    delete: vi.fn(() => query),
    eq: vi.fn(() => query),
    neq: vi.fn(() => query),
    in: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn(() => query),
    single: vi.fn(async () => ({ data: null, error: null })),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    then: (onFulfilled: (value: typeof result) => unknown, onRejected?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
    catch: (onRejected: (reason: unknown) => unknown) => Promise.resolve(result).catch(onRejected),
    finally: (onFinally: () => void) => Promise.resolve(result).finally(onFinally),
  }

  return query
}

const createSupabaseMock = () => ({
  auth: {
    signOut: vi.fn(async () => ({ error: null })),
    signInWithPassword: vi.fn(async () => ({ error: null })),
    getUser: vi.fn(async () => ({ data: { user: { id: 'test-user' } }, error: null })),
  },
  from: vi.fn(() => createQueryMock()),
  rpc: vi.fn(async () => ({ data: null, error: null })),
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => createSupabaseMock(),
}))

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(async () => undefined),
  back: vi.fn(),
  forward: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) =>
    React.createElement('a', { href: typeof href === 'string' ? href : '#', ...props }, children),
}))

vi.mock('@web3icons/react', () => ({
  tokenIcons: {},
}))

vi.mock('react-day-picker', () => ({
  DayPicker: ({ children }: any) => React.createElement('div', { 'data-testid': 'day-picker' }, children),
}))

vi.mock('recharts', () => {
  const chartComponent = (name: string) => {
    const Comp = ({ children }: any) => React.createElement('div', { 'data-testid': name }, children)
    Comp.displayName = name
    return Comp
  }

  return {
    ResponsiveContainer: chartComponent('ResponsiveContainer'),
    AreaChart: chartComponent('AreaChart'),
    Area: chartComponent('Area'),
    XAxis: chartComponent('XAxis'),
    YAxis: chartComponent('YAxis'),
    CartesianGrid: chartComponent('CartesianGrid'),
    Tooltip: chartComponent('Tooltip'),
    Legend: chartComponent('Legend'),
    PieChart: chartComponent('PieChart'),
    Pie: chartComponent('Pie'),
    Cell: chartComponent('Cell'),
    LineChart: chartComponent('LineChart'),
    Line: chartComponent('Line'),
  }
})
