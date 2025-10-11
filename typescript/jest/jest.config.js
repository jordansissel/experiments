export default {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  //roots: ['<rootDir>/packages'],
  testEnvironment: 'node',
  //testMatch: ['**/__tests__/*.test.ts'],
  testMatch: ['**/__tests__/*.test.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true
};
