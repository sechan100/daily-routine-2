/**
 * 모달에서 사용가능한 styled-components들을 제공
 */

/** @jsxImportSource @emotion/react */
import { TEXT_CSS } from '../../constants/text-style';
import { useEffect, useMemo } from 'react';
import { ModalApi } from './create-modal';


interface ModalProps {
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
        margin: "0 auto",
        ".is-phone &": {
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

interface SeparatorProps {
  edge?: boolean;
}
const Separator = ({ edge = false}: SeparatorProps) => {
  return <div
    css={{
      height: edge ? 0 : "1px",
      backgroundColor: "var(--background-modifier-border)",
      margin: edge ? "1em 0 0 0" : "1em 0",
    }}
  />
}

interface SectionProps {
  name?: string;
  className?: string;
  children: React.ReactNode;
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


export const Modal = Object.assign(M, {
  Separator,
  Section
})