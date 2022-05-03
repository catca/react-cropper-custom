const SRC_PATH = '<rootDir>/src';

module.exports = {
  preset: 'ts-jest',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
  coverageDirectory: 'coverage',
  moduleDirectories: ['node_modules', 'src'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  modulePaths: ['<rootDir>'],
  roots: [SRC_PATH],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@src(.*)$': '<rootDir>/src$1',
    '^@components(.*)$': '<rootDir>/src/components$1',
    '^@style(.*)$': '<rootDir>/src/style$1',
    '^@hooks(.*)$': '<rootDir>/src/hooks$1',
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '\\.(css|scss)$': '<rootDir>/mocks/styleMock.js',
  },
  testEnvironment: 'jsdom',
};
