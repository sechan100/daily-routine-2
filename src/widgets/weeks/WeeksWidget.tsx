/** @jsxImportSource @emotion/react */
import { Day } from "@shared/period/day";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PercentageCircle } from "@shared/components/PercentageCircle";
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperClass, SwiperRef, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { useRoutineNote } from "@features/note";
import { dr } from "@shared/daily-routine-bem";
import { loadWeeks } from "./load-weeks";
import { Week } from "@shared/period/week";
import { useLeaf } from "@shared/view/react-view";



interface WeeksProps {
  currentDay: Day;
  // 현재 보고있는 routineNote의 percentage는 실시간으로 변할 수 있기 때문에 props로 받아서 반영
  currentDayPercentage: number;
  onDayClick?: (day: Day, event?: React.MouseEvent) => void;
  className?: string;
}
export const WeeksWidget = ({ currentDay, currentDayPercentage, onDayClick, className }: WeeksProps) => {
  const [ weeks, setWeeks ] = useState<{day:Day, percentage:number}[][]>([]);
  const currentWeek = useMemo(() => new Week(currentDay), [currentDay]);
  const swiperRef = useRef<SwiperRef>(null);
  const circleTransitionRef = useRef<boolean>(true);
  const setClientNote = useRoutineNote(s => s.setNote);
  const { leafStyle } = useLeaf();


  // props로 받은 'currentDayPercentage'를 반영하기
  useEffect(() => {
    let isPercentageUpdated = false;
    for(const week of weeks){
      for(const tile of week){
        if(tile.day.isSameDay(currentDay) && tile.percentage !== currentDayPercentage){
          tile.percentage = currentDayPercentage;
          isPercentageUpdated = true;
          break;
        }
      }
    }
    if(isPercentageUpdated){
      setWeeks([...weeks]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay, currentDayPercentage]);


  // 'currentWeek'가 변경되면 알맞는 weeks를 로드한다.
  useEffect(() => {
    const isCurrentWeekExist = weeks.flat().some(({ day }) => day.isSameDay(currentWeek.startDay));
    if(isCurrentWeekExist) return;

    loadWeeks(currentWeek, {prev: 1, next: 1}).then(weeks => {
      setWeeks(weeks);
      setTimeout(() => {
        if(swiperRef.current) swiperRef.current.swiper.slideTo(1, 0); // 3개 week중 중앙으로 이동
      });
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

  /**
   * 바로 새롭게 가져온 week(들)을 추가하면 추가되는 week가 현재 index보다 앞에 있는 경우, 
   * 배열이 밀려서 결국 사용자가 원래 보고자했던 slide보다 한칸 앞을 보게된다.
   * 때문에, slide가 넘어갈 때, 끊기는 느낌이 없도록 애니메이션(transition)이 끝난 이후에 swiper의 slide를 한칸 뒤로 이동시켜주어야한다.
   * 이를 위해 실제로 weeks state를 변경 시키는 함수를 ref에 담아두고, 적절한 시점에 호출후 비워주는 방식을 사용한다.
   */
  const updateWeeksRef = useRef<(() => void) | null>();

  /**
   * 슬라이드가 시작, 또는 끝에 도달한 경우에 해당 콜백을 실행한다. 
   * 구체적으로 시작과 끝보다 이전, 또는 이후의 week를 가져와서 Slider에 추가한다.
   */
  const onSlideToEdge = useCallback(async(edge: "start" | "end") => {
    const loadTargetWeek = edge === "start" ? new Week(weeks[0][0].day).subtract_cpy(1) : new Week(weeks[weeks.length-1][0].day).add_cpy(1);
    const newWeek = (await loadWeeks(loadTargetWeek))[0];
    
    if(edge === "start"){
      updateWeeksRef.current = () => {
        setWeeks([newWeek, ...weeks]);
      }
    } else {
      updateWeeksRef.current = () => {
        setWeeks([...weeks, newWeek]);
      }
    }
  }, [weeks]);

  // transition이 끝난 후에 ref에 담긴 update 함수를 실행하고, 만약 현재 인덱스보다 앞에 추가된 경우, swiper를 한칸 뒤로 이동시킨다.
  const onTransitionEnd = useCallback(async(swiper: SwiperClass) => {
    if(!updateWeeksRef.current) return;
    circleTransitionRef.current = false;
    updateWeeksRef.current();
    updateWeeksRef.current = null; // 초기화
    // 현재 인덱스가 0이라면, 추가 후에는 0번이 새로운 week가 되므로 swiper를 한칸 뒤로 이동
    setTimeout(() => {
      if(swiper.isBeginning){
        swiper.slideTo(1, 0);
      }
      circleTransitionRef.current = true;
    });
  }, []);

  const _onDayClick = useCallback((day: Day, event?: React.MouseEvent) => {
    setClientNote(day)
    if(onDayClick) onDayClick(day, event);
  }, [onDayClick, setClientNote]);

  const bem = useMemo(() => dr("weeks"), []);

  return (
    <div
      className={bem("", "", className)}
      onTouchStart={(e) => e.stopPropagation()}
      css={{
        padding: "0 5px",
        // nav buttons
        "& .swiper-button-next, & .swiper-button-prev": {
          display: "flex",
          color: "var(--color-accent-1)",
          // 화살표 사이즈
          "&::after": {
            fontSize: "1em",
            fontWeight: "bold"
          }
        },
        ".swiper-button-next": {
          right: "0px",
          justifyContent: "end",
        },
        ".swiper-button-prev": {
          left: "0px",
          justifyContent: "start",
        },
        ".is-mobile &": {
          ".swiper-button-next, .swiper-button-prev": {
            display: "none"
          }
        },
      }}
    >
      <Swiper
        ref={swiperRef}
        passiveListeners={false}
        touchMoveStopPropagation={true} // touchmove 이벤트가 부모로 전파되지 않도록 한다.
        preventInteractionOnTransition={false} // transition 중에는 interaction을 막는다.
        modules={[Navigation]}
        navigation
        onToEdge={async(swiper: SwiperClass) =>{
          // 3개 이하는 초기값 설정이 아직 안되어있는 상태임
          if(weeks.length < 3) return;
          await onSlideToEdge(swiper.isBeginning ? "start" : "end")
        }}
        onTransitionEnd={onTransitionEnd}
        slidesPerView={1}
        initialSlide={1}
      >
        {weeks.map((week, idx) => {
          return (
            <SwiperSlide key={idx} className={bem("slide")}>
              <div
                className={bem("week")}
                css={{
                  display: "flex",
                  height: "5em",
                  maxWidth: "470px",
                  minWidth: "300px",
                  margin: "0 auto",
                  justifyContent: "center",
                  alignItems: "stretch",
                  // gap: "0.3em",
                  flexWrap: "nowrap",
                  backgroundColor: leafStyle.backgroundColor,
                }}
              >
                {week.map(({day, percentage}, idx) => {
                  return (
                    <div
                      key={idx}
                      className={bem("day", {
                        "today": day.isSameDay(Day.now()),
                        "after": day.isAfter(Day.now()),
                        "current": day.isSameDay(currentDay)
                      })}
                      css={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: "0.3em",
                        position: "relative",
                        height: "100%",
                        background: "none",
                        padding: "0 1.5px",
                        cursor: "pointer",
                        borderRadius: "7px",

                        "&.dr-weeks__day--after::after": {
                          content: "''",
                          position: "absolute",
                          top: "0",
                          left: "0",
                          right: "0",
                          bottom: "0",
                          borderRadius: "7px",
                          background: leafStyle.backgroundColor,
                          opacity: "0.7",
                        },
                        "&.dr-weeks__day--current": {
                          boxShadow: "inset 0 0 2px 0.5px rgba(0, 0, 0, 0.5) !important",
                          "&::after": {
                            boxShadow: "inset 0 0 2px 0.5px rgba(0, 0, 0, 0.5) !important",
                            // content: "none",
                          }
                        },
                      }}
                      onClick={(e) => _onDayClick(day, e)}
                    >
                      <div
                        css={{
                          textAlign: "center",
                          fontSize: "0.8em",
                          height: "1em",
                        }}
                      >
                        {day.format("M/D").toUpperCase()}
                      </div>
                      <PercentageCircle
                        css={{
                          position: "relative",
                          bottom: "0px",
                        }}
                        width="100%"
                        percentage={percentage}
                        transition={circleTransitionRef.current}
                        text={day.format("ddd").toUpperCase()} 
                      />
                    </div>
                  )
                })}
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}