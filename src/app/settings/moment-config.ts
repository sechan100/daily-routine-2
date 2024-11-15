import { moment } from "obsidian";



interface MomentConfig {
  isMondayStartOfWeek: boolean;
}
export const updateMomentConfig = (config: MomentConfig) => {
  moment.updateLocale('en', {
    week: {
      dow: config.isMondayStartOfWeek ? 1 : 0,
      doy: 7
    }
  });
}