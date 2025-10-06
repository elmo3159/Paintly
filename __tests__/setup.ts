import '@testing-library/jest-dom'

// Request/Response ポリフィル（node-fetchのES moduleエラーを回避）
class MockRequest {
  constructor(public url: string, public init?: RequestInit) {}
}

class MockResponse {
  constructor(public body: any, public init?: ResponseInit) {}

  static json(data: any) {
    return Promise.resolve(data)
  }

  json() {
    return Promise.resolve(this.body)
  }

  text() {
    return Promise.resolve(JSON.stringify(this.body))
  }
}

class MockHeaders {
  private headers: Map<string, string> = new Map()

  constructor(init?: HeadersInit) {
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.headers.set(key, value))
      } else if (init instanceof Headers) {
        init.forEach((value, key) => this.headers.set(key, value))
      } else {
        Object.entries(init).forEach(([key, value]) => this.headers.set(key, value))
      }
    }
  }

  get(name: string) {
    return this.headers.get(name) || null
  }

  set(name: string, value: string) {
    this.headers.set(name, value)
  }

  has(name: string) {
    return this.headers.has(name)
  }

  delete(name: string) {
    this.headers.delete(name)
  }

  forEach(callback: (value: string, key: string) => void) {
    this.headers.forEach(callback)
  }
}

global.Request = MockRequest as any
global.Response = MockResponse as any
global.Headers = MockHeaders as any

// DOM環境のセットアップ
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// IntersectionObserver のモック
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// ResizeObserver のモック
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// fetch のモック
global.fetch = jest.fn()

// console エラーを抑制（テスト時のノイズ削減）
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})