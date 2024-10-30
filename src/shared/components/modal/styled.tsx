/**
 * 모달에서 사용가능한 styled-components들을 제공
 */

/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { textCss } from '../font';
import { useEffect } from 'react';
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
        padding: "2em",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        ".is-phone &": {
          padding: "0 1em"
        }
      }}
    >
      <header css={[{
        padding: "1em 0",
        ".is-phone &": {
          display: "none"
        },
      }, textCss.mediumBold]}>
        {header}
      </header>
      {children}
    </div>
  )
}

const Section = styled.div({
  display: "flex",
  alignItems: "center",
  paddingTop: "1em",
  justifyContent: "space-between",
  ".is-phone &": {
    borderTop: "none"
  }
})

const Name = styled.div`
  ${textCss.medium}
`;
const Description = styled.div`
  ${textCss.description}
`;

const Separator = styled.div({
  height: "1px",
  backgroundColor: "var(--background-modifier-border)",
  margin: "1em 0"
})







export const Modal = Object.assign(M, {
  Section,
  Name,
  Description,
  Separator,
})