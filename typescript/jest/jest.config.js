export default {
  clearMocks: true,
  //moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/*.test.ts', '**/*.test.ts'],
  transform: {
    //'^.+\\.ts$': ['ts-jest', { useESM: true }]
    '^.+\\.ts$': ['ts-jest']
  }
};
