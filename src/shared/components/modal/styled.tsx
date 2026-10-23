/**
 * 모달에서 사용가능한 styled-components들을 제공
 */
/** @jsxImportSource @emotion/react */
import { ToggleComponent } from "@shared/components/ToggleComponent";
import { TEXT_CSS } from '../text-style';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ModalApi } from './create-modal';
import { TextEditComponent } from "@shared/components/TextEditComponent"
import { Button } from "@shared/components/Button"
import { Notice } from "obsidian";
import { t } from "@shared/i18n";


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
        overflow: "auto",
        margin: "0 auto",
        // 작은 모달(sidebarLayout이 아닌 것)은 Obsidian 모달의 여백 안에 놓이고, SaveBtn은 고정하지 않고 내용 아래에 둔다.
        ".modal:not(.mod-sidebar-layout) &": {
          padding: "0 0 0.5em !important",
        },
        ".is-phone &": {
          position: "static !important" as "static",
          // padding: "0 !important",
          // 하단에 고정된 SaveBtn(80px)에 마지막 폼 요소가 가려지지 않도록 공간을 확보
          padding: "0 1em 80px !important",
        },
        // 휴대폰의 작은 모달은 Obsidian이 모달 자체에 여백을 주지 않으므로, 내용이 가장자리에 붙지 않게 직접 여백을 준다.
        // (위 두 규칙보다 구체적이어야 둘 다 덮어쓴다)
        ".is-phone .modal:not(.mod-sidebar-layout) &": {
          padding: "0 var(--size-4-4) var(--size-4-4) !important",
        },
      }}
    >
      <header 
        css={[{
          padding: "1em 0",
          ".is-phone &": {
            display: "none"
          },
          // 작은 모달은 Obsidian이 setTitle로 제목을 보여주므로 중복해서 그리지 않는다.
          ".modal:not(.mod-sidebar-layout) &": {
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
      name={name??t("tasks.modal.toggleValue")}
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
      name={name??t("common.name")}
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
  // 비동기 저장이면 Promise를 반환해야 저장이 끝날 때까지 버튼이 잠긴다.
  onSaveBtnClick?: () => void | Promise<void>;
  disabled?: boolean;
  name?: string;
}
export const SaveBtn = ({
  disabled,
  onSaveBtnClick,
  name,
}: SaveBtnProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  // 키 반복·더블 클릭으로 저장이 겹치지 않도록 동기적으로 읽을 수 있는 ref로 막고, 표시용으로만 state를 쓴다.
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async () => {
    if(submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await onSaveBtnClick?.();
    } catch(e) {
      // 각 모달이 예측 가능한 실패는 직접 알리므로, 여기는 예상 밖의 실패만 받는다.
      console.error("Failed to save.", e);
      new Notice(t("tasks.modal.saveFailed"));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [onSaveBtnClick]);

  /**
   * Enter Key로 Save Button을 트리거하는 이벤트를 등록
   */
  useEffect(() => {

    const handleEnterKeyDown = (e: KeyboardEvent) => {
      if(e.isComposing || e.repeat) return;
      if(e.key !== "Enter" || disabled) return;

      // 이 모달 안에서 발생한 키 입력만 처리한다. (다른 모달·뷰에서 누른 Enter에 반응하면 안 된다)
      const modalContainer = rootRef.current?.closest(".modal-container");
      const target = e.target as Element | null;
      if(!modalContainer || !target || !modalContainer.contains(target)) return;
      // 포커스된 버튼에서의 Enter는 그 버튼의 클릭으로 처리된다.
      if(target.closest("button")) return;

      void submit();
    }

    document.addEventListener('keydown', handleEnterKeyDown);
    return () => document.removeEventListener('keydown', handleEnterKeyDown);
  }, [disabled, submit]);

  const isDisabled = disabled || submitting;
  return (
    <div
      ref={rootRef}
      css={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        // 작은 모달은 높이가 내용에 맞춰지므로, 바닥에 고정하면 휴대폰의 바닥 시트 밖으로 넘친다. 내용 아래에 둔다.
        ".modal:not(.mod-sidebar-layout) &": {
          position: "static",
          marginTop: "1.25em",
        },
      }}
    >
      <Button
        css={{
          width: "100%",
          height: "50px",
          ".is-phone &": {
            height: "80px",
          },
          borderBottomLeftRadius: "0",
          borderBottomRightRadius: "0",
          // 내용 아래에 놓이는 작은 모달의 버튼은 일반 버튼 모양으로 둔다.
          ".modal:not(.mod-sidebar-layout) &": {
            height: "40px",
            borderRadius: "var(--button-radius, var(--radius-s))",
          },
          ".is-phone .modal:not(.mod-sidebar-layout) &": {
            height: "48px",
          },
        }}
        disabled={isDisabled}
        aria-busy={submitting}
        variant={isDisabled ? "disabled" : "accent"}
        onClick={() => { void submit(); }}
      >
        {name ?? t("common.save")}
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