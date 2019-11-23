module.exports = {
  transform: {
    '.*.tsx?$': 'ts-jest',
  },
  setupFilesAfterEnv: [
    '<rootDir>/src/util/setupTests.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
  ],
  modulePaths: [
    '<rootDir>/node_modules/',
  ],
  testURL: 'http://localhost/',
  testEnvironment: 'node',
};
