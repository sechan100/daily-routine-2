import { t } from "@shared/i18n";
import { setAppLanguageForTest } from "@shared/i18n/language";
import { tasksStrings } from "@shared/i18n/strings/tasks";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));

afterEach(() => setAppLanguageForTest(null));

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
const keys = Object.keys(tasksStrings.en) as (keyof typeof tasksStrings.en)[];


describe("tasks 문구 표", () => {
  it("영어와 한국어의 {자리표시자}가 같다", () => {
    for(const key of keys){
      expect({ key, placeholders: placeholders(tasksStrings.ko[key]) })
        .toEqual({ key, placeholders: placeholders(tasksStrings.en[key]) });
    }
  });

  it("모든 키는 tasks. 로 시작한다", () => {
    for(const key of keys) expect(key.startsWith("tasks.")).toBe(true);
  });

  it("영어 복수형 키는 _one과 _other가 짝을 이룬다", () => {
    for(const key of keys){
      if(key.endsWith("_one")) expect(keys).toContain(key.replace(/_one$/, "_other"));
      if(key.endsWith("_other")) expect(keys).toContain(key.replace(/_other$/, "_one"));
    }
  });

  it("한국어 문구는 영어를 그대로 두지 않고 번역한다", () => {
    for(const key of keys){
      expect({ key, translated: /[가-힣]/.test(tasksStrings.ko[key]) }).toEqual({ key, translated: true });
    }
  });
});


describe("t: tasks 문구는 UI 언어를 따른다", () => {
  it("한국어 UI에서는 한국어 표를 쓴다", () => {
    setAppLanguageForTest("ko");
    expect(t("tasks.todo.addTitle")).toBe("할 일 추가");
    expect(t("tasks.todo.deleteConfirm", { name: "우유" })).toBe("'우유' 할 일을 삭제할까요?");
    expect(t("tasks.menu.rescheduleTomorrow")).toBe("내일로 미루기");
  });

  it("그 밖의 언어에서는 영어 표를 쓴다", () => {
    for(const lang of ["en", "de", "ja", "ar"]){
      setAppLanguageForTest(lang);
      expect(t("tasks.todo.addTitle")).toBe("Add todo");
      expect(t("tasks.todo.deleteConfirm", { name: "milk" })).toBe("Are you sure you want to delete 'milk'?");
    }
  });
});
