export default {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  transform: {
    '^.+\\.(js|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!jsdom|@exodus|html-encoding-sniffer)/',
  ],
  verbose: true,
};
