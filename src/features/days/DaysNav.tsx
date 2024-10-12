import { Day } from "shared/day";
import clsx from "clsx";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./days-nav.scss";
import { PerCentageCircle } from "shared/components/PercentageCircle";
import { Navigation, Mousewheel } from 'swiper/modules';
import { Swiper, SwiperClass, SwiperRef, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { routineNoteArchiver } from "entities/archive";
import { routineNoteService } from "entities/routine-note";
import { useDaysNav } from "./use-days-nav";

// week를 로드하는 함수. option은 앞뒤로 추가할 week의 수. prev: -1, next: 2라면 총 4개의 week를 로드한다.
const loadWeek = async (day: Day, {prev, next}: {prev: number, next: number} = {prev: 0, next: 0}) => {
  const start = day.subtractOnClone(prev*7, "day");
  const end = day.addOnClone((next + 1)*7, "day").subtract(1, "day"); // week의 시작날짜는 포함이기에 마지막에 하나 빼줘야함.

  // 존재하는 루틴 노트들 불러오기
  const notes = (await routineNoteArchiver.loadBetween(start, end)).map(routineNote => {
    const day = routineNote.day;
    const percentage = routineNoteService.getTaskCompletion(routineNote).percentageRounded;
    return {day, percentage};
  });
  
  /**
   * notes은 이미 존재하는 note들만 가져오기때문에, 원래 요청된 사이즈만큼의 노트가 존재하지 않을 수 있음. 
   * 때문에 빈노트 element들을 만들어서 채워주어야하는데, 이 때 사용될 수 있는 요청된 사이즈만큼의 배열이 채워졌는지 확인하는 함수.
   */
  const isRequestedSize = () => notes.length === (prev+next+1)*7;

  /**
   * notes의 시작과 끝을 먼저 정해진 경계값으로 채우고, 사이를 매꾸는 방식을 사용한다. 
   * 다만, notes중에서 비어있는 노트들이 이 경계값인 경우가 있을 수 있다. 
   * 때문에 이를 확인해서 경계값이 비어있는 경우 먼저 채워준다.
   */
  if(notes.length === 0){ // 아예 가져온 노트가 없다면 경계가 모두 없음
    notes.push({day: start.clone(), percentage: 0});
    notes.push({day: end.clone(), percentage: 0});
  } else {
    if(!notes[0].day.isSameDay(start)){
      notes.unshift({day: start.clone(), percentage: 0});
    }
    if(!notes[notes.length-1].day.isSameDay(end)){
      notes.push({day: end.clone(), percentage: 0});
    }
  }

  // 매꾸기
  for(let i = 0; i+1 < notes.length; i++){
    const note = notes[i];
    const nextNote = notes[i+1];
    const isContinueous = () => note.day.addOnClone(1, "day").isSameDay(nextNote.day);
    if(!isContinueous()){
      const emptyNote = {day: note.day.addOnClone(1, "day"), percentage: 0};
      notes.splice(i+1, 0, emptyNote);
    }
    if(isRequestedSize()) break;
  }

  // 하나의 배열에 담겨있는 day들을 week의 2차원 배열로 변환
  const weeks: {day:Day, percentage:number}[][] = new Array(prev+next+1).fill([]).map(() => []);
  let weekIdx = 0;
  for(const currentDay of notes){
    // 최초 week에 추가
    const currentWeek = weeks[weekIdx];
    if(currentWeek.length === 0){
      currentWeek.push(currentDay);
      continue;
    }
    // 만약 week가 꽉 찼다면 weekIdx를 증가시키고 다음 week에 추가
    if(weeks[weekIdx].length === 7){
      weekIdx++;
      if(weekIdx >= weeks.length) break;
      weeks[weekIdx].push(currentDay);
      continue;
    }
    weeks[weekIdx].push(currentDay);
  }
  return weeks;
};


interface DaysNavProps {
  currentDay: Day;
  onDayClick: (day: Day, event?: React.MouseEvent) => void;
}
export const DaysNav = ({ currentDay, onDayClick }: DaysNavProps) => {
  // 일주일 단위들의 배열
  const [ weeks, setWeeks ] = useState<{day:Day, percentage:number}[][]>([]);

  // 현재 보고있는 week의 시작일. props로 전달된 currentDay를 기준으로 한다.
  const currentWeekStartDay = useMemo(() => currentDay.clone(m => m.startOf("week")), [currentDay]);

  // swiper instance
  const swiperRef = useRef<SwiperRef>(null);

  // circle 채워지는 애니메이션 on/off
  const circleTransitionRef = useRef<boolean>(false);

  /**
   * currentDay의 percentage는 routine note view에 의해서 동적으로 변할 수 있다. 
   * 해당 훅을 통해서 부모 컴포넌트가 변경된 frash한 percentage를 전달할 수 있도록 한다.
   * 
   * 해당 값이 -1인 경우는 부모에서 따로 지정해준 값이 없는 경우이다.
   */
  useDaysNav.subscribe(({ percentageUpdateCmd }) => {
    if(!percentageUpdateCmd) return;
    const { day: cmdDay, percentage: cmdPercentage } = percentageUpdateCmd;
    circleTransitionRef.current = true;
    setWeeks(weeks => {
      return weeks.map(week => {
        return week.map(({day, percentage}) => {
          return {
            day,
            percentage: day.isSameDay(cmdDay) ? cmdPercentage : percentage
          }
        })
      })
    })
    setTimeout(() => {
      circleTransitionRef.current = false;
    }, 0);
  });

  /**
   * 최초, 그리고 currentWeekStartDay가 변경될 때마다의 weeks 변경.
   * 현재 날짜가 weeks 안에 어딘가 존재한다면, 아마 이미 swiper가 해당 날짜를 잘 표현하고 있을 것이므로 추가적인 동작을 수행하지 않음.
   */
  useEffect(() => {
    // weeks에 currentWeekStartDay가 포함되어있지 않다면, 해당 week를 로드한다.
    if(!weeks.some(week => week.some(({day}) => day.isSameDay(currentWeekStartDay)))){
      loadWeek(currentWeekStartDay, {prev: 1, next: 1}) // 해당 week와 앞뒤로 하나씩의 week를 로드한다.
      .then(weeks => {
        setWeeks(weeks);
        // 새롭게 3개의 week를 로드했으므로, swiper를 중간으로 이동시킨다.
        setTimeout(() => {
          if(swiperRef.current) swiperRef.current.swiper.slideTo(1, 0);
        });
      })
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
    const newWeek = (await loadWeek(needWeekStartDay))[0]; // 새로운 week 하나만 받아옴으로 0번으로 가져옴
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
    // 상태 업데이트 함수 호출
    updateWeeksRef.current();
    updateWeeksRef.current = null; // 초기화
    // 현재 인덱스가 0이라면, 추가 후에는 0번이 새로운 week가 되므로 swiper를 한칸 뒤로 이동
    if(swiper.isBeginning){
      setTimeout(() => swiper.slideTo(1, 0));
    }
  }, []);



  return (
    <>
      <Swiper
        ref={swiperRef}
        modules={[Mousewheel, Navigation]}
        // navigation
        mousewheel={{
          enabled: true,
          forceToAxis: true,
          sensitivity: 50,
          thresholdTime: 500,
        }}
        onToEdge={async(swiper) =>{
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
            <SwiperSlide key={idx}>
              <div className="dr-days">
                <div className="dr-days__items">
                  {week.map(({day, percentage}, idx) => {
                    return (
                      <div
                        key={idx} 
                        className={clsx("dr-days__item",
                        {
                          "dr-days__today": day.isSameDay(Day.now()),
                          "dr-days__current": day.isSameDay(currentDay)
                        })}
                        onClick={(e) => onDayClick(day, e)}
                      >
                        <div className="dr-days__day-of-week">{day.format("ddd")}</div>
                        <PerCentageCircle
                          percentage={percentage}
                          transition={circleTransitionRef.current}
                          text={day.format("M/D")} 
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </>
  )
}