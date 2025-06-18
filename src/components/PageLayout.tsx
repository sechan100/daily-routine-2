/** @jsxImportSource @emotion/react */



type Props = {
  children?: React.ReactNode;
}
export const PageLayout = ({
  children
}: Props) => {

  return (
    <div css={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {children}
    </div>
  )
}