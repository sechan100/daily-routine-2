/**
 * 모달에서 사용가능한 styled-components들을 제공
 */
/** @jsxImportSource @emotion/react */
import { ToggleComponent } from "@shared/components/ToggleComponent";
import { TEXT_CSS } from '../../constants/text-style';
import { useEffect, useMemo } from 'react';
import { ModalApi } from './create-modal';
import { TextEditComponent } from "@shared/components/TextEditComponent"
import { Button } from "@shared/components/Button"


type ModalProps = {
  header: string;
  className?: string;
  children?: React.ReactNode;
  modal: ModalApi;
}
const M = ({ header, className, children, modal }: ModalProps) => {

  useEffect(() => {
    modal.setTitle(header);
  }, [modal, header]);

  return (
    <div 
      className={className}
      css={{
        padding: "2em !important",
        maxWidth: "1200px",
        overflow: "scroll",
        margin: "0 auto",
        ".is-phone &": {
          position: "static !important" as "static", 
          // padding: "0 !important",
          padding: "0 1em !important",
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

type SeparatorProps = {
  edgeWithtransparent?: boolean;
}
const Separator = ({ edgeWithtransparent: edge = false}: SeparatorProps) => {
  return <div
    css={{
      height: edge ? 0 : "1px",
      backgroundColor: "var(--background-modifier-border)",
      margin: edge ? "1em 0 0 0" : "1em 0",
    }}
  />
}

type SectionProps = {
  children: React.ReactNode;
  name?: string;
  className?: string;
}
const Section = ({ className, name, children }: SectionProps) => {
  const justifyContent = useMemo(() => name ? "space-between" : "end", [name]);

  return (
    <section
      className={className}
      css={{
        display: "flex",
        justifyContent,
        alignItems: "center",
      }}
    >
      {name ? <div css={TEXT_CSS.medium}>{name}</div> : null}
      {children}
    </section>
  )
}

type ToggleSectionProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  name?: string;
  className?: string;
}
export const ToggleSection = ({
  value,
  onChange,
  name,
  className
}: ToggleSectionProps) => {
  return (
    <Section
      name={name??"Toggle Value"}
      className={className}
    >
      <ToggleComponent
        value={value}
        onChange={onChange}
      />
    </Section>
  )
}

type NameSectionProps = {
  value: string;
  onChange: (name: string) => void;
  name?: string;
  focus?: boolean;
  validation?: {
    isValid: boolean;
    message: string;
  }
  className?: string;
  placeholder?: string;
}
export const NameSection = ({
  value,
  onChange,
  name,
  focus,
  validation: p_validation,
  className,
  placeholder
}: NameSectionProps) => {
  const validation = useMemo(() => p_validation ?? { isValid: true, message: "" }, [p_validation]);

  return (
    <Section
      name={name??"Name"}
      className={className}
    >
      <div css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "end",
      }}>
        <TextEditComponent
          value={value}
          onChange={name => onChange(name)}
          placeholder={placeholder}
          css={!validation.isValid ? TEXT_CSS.errorColor : null}
          focus={focus}
        />
        {!validation.isValid && (
          <div css={[TEXT_CSS.description, TEXT_CSS.errorColor]}>{validation.message}</div>
        )}
      </div>
    </Section>
  )
}


type SaveBtnProps = {
  onSaveBtnClick?: () => void;
  disabled?: boolean;
  name?: string;
}
export const SaveBtn = ({
  disabled,
  onSaveBtnClick,
  name,
}: SaveBtnProps) => {
  
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
        onClick={onSaveBtnClick}
      >
        {name ?? "Save"}
      </Button>
    </div>
  )
}




export const Modal = Object.assign(M, {
  Separator,
  Section,
  ToggleSection,
  NameSection,
  SaveBtn,
})