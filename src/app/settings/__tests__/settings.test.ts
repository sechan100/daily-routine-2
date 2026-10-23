import { DEFAULT_SETTINGS, migrateSettings } from "@app/settings/settings";


describe("migrateSettings", () => {
  it("설정이 없으면 기본값(월요일 시작)", () => {
    expect(migrateSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(migrateSettings(undefined).weekStart).toBe("monday");
  });

  it("weekStart가 없는 이전 버전 설정은 isMondayStartOfWeek로부터 정한다", () => {
    expect(migrateSettings({ isMondayStartOfWeek: false }).weekStart).toBe("sunday");
    expect(migrateSettings({ isMondayStartOfWeek: true }).weekStart).toBe("monday");
  });

  it("weekStart가 있으면 그 값을 쓰고, isMondayStartOfWeek를 맞춰 둔다", () => {
    const saturday = migrateSettings({ weekStart: "saturday", isMondayStartOfWeek: true });
    expect(saturday.weekStart).toBe("saturday");
    expect(saturday.isMondayStartOfWeek).toBe(false);
  });

  it("알 수 없는 weekStart 값은 월요일로 되돌린다", () => {
    expect(migrateSettings({ weekStart: "friday" }).weekStart).toBe("monday");
  });

  it("다른 설정은 그대로 보존한다", () => {
    const migrated = migrateSettings({ dailyRoutineFolderPath: "my/routines", confirmUncheckTask: false });
    expect(migrated.dailyRoutineFolderPath).toBe("my/routines");
    expect(migrated.confirmUncheckTask).toBe(false);
  });
});
