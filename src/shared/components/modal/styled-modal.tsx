/**
 * 모달에서 사용가능한 styled-components들을 제공
 */
/** @jsxImportSource @emotion/react */
import { STYLES } from '@/shared/colors/styles';
import { Interpolation } from '@emotion/react';
import { Theme } from '@mui/material';
import { useEffect } from 'react';
import { TEXT_CSS } from '../../colors/text-style';
import { Button } from '../Button';
import { useModal } from './create-modal';


const saveButtonHeight = "50px";
const saveButtonHeightPhone = "80px";

type ModalProps = {
  header: string;
  className?: string;
  children?: React.ReactNode;
}
const M = ({ header, className, children }: ModalProps) => {
  const modal = useModal();

  useEffect(() => {
    modal.setTitle(header);
  }, [modal, header]);

  return (
    <div
      className={className}
      css={{
        padding: `32px 32px ${saveButtonHeight} 32px !important`,
        maxWidth: "1200px",
        overflow: "scroll",
        margin: "0 auto",
        ".is-phone &": {
          position: "static !important" as "static",
          padding: `0 16px ${saveButtonHeightPhone} 16px !important`,
        }
      }}
    >
      <header
        css={[{
          padding: "1em 0",
          ".is-phone &": {
            display: "none"
          },
        }, TEXT_CSS.large, TEXT_CSS.bold]}
      >
        {header}
      </header>
      {children}
    </div>
  )
}


const Separator = () => {
  return <div
    css={{
      height: "1px",
      backgroundColor: STYLES.palette.divider,
    }}
  />
}

type HeaderProps = {
  name: string;
  align?: "left" | "center" | "right";
  sx?: Interpolation<Theme>
}
const Header = ({ name, align, sx }: HeaderProps) => {
  return (
    <div css={[{
      width: align ? "100%" : "auto",
      display: "flex",
      justifyContent: align || "center",
      alignItems: "center",
    }, sx]}>
      <span css={TEXT_CSS.medium}>
        {name}
      </span>
    </div>
  )
}

type SectionProps = {
  children: React.ReactNode;
  flexDirection?: "row" | "column";
}
const Section = ({ children, flexDirection = "row" }: SectionProps) => {

  return (
    <section
      css={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: flexDirection,
        margin: "16px 0",
      }}
    >
      {children}
    </section>
  )
}


type SubmitButtonProps = {
  name: string;
  onClick?: () => void;
  disabled?: boolean;
}
export const SubmitButton = ({
  name,
  onClick,
  disabled,
}: SubmitButtonProps) => {

  /**
   * Enter Key로 Save Button을 트리거하는 이벤트를 등록
   */
  useEffect(() => {

    const handleEnterKeyDown = ({ key, isComposing }: KeyboardEvent) => {
      if (isComposing) return;

      if (key === "Enter" && !disabled) {
        onClick?.();
      }
    }

    document.addEventListener('keydown', handleEnterKeyDown);
    return () => document.removeEventListener('keydown', handleEnterKeyDown);
  }, [disabled, onClick]);

  return (
    <div css={{
      position: "absolute",
      bottom: "0",
      left: "0",
      right: "0",
    }}>
      <Button
        css={{
          width: "100%",
          height: "50px",
          ".is-phone &": {
            height: "80px",
          },
          borderBottomLeftRadius: "0",
          borderBottomRightRadius: "0",
        }}
        disabled={disabled}
        variant={disabled ? "disabled" : "accent"}
        onClick={onClick}
      >
        {name}
      </Button>
    </div>
  )
}




export const Modal = Object.assign(M, {
  Separator,
  Header,
  Section,
  SubmitButton,
})