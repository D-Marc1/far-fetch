module.exports = {
  plugins: {
    '@release-it/keep-a-changelog': {
      addVersionUrl: true,
    },
    github: {
      release: true,
    },
  },
};
