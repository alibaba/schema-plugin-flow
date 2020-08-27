/**
 * @author FrominXu
 */
import EventEmitter from './Event';

const WATCH_EVENT_NAME = 'SIFO_MODEL_INNER_WATCH_EVENT_NAME';
const KEY_SUFFIX = 'SIFO_MODEL_INNER_WATCH_KEY_SUFFIX';
class WatcherKeyType {
  id: string;
  eventKey: string;
  constructor(key: string) {
    this.id = `${key}_${KEY_SUFFIX}`;
    this.eventKey = key;
  }
  toString() {
    return this.id;
  }
  valueOf() {
    return this.id;
  }
}
const getId = (key: string) => new WatcherKeyType(key);//`${key}_${KEY_SUFFIX}`; // 后缀比前缀能更快进行查找
export default class Watcher {
  eventEmitter: EventEmitter;
  watchList: { [key: string]: any };
  watchExeQueue: DispatchWatchArgs[]; // 分发执行队列
  private _running: boolean;
  idMap: { [key: string]: WatcherKeyType };
  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this.watchList = {};
    this.watchExeQueue = [];
    this._running = false;
    this.idMap = {};
  }
  watch: ModelApi['watch'] = (key: string, handler: SifoEventListener) => {
    let iId = this.idMap[key];
    if (!iId) {
      iId = getId(key);
      this.idMap[key] = iId;
    }
    const eventHandler = this.eventEmitter.addEventListener(iId, WATCH_EVENT_NAME, handler);
    this.watchList[iId.id] = eventHandler;
  }
  removeWatch: ModelApi['removeWatch'] = (key: string, handler: SifoEventListener) => {
    //const iId = getId(key);
    const iId = this.idMap[key];
    if (iId) {
      this.eventEmitter.removeEventListener(iId, WATCH_EVENT_NAME, handler);
    }
  }
  sendWatch = () => {
    // 当有循环触发时将导致此处死循环
    while (this.watchExeQueue.length > 0) {
      this._running = true;
      const dispatchArgs = this.watchExeQueue.shift();
      if (!dispatchArgs) {
        this._running = false;
        return;
      }
      try {
        // 每个dispatch按照触发源的顺序来分发，dispatch的顺序可能影响最终状态
        Object.keys(dispatchArgs).forEach(key => {
          const iId = this.idMap[key];
          if (iId) {
            const watchHandler = this.watchList[iId.id];
            if (watchHandler) {
              watchHandler(dispatchArgs[key]);
            }
          }
        });

      } finally {
        this._running = false;
      }
    }
    this._running = false;
  }
  dispatchWatch = (dispatchArgs: DispatchWatchArgs) => {
    // 托管dispatch，以处理watch中触发的下层watch，保证分发顺序正确
    if (Object.keys(this.watchList).length <= 0) return;
    this.watchExeQueue.push(dispatchArgs);
    if (!this._running) {
      this.sendWatch();
    }
  }
}