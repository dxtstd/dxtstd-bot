import * as uuid from 'uuid';

import LoggerDefault from './logger.ts';
import pino from 'pino';

interface ITask {
  func: (...args: any) => Promise<void | any>;
  args: any[];
  cb?: (result: unknown) => void;
}

class Queue {
  public TIMEOUT_TIME = 2.5 * 1000;
  public tasks: Map<string, ITask> = new Map();

  public status: { total_task: { done: number; error: number; timeout: number }; running: boolean } = {
    total_task: {
      done: 0,
      error: 0,
      timeout: 0,
    },
    running: false,
  };
  private logger: pino.Logger;

  public add = (func: (...args: any) => Promise<void | unknown>, args: any[]): void => {
    const uuid_generate: string = uuid.v4();
    this.logger.debug({ task_id: uuid_generate }, "add task to queue...")
    this.tasks.set(uuid_generate, {
      func,
      args,
    });

    if (!this.status.running) this.run();
  }

  public addCB = (func: (...args: any) => Promise<any>, args: any[], cb: (result: unknown) => void): void => {
    const uuid_generate: string = uuid.v4();
    this.logger.debug({ task_id: uuid_generate }, "add task to queue with callback...")
    this.tasks.set(uuid_generate, {
      func,
      args,
      cb,
    });

    if (!this.status.running) this.run();
  }

  public addWait = async (func: (...args: any) => Promise<any>, args: any[]): Promise<any> => {
    return new Promise((resolve) => {
      this.addCB(func, args, resolve);
    });
  }

  public run = async () => {
    if (this.status.running) return void 0;
    if (this.tasks.size == 0) return void 0;

    const iterator = this.tasks.entries();
    const [uuid_generate, task]: [string, ITask] = iterator.next().value;

    this.logger.debug(
      {
        task_id: uuid_generate,
      },
      'running task...',
    );

    this.status.running = true;

    const next_queue = () => {
      this.status.running = false;
      this.tasks.delete(uuid_generate);
      this.run();
    };

    const timeout = setTimeout(() => {
      this.status.total_task.timeout += 1;
      this.logger.error(
        {
          task_id: uuid_generate,
        },
        'task run timeout...',
      );
      next_queue();
    }, this.TIMEOUT_TIME);

    const finishHandler = ({ data, error }: { data: any; error: Error }) => {
      clearTimeout(timeout);
      if (error) {
        this.status.total_task.error += 1;
        this.logger.debug(
          {
            message: error.stack || error+"",
            task_id: uuid_generate,
          },
          'error on running task..',
        );
      } else {
        if (task.cb) {
          task.cb(data);
        }
        this.status.total_task.done += 1;
        this.logger.debug(
          {
            task_id: uuid_generate,
          },
          'finish the task...',
        );
      }
      next_queue();
    };

    task
      .func(...task.args)
      .then((data) => finishHandler({ data, error: null }))
      .catch((error) => finishHandler({ data: null, error }));
  }

  constructor() {
    this.logger = LoggerDefault.child({ system: 'bot.queue' });
  }
}

export default Queue;
