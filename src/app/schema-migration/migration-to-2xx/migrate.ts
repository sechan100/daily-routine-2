import { UpdateMigrationPercentage } from "../migration-entrypoint";




export const migrateTo2xx = async (updatePercentage: UpdateMigrationPercentage) => {
  // 0.2초마다 percentage를 업데이트하여 총 5초간 동작하여 100%가 되도록 한다.
  return new Promise<void>((resolve) => {
    let percentage = 0;
    const interval = setInterval(() => {
      percentage += 1;
      updatePercentage(percentage);
      if (percentage >= 100) {
        clearInterval(interval);
        resolve();
      }
    }, 50); // 0.2초마다 업데이트
  });
}