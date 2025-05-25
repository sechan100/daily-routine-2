module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "src"],

  // 모듈 매칭 우선순위가 있기 때문에, mock은 위에 배치.
  moduleNameMapper: {
    "^@/shared/plugin-service-locator$": "<rootDir>/__mocks__/plugin",
    // FSD {
    "^@/app/(.*)$": "<rootDir>/src/app/$1",
    "^@/pages/(.*)$": "<rootDir>/src/pages/$1",
    "^@/widgets/(.*)$": "<rootDir>/src/widgets/$1",
    "^@/features/(.*)$": "<rootDir>/src/features/$1",
    "^@/entities/(.*)$": "<rootDir>/src/entities/$1",
    "^@/shared/(.*)$": "<rootDir>/src/shared/$1",
    // }
  },
}