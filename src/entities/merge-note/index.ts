/**
 * routine으로부터 note가 만들어지고나면, 그 이후에 노트들은 각각 독립적으로 데이터를 축적해나간다.
 * 하지만 도중에 routine 진영에 변화가 생길 수 있는데, 이 때 그 변화를 이미 독립되어 존재하는 각 note들에 반영해줘야한다.
 * 해당 slice는 이러한 작업을 구현한다.
 */
export { useRoutineMutationMerge } from "./use-routine-mutate-merge";