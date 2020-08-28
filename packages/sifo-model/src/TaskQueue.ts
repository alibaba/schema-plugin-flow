/**
 * @author FrominXu
 */
class TaskQueue {
  taskQueue: Function[];
  curTaskIndex: number;
  constructor() {
    this.taskQueue = [];
    this.curTaskIndex = 0;
  }
  push(task: Function | Function[]) {
    if (Array.isArray(task)) {
      this.taskQueue.push(...task);
    } else {
      this.taskQueue.push(task);
    }
    return this;
  }
  run() {
    while (this.taskQueue.length > 0 && this.curTaskIndex < this.taskQueue.length) {
      this.next();
    }
    return this;
  }
  private next() {
    if (this.taskQueue.length > this.curTaskIndex) {
      const curTask = this.taskQueue[this.curTaskIndex];
      this.curTaskIndex = this.curTaskIndex + 1;
      // tslint:disable-next-line: no-unused-expression
      curTask && curTask();
    }
  }
  discard() {
    this.taskQueue = [];
    this.curTaskIndex = 0;
    return this;
  }
}

export default TaskQueue;