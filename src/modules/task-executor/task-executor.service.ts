import { Injectable, Scope } from '@nestjs/common';
import type { Tasks, ChatTask, Dependencies, Dependence, ExtractJSONFromTextTask } from '@/types/tasks.types';
import { ChatService } from '../openai/chat.service';
import type { ChatCompletionCreateParams } from 'openai/resources';
import type { ChatCompletion } from 'openai/resources/index';
import { isArray, isString } from '@marchyang/lib-core';
import { identifierTemplate } from '../chip_industry/chip_industry.service';

@Injectable({ scope: Scope.TRANSIENT })
export class TaskExecutorService {
  constructor(private chatService: ChatService) {}

  /**
   * 执行器的每个执行函数，第一个参数是任务，第二个参数是上一个任务的依赖，第三个参数是下一个任务的依赖
   * 如果中途有报错，那么就停止
   *
   * 这里考虑过使用tapable来执行任务，因为tapable串行任务是把上一个函数的结果作为下一个函数的入参，由于这里的任务是可以打乱顺序的，也就是函数面临的入参会不一样。
   * 可以说，如果有一个目标结果，然后每次把目标结果作为入参，来修改目标结果是最适合tapable的，tapable不适合每个函数拥有不同的入参。
   * @param {Tasks} tasks
   * @memberof TaskExecutorService
   */
  async execute(tasks: Tasks) {
    let nextTaskDep: Dependencies[] | null = null;
    let i = 0;
    for (const _task of tasks) {
      debugger;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      nextTaskDep = await this[_task.type](_task, nextTaskDep, tasks[i + 1]?.dep);
      debugger;
      i++;
    }
    return nextTaskDep;
  }
  async chat(task: ChatTask, deps?: Dependencies[], nextTaskDep?: Dependence[]) {
    const { params, injectPrompt } = task;

    if (deps) {
      deps.forEach((item) => {
        const key = Object.keys(item)[0] as Dependence;
        switch (key) {
          case 'last_chat_messages':
            params.messages = item[key].concat(params.messages);
            break;
          case 'injectPromptJson':
            if (injectPrompt) {
              const injectPromptJson = item[key];
              const keys = Object.keys(injectPromptJson);
              params.messages.forEach((chatItem) => {
                keys.forEach((key) => {
                  if (isString(chatItem.content)) {
                    const reg = new RegExp(identifierTemplate(key), 'g');
                    let content = injectPromptJson[key];
                    // 目前支持string或者string
                    if (isString(content) || (isArray(content) && !!content.filter((item) => !isString(item)))) {
                      if (isArray(content)) {
                        content = content.join('、');
                      }
                      chatItem.content = chatItem.content.replace(reg, injectPromptJson[key]);
                    } else {
                      console.warn('injectPromptJson：意外的值', content);
                    }
                  }
                });
              });
            }
            break;
        }
      });
    }
    let responseData: ChatCompletion | null = null;

    const askWrap = () => {
      return new Promise<void>((resolve, reject) => {
        const wrapCb = (data: ChatCompletion) => {
          responseData = data;
          resolve();
        };
        this.chatService.ask(
          { ...params },
          {
            cb: wrapCb,
            errCb(err) {
              reject(err);
            },
          },
        );
      });
    };
    await askWrap();
    const _nextTaskDep = nextTaskDep.map((item) => {
      switch (item) {
        case 'last_chat_messages':
          return { [item]: params.messages.concat({ role: 'assistant', content: responseData.choices[0].message.content }) };
        case 'last_chat_response':
          return { [item]: responseData.choices[0].message.content };
      }
    });
    return _nextTaskDep;
  }
  async ExtractJSONFromText(task: ExtractJSONFromTextTask, deps?: Dependence[], nextTaskDep: Dependence[]) {
    let json: Record<any, any> | null = null;
    if (deps) {
      deps.forEach((item) => {
        const key = Object.keys(item)[0] as Dependence;
        switch (key) {
          case 'last_chat_response':
            json = ChatService.extractJSONFromChat(item[key]);
            break;
        }
      });
    }
    const _nextTaskDep = nextTaskDep.map((item) => {
      const key = Object.keys(item)[0] as Dependence;
      switch (item) {
        case 'json':
        case 'injectPromptJson':
          return { [key]: json };
      }
    });
    return _nextTaskDep;
  }
}
