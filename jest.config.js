module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,js}'],
  coverageDirectory: 'coverage'
}
