import { Routine } from "@entities/routine";
import { reorderRoutines } from "@widgets/routine/model/reorder-routines";



const routineCreator = (): (order: number) => Routine => {
  let taskNum = 1;

  return (order) => ({
    name: `r-${taskNum++}`,
    properties: {
      order,
      showOnCalendar: false,
      activeCriteria: "week",
      daysOfWeek: [],
      daysOfMonth: []
    }
  })
}


test('reorderRoutines 함수는 전달된 Routine[]의 순서에 맞게 properties.order 값이 조정된 Routine[]을 반환해야한다.', async () => {
  const r = routineCreator();
  const routines: Routine[] = [
    r(0),
    r(100), 
    r(30), // -> 200
    r(50), // -> 300
    r(370),
    r(400),
    r(500),
    r(600),
  ]
  const result = await reorderRoutines(routines);

  const tunedOrders = result.routines.map(r => r.properties.order);
  expect(tunedOrders).toEqual([0, 100, 200, 300, 370, 400, 500, 600]);

  for(const name of result.requireUpdateMap.keys()) {
    if(name === "r-3" || name === "r-4"){
      expect(result.requireUpdateMap.get(name)).toBe(true);
    }
    else {
      expect(result.requireUpdateMap.get(name)).toBe(false);
    }
  }
});