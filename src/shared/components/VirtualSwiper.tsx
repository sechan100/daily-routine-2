/** @jsxImportSource @emotion/react */
import 'swiper/swiper-bundle.css';
import { Mousewheel } from 'swiper/modules';
import React, { useCallback, useEffect, useMemo, useRef, useState, Key } from "react";
import { Swiper, SwiperClass, SwiperRef, SwiperSlide } from 'swiper/react';


export interface VirtualSlideData {}

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
  wheelSlide?: boolean; // default: true
  prevNav?: HTMLElement;
  nextNav?: HTMLElement;
}

export const VirtualSwiper = <T extends VirtualSlideData,>({ 
  datas: propsDatas,
  getKey,
  children,
  loadEdgeData,
  className,
  nextNav,
  prevNav,
  wheelSlide = true
}: VirtualSwiperProps<T>) => {
  const swiperRef = useRef<SwiperRef>(null);
  const [datas, setDatas] = useState<T[]>(propsDatas);


  // 현재 datas의 중앙 index를 반환한다.
  const centerIndex = useMemo(() => {
    const len = datas.length;
    return len%2 === 0 ? len/2 : (len-1)/2;
  }, [datas.length]);


  // propsDatas가 변경되면 datas를 업데이트하고 slideIndex를 중앙으로 이동시킨다.
  useEffect(() => {
    if(!swiperRef.current) return;

    setDatas(propsDatas);
    const swiper = swiperRef.current.swiper;
    swiper.slideTo(centerIndex, 0);
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
    if(!(swiper.isEnd || swiper.isBeginning)) return;

    const edge = swiper.isBeginning  ? "start" : "end";
    const currentEdge = edge === "start" ? datas[0] : datas[datas.length - 1];
    const newEdgeData = [await loadEdgeData(edge, currentEdge)].flatMap(data=>data);
    setTimeout(() => {
      if(edge === "start"){
        setDatas([...newEdgeData, ...datas]);
        swiper.slideTo(1, 0);
      } else {
        setDatas([...datas, ...newEdgeData]);
      }
    })
  }, [datas, loadEdgeData]);

  
  return (
    <div
      className={className}
      onTouchStart={(e) => e.stopPropagation()}
      // ref={wheelSlideMove}
    >
      <Swiper 
        ref={swiperRef}
        mousewheel={{
          enabled: wheelSlide,
          thresholdTime: 500,
          thresholdDelta: 20,
        }}
        modules={[Mousewheel]}
        passiveListeners={false}
        touchMoveStopPropagation={true} // touchmove 이벤트가 부모로 전파되지 않도록 한다.
        preventInteractionOnTransition={false} // transition 중에는 interaction을 막는다.
        onTransitionEnd={onTransitionEnd}
        slidesPerView={1}
        initialSlide={centerIndex}
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