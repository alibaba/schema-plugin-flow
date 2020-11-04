/**
 * @author FrominXu
 */
import { objectReadOnly, deepClone } from './utils/common-utils';
/* tslint:disable: no-any no-empty */
enum EVENT_STATUS {
  init = 'init',
  opened = 'opened',
  closed = 'closed',
  allClosed = 'allClosed',
  stop = 'stop',
}
class EventStatus {
  /**
   * 事件状态
   */
  _status: string;
  _eventTaskCount: number;
  constructor(status: string) {
    this._status = status;
    // 标记计数
    this._eventTaskCount = 0;
  }
  getStatus() {
    return this._status;
  }
  setStatus(status: string) {
    if (status === EVENT_STATUS.opened) {
      this._eventTaskCount += 1;
      this._status = EVENT_STATUS.opened;
    } else if (status === EVENT_STATUS.closed) {
      this._eventTaskCount -= 1;
      if (this._eventTaskCount <= 0) {
        // 嵌套事件全部关闭才最终关闭
        this._status = EVENT_STATUS.allClosed;
        this._eventTaskCount = 0;
      } else {
        // 否则标记为打开状态
        this._status = EVENT_STATUS.opened;
      }
    } else {
      this._status = status;
    }
  }
}

const createEventHandler = (emitter: EmitterArgs) => (...originArg: any[]) => {
  const {
    key, eventName, mApi, getHandlers, eventStart, eventEnd, eventStatus,
  } = emitter;
  let handlers: any = getHandlers();
  let nextArg = originArg;
  let ret; // 事件返回值
  let eventmApi = eventStart(); // 事件开始
  let stopEvent: any = () => {
    // 如果在stop后当前方法又触发了EventListener，会刷掉stop状态，直接置空handlers来阻止后续插件执行
    eventStatus.setStatus(EVENT_STATUS.stop);
    handlers = [];
  };
  let event: SifoEvent | null = {
    ...eventmApi,
    key,
    eventName,
    stop: () => { stopEvent(); }, // 防持久装置
    next: (...nArg: any[]) => { nextArg = nArg; },
  };
  // tslint:disable-next-line: whitespace
  let context: SifoEventArgs | null = <SifoEventArgs>objectReadOnly({ event, mApi });
  try {
    for (let i = 0; i < handlers.length; i += 1) {
      const returnVal = handlers[i](context, ...nextArg);
      if (returnVal !== undefined) ret = returnVal;
      if (ret !== undefined) {
        // 有的返回值是复杂对象，直接深拷贝方式不好
        context.event.eventReturnValue = context.event.cloneReturnValue ? deepClone(ret) : ret;
      }
      // 前面的事件被stop了，则不触发后面的事件监听，可考虑在eventStatus内记录事件数与状态，在setAttributes后获取
      if (eventStatus.getStatus() === EVENT_STATUS.stop) {
        break;
      }
    }
  } finally {
    eventEnd(); // 事件结束 这个里面有可能触发watch的EventListener，导致return延后
    event = null;
    context = null;
    eventmApi = null;
    stopEvent = null;
    handlers = null;
  }
  return ret;
};

export default class EventEmitter {
  mApi: ModelApi;
  watcher: any;
  eventHandler: {
    [id: string]: {
      [eventName: string]: {
        normalQ: SifoEventListener[], // 普通事件队列
        preposeQ: SifoEventListener[], // 前置事件队列
      }
    }
  };
  updatedStates: DynamicObject;
  oldStates: DynamicObject;
  eventStatus: EventStatus;
  /**
   * 事件结束时是否需要刷新
   */
  refreshOnEnd: boolean;
  constructor(mApi: ModelApi) {
    this.mApi = mApi;
    this.eventHandler = {};
    // 事件链中更新的状态
    this.updatedStates = {};
    // 事件链中更新的key的旧属性
    this.oldStates = {};
    this.refreshOnEnd = false; // 事件结束后刷新
    this.eventStatus = new EventStatus(EVENT_STATUS.init);
    this.mApiWrap();
  }
  injectWatcher = (watcher: any) => {
    this.watcher = watcher;
  }
  eventStart = () => {
    this.eventStatus.setStatus(EVENT_STATUS.opened);
    // 弱关联
    const weakOldStates = this.oldStates;
    const weakUpdatedStatus = this.updatedStates;
    return {
      // 返回事件开始时指定key的属性
      getOldAttributes: (id: string) => {
        if (weakOldStates[id] !== undefined) return { ...weakOldStates[id] };
        return this.mApi.getAttributes(id);
      },
      // 返回事件执行到当前时，所有更新过的属性
      getUpdatedStates: () => ({ ...weakUpdatedStatus }),
    };
  }
  eventEnd = () => {
    this.eventStatus.setStatus(EVENT_STATUS.closed);
    // 有时会嵌套触发事件，此时需要全部事件关闭后才能清空
    if (this.eventStatus.getStatus() === EVENT_STATUS.allClosed) {
      const updatedStates = this.updatedStates;
      const oldStates = this.oldStates;
      // 重置临时状态
      this.updatedStates = {};
      this.oldStates = {};
      if (updatedStates && Object.keys(updatedStates).length > 0) {
        // 发布watch, 这个时候才能保证是最终状态，要注意的是，dispatchWatch本身也是一批event
        if (this.refreshOnEnd) {
          this.refreshOnEnd = false; // 复位
          // 批量刷新
          this.mApi.refresh();
        }
        // dispatch设计成同步状态，而在同一个event中，是event最终执行完后再dispatch
        this.dispatchWatch(updatedStates, oldStates);
      }
    }
  }

  /**
   * 插件链中需要对接口进行干预，在插件链前创建保存中间状态，在插件链结束时才真正执行
   */
  mApiWrap() {
    const originSetAttributes = this.mApi.setAttributes;
    this.mApi.setAttributes = (id, attributes, refreshImmediately = true) => {
      const oldState = this.mApi.getAttributes(id);
      let refresh = !!refreshImmediately;
      this.refreshOnEnd = this.refreshOnEnd || refresh;
      const eventStatus = this.eventStatus.getStatus();
      if (eventStatus === EVENT_STATUS.opened) {
        // 加入延迟渲染，减少计算次数
        refresh = false;
        // 保存事件执行前的状态
        if (this.oldStates[id] === undefined) {
          this.oldStates[id] = oldState;
        }
        // 保存事件执行中的变更状态
        this.updatedStates[id] = {
          ...this.updatedStates[id],
          ...attributes,
        };
      }
      return new Promise((resolve, reject) => {
        originSetAttributes(id, attributes, refresh).then((res: any) => {
          resolve(res);
        }, (rej: any) => {  // tslint:disable-line: align
          reject(rej);
        });
        // dispatch设计成同步状态，这样得到的结果是一个set一个watch
        if (eventStatus !== EVENT_STATUS.opened) { // opened状态在event.allClosed后批量dispatchWatch
          this.dispatchWatch({ [id]: { ...attributes } }, { [id]: oldState });
        }
      });
    };
  }
  /**
   *  分发属性变化
   *  1. 由setAttributes触发 2. 触发时属性应该是最终状态 3. 事件中应在事件队列最后一个执行完后解决
   */
  dispatchWatch = (updatedStates: DynamicObject = {}, oldStates: DynamicObject = {}) => {
    // 用变更的属性与旧属性进行观测分发
    if (this.watcher) {
      const changes = Object.keys(updatedStates).map(key => {
        return {
          [key]: [updatedStates[key], oldStates[key]]
        };
      });
      this.watcher.dispatchWatch(changes);
    }
  }

  // tslint:disable-next-line: max-line-length
  addEventListener(key: string | EventKeyType, eventName: string, handler: SifoEventListener, prepose: boolean = false) {
    const id = key ? (typeof key === 'string' ? key : `${key.id}`) : 'undefined';
    if (!this.hasHandler(id, eventName)) {
      this.eventHandler[id] = Object.assign({}, this.eventHandler[id], {
        [eventName]: {
          normalQ: [], // 普通事件队列
          preposeQ: [] // 前置事件队列
        }
      }); // 对象事件
    }
    let handlers: any = this.eventHandler[id][eventName];
    if (handlers) {
      const { normalQ, preposeQ } = handlers;
      const targetQueue = prepose ? preposeQ : normalQ;
      if (targetQueue.indexOf(handler) >= 0) {
        console.error(`[sifo-model] handler of ${id}.${eventName} already exist`);
        // 不直接返回，构造新 EventListener ，以保持返回值结构一致 return;
      } else {
        targetQueue.push(handler);
      }
    }
    const emitter: EmitterArgs = {
      key: typeof key === 'string' ? key : (key.eventKey || id),
      eventName,
      mApi: this.mApi,
      getHandlers: () => ([...this.eventHandler[id][eventName].preposeQ, ...this.eventHandler[id][eventName].normalQ]),
      eventStart: this.eventStart,
      eventEnd: this.eventEnd,
      eventStatus: this.eventStatus,
    };
    let eventHandler = createEventHandler(emitter);
    handlers = null;
    return eventHandler; // model 内进行绑定
  }
  /**
   * 检查是否有handler
   * @param {*} id
   * @param {*} eventName
   */
  hasHandler(key: string | EventKeyType, eventName: string) {
    if (!key) return false;
    const id = typeof key === 'string' ? key : `${key.id}`;
    if (!this.eventHandler[id]) return false;
    if (this.eventHandler[id][eventName]) return true;
    return false;
  }
  // tslint:disable-next-line: max-line-length
  removeEventListener(key: string | EventKeyType, eventName: string, handler: SifoEventListener, prepose: boolean = false) {
    const id = key ? (typeof key === 'string' ? key : `${key.id}`) : 'undefined';
    if (this.hasHandler(id, eventName)) {
      const handlers = this.eventHandler[id][eventName];
      if (!handlers) return;
      const { normalQ, preposeQ } = handlers;
      const targetQueue = prepose ? preposeQ : normalQ;
      if (!targetQueue) return;
      for (let i = targetQueue.length - 1; i >= 0; i -= 1) {
        if (targetQueue[i] === handler) {
          targetQueue.splice(i, 1); // 保证对象不变
        }
      }
    }
  }
}