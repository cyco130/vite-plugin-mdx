require("@cyco130/eslint-config/patch");

module.exports = {
  root: true,
  extends: ["@cyco130/eslint-config/node"],
  ignorePatterns: ["node_modules", "dist", "**/*.cjs"],
  parserOptions: { project: [__dirname + "/tsconfig.json"] },
  rules: {},
};
