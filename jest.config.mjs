// Jest ESM config
export default {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  testRegex: '.*\\.test\\.mjs$',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!jsdom|@exodus|html-encoding-sniffer)/',
  ],
  verbose: true,
};
