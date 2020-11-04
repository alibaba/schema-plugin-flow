
interface SifoEvent {
  /**
   * 获取事件执行前指定id的属性
   */
  getOldAttributes: (id: string) => DynamicObject;
  /**
   * 获取事件执行到当前时，所有更新过的属性
   */
  getUpdatedStates: () => DynamicObject;
  /**
   * 事件对象的key，一般是相应schema的节点Id
   */
  key: string;
  eventName: string;
  /**
   * 阻止后续插件的执行
   */
  stop: () => void;
  /**
   * 可修改对后续插件的入参（不包含context），无修改时不需调用
   */
  next: (...nArg: any[]) => void,
  /**
   * 有的事件有返回值
   */
  eventReturnValue?: any;
  /**
   * 对返回值进行clone
   */
  cloneReturnValue?: boolean;
}
interface SifoEventArgs {
  mApi: ModelApi;
  event: SifoEvent;
}
/**
 * 事件监听handler
 */
type SifoEventListener = (context: SifoEventArgs, ...args: any[]) => any;
interface EventStatus {
  getStatus: () => string;
  setStatus: (status: string) => void;
}
interface EventKeyType {
  id: string;
  eventKey: string;
  toString: () => string;
  valueOf: () => string;
}
interface EmitterArgs {
  key: string,
  eventName: string,
  mApi: ModelApi;
  getHandlers: () => SifoEventListener[];
  eventStart: DefaultFunc;
  eventEnd: DefaultFunc;
  eventStatus: EventStatus;
}

type DispatchPayload = any;
interface DispatchWatchArgs {
  [watchKey: string]: DispatchPayload[];
}