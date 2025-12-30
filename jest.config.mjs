// Jest ESM config
export default {
  setupFiles: ["<rootDir>/jest.setup.js"],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  testRegex: '.*\\.test\\.(mjs|js)$',
  transform: {
    '^.+\\.mjs$': ['babel-jest', { presets: ['@babel/preset-env'] }],
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!jsdom|@exodus|html-encoding-sniffer)/',
  ],
  verbose: true,
};
