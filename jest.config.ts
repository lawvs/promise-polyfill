import type { Config } from "jest";

const config = {
  preset: "ts-jest",
  testTimeout: 50,
  testMatch: ["**/?(*.)+(spec|test).ts?(x)"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
} satisfies Config;

export default config;
