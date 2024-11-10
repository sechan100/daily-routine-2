/** @jsxImportSource @emotion/react */
import { Day } from "shared/day";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PercentageCircle } from "shared/components/PercentageCircle";
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperClass, SwiperRef, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { useRoutineNote } from 'entities/note';
import { dr } from "shared/daily-routine-bem";
import { loadWeeks } from "./load-weeks";



interface WeeksProps {
  currentDay: Day;
  /**
   * 현재 보고있는 day의 percentage는, note page에서 사용자가 task를 클릭할 때마다 동적으로 변경될 수 있다.
   */
  currentDayPercentage: number;
  onDayClick?: (day: Day, event?: React.MouseEvent) => void;
  className?: string;
}
export const Weeks = ({ currentDay, currentDayPercentage, onDayClick, className }: WeeksProps) => {
  const [ weeks, setWeeks ] = useState<{day:Day, percentage:number}[][]>([]);
  const currentWeekStartDay = useMemo(() => currentDay.clone(m => m.startOf("week")), [currentDay]);
  const swiperRef = useRef<SwiperRef>(null);
  // circle 채워지는 애니메이션 on/off
  const circleTransitionRef = useRef<boolean>(true);
  const setClientNote = useRoutineNote(s => s.setNote);


  /**
   * currentDayPercentage가 변경되면 이를 weeks에 반영한다.
   * 
   * currentDay의 percentage는 routine note view에 의해서 동적으로 변할 수 있다. 
   * 해당 훅을 통해서 부모 컴포넌트가 변경된 frash한 percentage를 전달할 수 있도록 한다.
   * 
   * 해당 값이 -1인 경우는 부모에서 따로 지정해준 값이 없는 경우이다.
   */
  useEffect(() => {
    const needPercentageUpdate = weeks.find(week => week.some(
      ({day, percentage}) => day.isSameDay(currentDay) && percentage !== currentDayPercentage
    ));
    if(!needPercentageUpdate) return;

    setWeeks(weeks => {
      return weeks.map(week => {
        return week.map(({day, percentage}) => {
          return {
            day,
            percentage: day.isSameDay(currentDay) ? currentDayPercentage : percentage
          }
        })
      })
    })
  }, [currentDay, currentDayPercentage, weeks]);

  /**
   * 최초, 그리고 currentWeekStartDay가 변경될 때마다의 weeks 변경.
   * 현재 날짜가 weeks 안에 어딘가 존재한다면, 아마 이미 swiper가 해당 날짜를 잘 표현하고 있을 것이므로 추가적인 동작을 수행하지 않음.
   */
  useEffect(() => {
    let ignore = false;
    if(ignore) return;
    // weeks에 currentWeekStartDay가 포함되어있지 않다면, 해당 week를 로드한다.
    if(!weeks.some(week => week.some(({day}) => day.isSameDay(currentWeekStartDay)))){
      loadWeeks(currentWeekStartDay, {prev: 1, next: 1}) // 해당 week와 앞뒤로 하나씩의 week를 로드한다.
      .then(weeks => {
        setWeeks(weeks);
        // 새롭게 3개의 week를 로드했으므로, swiper를 중간으로 이동시킨다.
        setTimeout(() => {
          if(swiperRef.current) swiperRef.current.swiper.slideTo(1, 0);
        });
      })
    }

    return () => {
      ignore = true;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeekStartDay]);

  /**
   * 바로 새롭게 가져온 week(들)을 추가하면 추가되는 week가 현재 index보다 앞에 있는 경우, 
   * 배열이 밀려서 결국 사용자가 원래 보고자했던 slide보다 한칸 앞을 보게된다.
   * 때문에, slide가 넘어갈 때, 끊기는 느낌이 없도록 애니메이션(transition)이 끝난 이후에 swiper의 slide를 한칸 뒤로 이동시켜주어야한다.
   * 이를 위해 실제로 weeks state를 변경 시키는 함수를 ref에 담아두고, 적절한 시점에 호출후 비워주는 방식을 사용한다.
   */
  const updateWeeksRef = useRef<(() => void) | null>();

  ////////////////////////////////////////////////
  /**
   * 슬라이드가 시작, 또는 끝에 도달한 경우에 해당 콜백을 실행한다. 
   * 구체적으로 시작과 끝보다 이전, 또는 이후의 week를 가져와서 Slider에 추가한다.
   */
  const onSlideToEdge = useCallback(async(edge: "start" | "end") => {
    const needWeekStartDay = edge === "start" ? weeks[0][0].day.subtractOnClone(1, "week") : weeks[weeks.length-1][0].day.addOnClone(1, "week");
    const newWeek = (await loadWeeks(needWeekStartDay))[0]; // 새로운 week 하나만 받아옴으로 0번으로 가져옴
    if(edge === "start"){
      updateWeeksRef.current = () => {
        setWeeks([newWeek, ...weeks]);
      }
    // 뒤
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
                  
                  // 겹쳤을 때, bg가 투명해서 겹쳐보이는 것을 방지
                  ".workspace-tabs .workspace-leaf &": {
                    backgroundColor: "var(--background-secondary)",
                  },
                  ".workspace-split.mod-root .view-content &": {
                    backgroundColor: "var(--background-primary)",
                  }
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
                          background: "var(--background-primary)",
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