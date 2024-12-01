/** @jsxImportSource @emotion/react */
import 'swiper/swiper-bundle.css';
import { Mousewheel } from 'swiper/modules';
import React, { useCallback, useEffect, useMemo, useRef, useState, Key, useLayoutEffect } from "react";
import { Swiper, SwiperClass, SwiperRef, SwiperSlide } from 'swiper/react';
import { Month } from '@shared/period/month';


export interface VirtualSlideData {}


interface SlideComponentProps<T extends VirtualSlideData> {
  data: T;
  id: Key;
  index: number;
  renderChildren: (data: T, index?: number) => React.ReactNode;
}
const SlideComponent = React.memo(<T extends VirtualSlideData,>({ data, index, renderChildren }: SlideComponentProps<T>) => {
  const children = useMemo(() => renderChildren(data, index), [data, index, renderChildren]);
  return (
    <>
      {children}
    </>
  )
}, (prev, next) => {
  return prev.id === next.id;
});


const getCenterIndex = (datas: unknown[]) => {
  const len = datas.length;
  return len%2 === 0 ? len/2 : (len-1)/2;
}


interface VirtualSwiperProps<T extends VirtualSlideData> {
  datas: T[];

  /**
   * slide의 key로 사용될 값을 반환하는 함수
   */
  getKey: (data: T) => Key;

  /**
   * edge에 도달한 경우, onToEdge를 호출하여 반환하는 T 타입의 데이터를 배열에 추가하여 전체 slide의 개수를 증가시킨다.
   * @param edge 맨 앞, 또는 맨 뒤
   * @param data 현재 edge에 위치한 데이터(start라면 data[0], end라면 data[data.length - 1])
   * @returns T 타입의 데이터, 반환 후 해당 데이터는 start라면 data[0]에, end라면 data[data.length - 1]에 추가된다.
  */
  loadEdgeData: (edge: "start" | "end", data: T) => T | Promise<T> | T[] | Promise<T[]>;
  children: (data: T, index?: number) => React.ReactNode;
  
  className?: string;
  onSlideChange?: (data: T) => void;
  wheelSlide?: boolean; // default: true
  prevNav?: HTMLElement;
  nextNav?: HTMLElement;
}

const VirtualSwiperComponent = <T extends VirtualSlideData,>({ 
  datas: propsDatas,
  getKey,
  children,
  loadEdgeData,
  className,
  onSlideChange,
  nextNav,
  prevNav,
  wheelSlide = true
}: VirtualSwiperProps<T>) => {
  const swiperRef = useRef<SwiperRef>(null);
  const [datas, _setDatas] = useState<T[]>(propsDatas);

  /**
   * swiper.slideTo의 마지막 파라미터로 받는 boolean flag가 이벤트 발생 안하게 막는건데 왜인지 동작은 안함.
   */
  const preventSlideEvent = useRef(false);
  const slideTo = useCallback((index: number) => {
    if(!swiperRef.current) return;
    const swiper = swiperRef.current.swiper;
    if(swiper.activeIndex === index) return;
    preventSlideEvent.current = true;
    swiper.slideTo(index, 0);
  }, []);


  const newIndexForNewDatasRef = useRef<number>(-1);
  useLayoutEffect(() => {
    const idx = newIndexForNewDatasRef.current;
    if(idx !== -1){
      slideTo(idx);
      newIndexForNewDatasRef.current = -1;
    }
  }, [datas, slideTo]);
  const setDatas = useCallback((newDatas: T[], newIndex?: number) => {
    newIndexForNewDatasRef.current = newIndex ?? -1;
    _setDatas(newDatas);
  }, []);


  // propsDatas가 변경되면 datas를 업데이트하고 slideIndex를 중앙으로 이동시킨다.
  useEffect(() => {
    setDatas(propsDatas, getCenterIndex(propsDatas));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsDatas]);


  // nextNav, prevNav에 이벤트 등록
  useEffect(() => {
    if(!nextNav || !prevNav) return;
    if(!swiperRef.current) return;

    const swiper = swiperRef.current.swiper;
    const movePrev = () => swiper.slidePrev();
    const moveNext = () => swiper.slideNext();
    prevNav.addEventListener("click", movePrev);
    nextNav.addEventListener("click", moveNext);

    return () => {
      prevNav.removeEventListener("click", movePrev);
      nextNav.removeEventListener("click", moveNext);
    }
  }, [nextNav, prevNav]);


  /**
   * 현재 datas의 0번에 도착했다면, 해당 Slide의 인덱스는 새로운 데이터가 추가됨에 따라 0에서 1이된다.
   * 결과적으로 slide는 0번을 가리키기 때문에 슬라이드가 새롭게 추가된 slide로 옮겨진다.
   * 따라서 강제로 원래 위치해야했던 index인 1로 slide를 이동시킨다. 
   */
  const onTransitionEnd = useCallback(async (swiper: SwiperClass) => {
    const currentData = datas[swiper.activeIndex];
    onSlideChange && onSlideChange(currentData);

    if(swiper.isEnd || swiper.isBeginning){
      const edge = swiper.isBeginning  ? "start" : "end";
      const currentEdgeData = currentData;
      const newEdgeData = [await loadEdgeData(edge, currentEdgeData)].flatMap(data=>data);
      if(edge === "start"){
        setDatas([...newEdgeData, ...datas], 1);
      } else {
        setDatas([...datas, ...newEdgeData]);
      }
    }
  }, [datas, loadEdgeData, onSlideChange, setDatas]);

  
  return (
    <div
      className={className}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <Swiper 
        ref={swiperRef}
        mousewheel={{
          enabled: wheelSlide,
          thresholdTime: 400,
          thresholdDelta: 10,
        }}
        modules={[Mousewheel]}
        passiveListeners={false}
        touchMoveStopPropagation={true} // touchmove 이벤트가 부모로 전파되지 않도록 한다.
        preventInteractionOnTransition={false} // transition 중에는 interaction을 막는다.
        onTransitionEnd={(swiper: SwiperClass) => {
          if(preventSlideEvent.current){
            preventSlideEvent.current = false;
            return;
          } else {
            onTransitionEnd(swiper);
          }
        }}
        slidesPerView={1}
        initialSlide={getCenterIndex(propsDatas)}
      >
        {datas.map((data, index) => (
        <SwiperSlide key={getKey(data)}>
          <SlideComponent
            id={getKey(data)}
            data={data}
            index={index}
            renderChildren={children} 
          />
        </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}


export const VirtualSwiper = React.memo(VirtualSwiperComponent) as typeof VirtualSwiperComponent;