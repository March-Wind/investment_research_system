import { Injectable, Scope } from '@nestjs/common';
import type { Tasks, ChatTask, Dependencies, Dependence, ExtractJSONFromTextTask, Task } from '@/types/tasks.types';
import { ChatService } from '../openai/chat.service';
import type { ChatCompletion } from 'openai/resources/index';
import { isArray, isNumber, isString } from '@marchyang/lib-core';
import { identifierTemplate } from '../chip_industry/chip_industry.service';
import { AsyncSeriesWaterfallHook } from 'tapable';
import type { ChatCompletionCreateParams } from 'openai/src/resources/chat/completions';

@Injectable({ scope: Scope.TRANSIENT })
export class TaskExecutorService {
  constructor(private chatService: ChatService) {}

  /**
   * 任务执行器
   *
   * @param {Tasks} tasks
   * @return {*}
   * @memberof TaskExecutorService
   */
  async execute(tasks: Tasks) {
    const hook = new AsyncSeriesWaterfallHook<any[][]>(['results']);
    const results: (Task & { result: any })[] = [];
    for (const _task of tasks) {
      hook.tapPromise(_task.type, async (_results) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const result = await this[_task.type](_task, _results);
        _results.push({ ..._task, result });
        return undefined;
      });
    }
    await hook.promise(results);
    return results;
  }
  /**
   * 对话任务
   *
   * @param {ChatTask} task
   * @param {Tasks} chainResults
   * @return {*}  {Promise<ChatCompletionCreateParams>}
   * @memberof TaskExecutorService
   */
  async chat(task: ChatTask, chainResults: Tasks): Promise<ChatCompletionCreateParams> {
    const { dep, params, outMessagesInsertPosition } = task;
    const lastTask = chainResults[chainResults.length - 1];
    debugger;
    if (dep && lastTask) {
      dep.forEach((key) => {
        switch (key) {
          case 'last_chat_messages':
            if (lastTask.type === 'chat') {
              if (isNumber(outMessagesInsertPosition)) {
                params.messages.splice(outMessagesInsertPosition, 0, ...lastTask.result.messages);
              } else {
                params.messages = (lastTask.result.messages || []).concat(params.messages);
              }
            }
            break;
          case 'last_chat_response': {
            if (lastTask.type === 'chat') {
              const LastTasksMessages = lastTask.result.messages;
              const lastMessage = LastTasksMessages[LastTasksMessages.length - 1];
              if (isNumber(outMessagesInsertPosition)) {
                params.messages.splice(outMessagesInsertPosition, 0, lastMessage);
              } else {
                params.messages = ([lastMessage] || []).concat(params.messages);
              }
            }
            break;
          }
          case 'injectPromptJson': {
            if (lastTask.type === 'ExtractJSONFromText') {
              const injectPromptJson = lastTask.result;
              const keys = Object.keys(injectPromptJson);
              params.messages.forEach((chatItem) => {
                keys.forEach((key) => {
                  let content = injectPromptJson[key];
                  // 目前支持string或者string[]
                  if (!isString(content) && !(isArray(content) && !!content.filter((item) => !isString(item)))) {
                    console.warn('injectPromptJson：意外的值', content);
                    return;
                  }
                  if (isString(chatItem.content)) {
                    const reg = new RegExp(identifierTemplate(key), 'g');
                    if (isArray(content)) {
                      content = content.join('、');
                    }
                    chatItem.content = chatItem.content.replace(reg, injectPromptJson[key]);
                  }
                });
              });
            }

            break;
          }
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

    const _params = { ...params };
    _params.messages.push({
      role: 'assistant',
      content: responseData.choices[0].message.content,
    });
    return _params;
  }
  /**
   * 提取json任务
   *
   * @param {ChatTask} task
   * @param {Tasks} chainResults
   * @return {*}  {Promise<Record<any, any>>}
   * @memberof TaskExecutorService
   */
  async ExtractJSONFromText(task: ChatTask, chainResults: Tasks): Promise<Record<any, any>> {
    const { dep } = task;
    const lastTask = chainResults[chainResults.length - 1];
    debugger;
    let json: Record<any, any> | null = null;
    if (dep && lastTask) {
      dep.forEach((key) => {
        switch (key) {
          case 'last_chat_response':
            if (lastTask.type === 'chat' && lastTask.result?.messages) {
              const messages = lastTask.result?.messages;
              const lasMessageContent = messages[messages.length - 1].content;
              if (isString(lasMessageContent)) {
                json = ChatService.extractJSONFromChat(lasMessageContent);
              }
              break;
            }
        }
      });
    }
    return json;
  }
}
