import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styled, { css, keyframes } from "styled-components";
import WebFont from "webfontloader";

export interface ITooltip {
  children?: React.ReactElement;
  message: string;
  position?: Position; //기본값 top
  trigger?: Trigger; //기본값 hover
  theme?: Theme; //기본값 primary
  size?: Size; //기본값 md
}

interface PropsType {
  position: string;
  theme: string;
  size: string;
  targetRect: DOMRect;
}

type Position = "top" | "bottom" | "left" | "right";
type Trigger = "hover" | "click";
type Theme = "primary" | "secondary";
type Size = "sm" | "md" | "lg";

WebFont.load({
  google: {
    families: ["Noto Sans KR", "sans-serif"],
  },
});

export function Tooltip({
  children,
  message,
  position = "bottom",
  trigger = "hover",
  theme = "primary",
  size = "md",
}: ITooltip) {
  const [child, setChild] = useState<React.ReactElement>();
  const [visible, setVisible] = useState<boolean>(false);

  const targetRef = useRef() as React.MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    let clonedChild;
    if (trigger === "click") {
      clonedChild = React.cloneElement(children!, {
        ref: targetRef,
      });
      //click이벤트 등록
    } else {
      clonedChild = React.cloneElement(children!, {
        onMouseOver: () => setVisible(true),
        onMouseLeave: () => setVisible(false),
        ref: targetRef,
      });
    }
    setChild(clonedChild);
  }, []); //트리거 종류에따라 visible 변하는 함수 내용 변경

  useEffect(() => {
    if (trigger !== "click") return;
    const handleClickOutside = (e: MouseEvent) => {
      //이 조건에서 클릭이 내부인지 확인
      if (targetRef.current.contains(e.target as Node)) {
        //툴팁을 띄울 타겟을 클릭했을때
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [targetRef, trigger]);

  return (
    <>
      {child}
      {visible &&
        ReactDOM.createPortal(
          <MessageWrapper
            position={position}
            theme={theme}
            size={size}
            targetRect={targetRef.current.getBoundingClientRect()}
          >
            {message}
          </MessageWrapper>,
          document.body
        )}
    </>
  );
}

export default Tooltip;

const getPosition = (position: string, targetRect: DOMRect) => {
  const padding = 12;

  switch (position) {
    case "top":
      return css`
        top: ${targetRect.top}px;
        left: ${targetRect.left}px;
        transform: translate(
          calc(${targetRect.width / 2}px - 50%),
          calc(-100% - ${padding})
        );
      `;

    case "bottom":
      return css`
        top: ${targetRect.top}px;
        left: ${targetRect.left}px;
        transform: translate(
          calc(${targetRect.width / 2}px - 50%),
          ${targetRect.height + padding}px
        );
      `;

    case "left":
      return css`
        top: ${targetRect.top}px;
        left: ${targetRect.left}px;
        transform: translate(
          calc(-100% - ${padding}),
          calc(${targetRect.height / 2}px - 50%)
        );
      `;

    case "right":
      return css`
        top: ${targetRect.top}px;
        left: ${targetRect.left}px;
        transform: translate(
          ${targetRect.width + padding}px,
          calc(${targetRect.height / 2}px - 50%)
        );
      `;

    default:
      return null;
  }
};

const getTheme = (theme: string) => {
  switch (theme) {
    case "primary":
      return css`
        background-color: #f2f2f2;
        color: #424242;
      `;

    case "secondary":
      return css`
        background-color: rgba(0, 0, 0, 0.6);
        color: #f2f2f2;
      `;
    default:
      return null;
  }
};

const getSize = (size: string) => {
  switch (size) {
    case "sm":
      return css`
        font-size: 12px;
      `;
    case "md":
      return css`
        font-size: 16px;
      `;
    case "lg":
      return css`
        font-size: 22px;
      `;
    default:
      return null;
  }
};

const fadeIn = keyframes`
  from{
    opacity: 0;
  }
  to{
    opacity: 1;
  }
`;

const MessageWrapper = styled.div<PropsType>`
  padding: 16px;
  position: absolute;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-family: "Noto Sans KR";
  cursor: default;
  animation: ${fadeIn} 0.15s linear;
  z-index: 100;
  ${(props) => getPosition(props.position, props.targetRect)}
  ${(props) => getTheme(props.theme)}
  ${(props) => getSize(props.size)}
`;