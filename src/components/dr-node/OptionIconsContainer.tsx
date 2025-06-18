/** @jsxImportSource @emotion/react */
import { drNodeStyle } from "./dr-node-tyle";

type OptionIconsContainerProps = {
  icons?: React.ReactNode[];
}
export const OptionIconsContainer = ({ icons = [] }: OptionIconsContainerProps) => {

  return (
    <div css={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      // 마지막 아이콘은 오른쪽 패딩을 가져가면서, 영역을 넓힌다.
      "& > div:last-child": {
        paddingRight: drNodeStyle.paddingRight,
      },
    }}>
      {icons.map((icon, index) => (
        <div
          key={index}
          css={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
};
