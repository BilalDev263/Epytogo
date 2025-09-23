import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Prisma
jest.mock('./src/db/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  place: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  reservation: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}))

// Mock Google Maps API
global.google = {
  maps: {
    Map: jest.fn(() => ({})),
    Marker: jest.fn(() => ({})),
    InfoWindow: jest.fn(() => ({})),
    places: {
      PlacesService: jest.fn(() => ({
        findPlaceFromQuery: jest.fn(),
        getDetails: jest.fn(),
        nearbySearch: jest.fn(),
      })),
    },
  },
}

// Mock environment variables
process.env = {
  ...process.env,
  GOOGLE_PLACES_API_KEY: 'test-api-key',
  GOOGLE_GEMINI_API_KEY: 'test-gemini-key',
  DATABASE_URL: 'test-database-url',
  NEXTAUTH_SECRET: 'test-secret',
  NEXTAUTH_URL: 'http://localhost:3000',
}

// Mock fetch for API calls
global.fetch = jest.fn()

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})