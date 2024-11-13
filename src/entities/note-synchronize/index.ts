/**
 * 노트들은 노트자체로 만들고나서 정적으로 존재하는 것이 아니라, routine들이 변경됨에 따라서 업데이트될 필요가 있다. 
 * 이를 위한 api들을 정의하는 slice.
 */
export { executeRoutineNotesSynchronize } from "./synchronize";