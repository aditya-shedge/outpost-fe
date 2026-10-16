import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{js,ts,jsx,tsx}",
    "!src/**/*.d.ts",
    "!src/test/**",
  ],
};

export default createJestConfig(config);
