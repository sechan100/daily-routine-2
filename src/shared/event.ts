// eslint-disable-next-line fsd-import/layer-imports
import { DailyRoutineEvent } from 'app/event-type';
import emitter from 'mitt';


export const drEvent = emitter<DailyRoutineEvent>();