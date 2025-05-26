import { doConfirm } from "@/shared/components/modal/confirm-modal";
import { getPlugin } from "@/shared/utils/plugin-service-locator";
import { Modal, Notice } from "obsidian";
import { isRequireMigration, migrateTo2xx } from "./migration-to-2xx/migrate";


export type UpdateMigrationPercentage = (percentage: number) => void;



export const schemaMigrationEntrypoint = async () => {
  const needMigration = await isRequireMigration();
  if (!needMigration) {
    return;
  }
  const isUserConfirmed = await doConfirm({
    title: "Daily routine files schema migration required",
    description: `새로운 버전의 Daily Routine을 사용하기 위하여 설정의 'Daily routine folder path'에 지정된 폴더의 파일들을 새로운 형식으로 업데이트 합니다.
      작업을 수행하면 'Daily routine folder'를 복사하여 파일 손실에 대비합니다.

      만약 사용자가 기존에 daily routine이 관리하는 파일들을 올바르지 않은 형식으로 직접 수정한 경우, 업데이트 중 일부 데이터가 손실될 수 있습니다.
      이 경우, 복사된 백업본을 확인하여 적절하게 데이터를 복구할 수 있습니다.

      만약 업데이트를 원하지 않는 경우, 구버전의 file 형식을 사용하는 마지막 버전인 1.0.7 버전을 여전히 사용할 수 있습니다.
      이 경우, 수동으로 plugin을 vault에 설치하여 사용하실 수 있습니다. 자세한 정보는 [다음]을 참고하세요.
      `,
    confirmText: "Migrate Now",
    confirmBtnVariant: "accent",
  })

  if (!isUserConfirmed) {
    new Notice("Daily routine files schema migration cancelled by user.");
    return;
  }

  // Progress modal
  const modal = new Modal(getPlugin().app);
  modal.containerEl.addClass("mod-confirmation");
  modal.setTitle("Daily routine files schema migration processing...");
  modal.modalEl.setCssStyles({
    width: "calc(var(--dialog-width))"
  })
  const content = document.createElement("p");
  const updatePercentage = (percentage: number) => {
    content.innerHTML = "도중에 애플리케이션을 종료하지 마세요. 이 작업은 시간이 걸릴 수 있습니다.<br>" + `Migration Percentage: ${percentage}%`;
  }
  modal.contentEl.appendChild(content);
  updatePercentage(0);
  const closeButton = modal.containerEl.querySelector(".modal-close-button");
  if (closeButton) {
    closeButton.remove();
  }
  modal.onClose = () => modal.open();
  modal.open();

  // DO MIGRATION!
  await migrateTo2xx(updatePercentage);

  // END
  modal.onClose = () => { };
  modal.close();
  new Notice("Daily routine files schema migration completed successfully.");
}