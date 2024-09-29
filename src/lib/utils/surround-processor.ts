/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DailyRoutinePlugin from "main";
import { debounce, MarkdownPostProcessorContext } from "obsidian";


// Intercepting 프로세서가 실행되는 컨텍스트동안만 살아있는 로컬 스코프를 제공
export class SurroundProcessorContext {
  #map: Map<string, any>;
  #markdownPostProcessorContext: MarkdownPostProcessorContext;

  constructor(markdownPostProcessorContext: MarkdownPostProcessorContext){
    this.#map = new Map();
    this.#markdownPostProcessorContext = markdownPostProcessorContext;
  }
  
  get markdownPostProcessorContext(){
    return this.#markdownPostProcessorContext;
  }

  set(key: string, value: any){
    this.#map.set(key, value);
  }

  get(key: string){
    return this.#map.get(key);
  }

  remove(key: string){
    const value = this.#map.get(key);
    this.#map.delete(key);
    return value;
  }
}
let context: SurroundProcessorContext | null = null;


type PreProcessor = (ctx: SurroundProcessorContext) => void;
type Processor = (element: HTMLElement, ctx: SurroundProcessorContext) => void;
type PostProcessor = (ctx: SurroundProcessorContext) => void;
const processors = {
  pre: (ctx: SurroundProcessorContext) => {},
  processor: (element: HTMLElement, ctx: SurroundProcessorContext) => {},
  post: (ctx: SurroundProcessorContext) => {},
}
export const surroundProcessor = {
  setPre: (pre: PreProcessor) => {
    processors.pre = pre;
  },
  setProcessor: (processor: Processor) => {
    processors.processor = processor;
  },
  setPost: (post: PostProcessor) => {
    processors.post = post;
  },
}



let firstProcessorCalled = false;
const _d = debounce((ctx: SurroundProcessorContext) => {
  // 반드시 필요한 후처리 작업
  console.groupEnd();
  context = null; // context clear
  firstProcessorCalled = false;
  console.groupCollapsed("[SurroundProcessor - POST]");
  processors.post(ctx);
  console.groupEnd();
}, 100, true);

export function surroundProcessorEntryPoint(
  this: DailyRoutinePlugin,
  element: HTMLElement,
  markdownPostProcessorContext: MarkdownPostProcessorContext
) {
  if(!firstProcessorCalled){
    context = new SurroundProcessorContext(markdownPostProcessorContext);
    // 기존 프로세서에서 제공하는 context를 내부변수로서 제공
    context.set("markdownPostProcessorContext", markdownPostProcessorContext);
    console.groupCollapsed("[SurroundProcessor - PRE]");
    processors.pre(context);
    console.groupEnd();
    firstProcessorCalled = true;
    console.groupCollapsed("[MarkdownPostProcessor]");
  }
  const ctx = context as SurroundProcessorContext;
  console.debug("[PROCESSOR]", element);
  processors.processor(element, ctx);
  // processor가 여러번 실행되어도, 모든 프로세서가 호출되고 마지막에 한번만 호출됨
  _d(ctx);
}