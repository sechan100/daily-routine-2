import { toAsciiDigits } from "@shared/period/ascii-digits";


describe("toAsciiDigits", () => {
  it.each([
    ["٢٠٢٦-١٠-٢٣", "2026-10-23"], // 아랍어
    ["۲۰۲۶-۱۰-۲۳", "2026-10-23"], // 페르시아어
    ["२०२६-१०-२३", "2026-10-23"], // 힌디어
    ["২০২৬-১০-২৩", "2026-10-23"], // 벵골어
    ["၂၀၂၆-၁၀-၂၃", "2026-10-23"], // 미얀마어
    ["2026-10-23", "2026-10-23"],
  ])("%s → %s", (input, expected) => {
    expect(toAsciiDigits(input)).toBe(expected);
  });

  it("숫자가 아닌 글자는 그대로 둔다", () => {
    expect(toAsciiDigits("노트 ٣개")).toBe("노트 3개");
  });
});
