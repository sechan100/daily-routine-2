/** @jsxImportSource @emotion/react */
import { MenuComponent } from "@shared/components/Menu";
import { t } from "@shared/i18n";
import { Menu } from "obsidian";



interface OptionIconProps {
  onOptionMenu: (m: Menu) => void | Promise<void>;
  label?: string;
}
export const OptionIcon = ({
  onOptionMenu,
  label = t("tasks.options"),
}: OptionIconProps) => {
  return (
    <MenuComponent
      onMenuShow={onOptionMenu}
      icon="ellipsis"
      ariaLabel={label}
      css={{
        color: 'var(--text-faint)',
        width: "3em",
        // 좁은 사이드바에서 이름이 길어져도 아이콘이 찌그러지지 않게
        flexShrink: 0,
        // 터치 기기에서는 탭한 뒤에도 hover가 남으므로, 실제 hover가 가능한 기기에서만 강조한다.
        "@media (hover: hover)": {
          "&:hover": {
            color: 'var(--text-normal)',
          },
        },
      }}
    />
  )
}
