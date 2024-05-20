import { Injectable } from '@nestjs/common';
import type { Tasks } from '@/types/tasks.types';
import { TaskExecutorService } from '../task-executor/task-executor.service';
import { awaitWrap } from '@marchyang/enhanced_promise';

export const identifierTemplate = (variable: string) => {
  return `lzy{${variable}}`;
};

@Injectable()
export class ChipIndustryService {
  constructor(private taskExecutor: TaskExecutorService) {}

  async generatorChipManufacturingProcessFlowchart() {
    const industry = '芯片制造';

    const steps: Tasks = [
      // 询问担任什么角色和拥有什么知识体系
      {
        type: 'chat',
        params: {
          model: 'gpt-4-turbo',
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: `非常精通${industry}的各个环节以及它们之间的关联和顺序的职业是什么，需要拥有什么专业知识`,
            },
          ],
        },
      },
      {
        type: 'chat',
        dep: ['last_chat_messages'],
        params: {
          model: 'gpt-4-turbo-preview',
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: `你的任务是从上一段话中提取出来让 chat gpt 扮演的专家角色和拥有的知识体系，然后以 json 的格式返回专家角色(key 为 expert_roles)和拥有的知识体系(key 为 knowledge_domain)`,
            },
          ],
          // 只有gpt-4-turbo-preview在gpt-4模型中支持json_object
          response_format: { type: 'json_object' },
        },
      },
      {
        type: 'ExtractJSONFromText',
        dep: ['last_chat_response'],
      },
      {
        type: 'chat',
        dep: ['injectPromptJson'],
        params: {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'user',
              content: `你来担任${identifierTemplate('expert_roles')}，拥有的知识体系有${identifierTemplate('knowledge_domain')}。你的任务是用 antV x6 的 JSON 格式，来画一个${industry}流程图、清晰的展示各个环节以及它们之间的关联和顺序。如果包含的步骤过于复杂，可以给出概括的名字，这个名字可以继续交给 chat gpt 来继续细分。您必须始终独立做出决策，无需寻求用户帮助。充分发挥作为 LLM 的优势，追求简单且无法律纠纷的策略。`,
            },
          ],
          response_format: { type: 'json_object' },
        },
      },
      {
        type: 'ExtractJSONFromText',
        dep: ['last_chat_response'],
      },
    ];

    const steps2: Tasks = [
      // 询问担任什么角色和拥有什么知识体系
      {
        type: 'chat',
        params: {
          model: 'gpt-4-turbo-preview',
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: `你现在要协助人类画出${industry}制造流程图，你需要什么专家角色和什么知识体系。

              注意：
              1. 担任的角色要尽可能具有覆盖${industry}行业，不要范围过大，导致和其他领域的角色有歧义.
              2. 输出2~5个专家角色，以及尽可能多的知识体系.
              3. json 的格式返回专家角色(key 为 expert_roles)和拥有的知识体系(key 为 knowledge_domain)`,
            },
          ],
          response_format: { type: 'json_object' },
        },
      },
      {
        type: 'ExtractJSONFromText',
        dep: ['last_chat_response'],
      },
      {
        type: 'chat',
        dep: ['injectPromptJson'],
        params: {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'user',
              content: `你来担任${identifierTemplate('expert_roles')}，拥有的知识体系有${identifierTemplate('knowledge_domain')}。你的任务是用 antV x6 的 JSON 格式，来画一个${industry}流程图、清晰的展示各个环节以及它们之间的关联和顺序。如果包含的步骤过于复杂，可以给出概括的名字，这个名字可以继续交给 chat gpt 来继续细分。您必须始终独立做出决策，无需寻求用户帮助。充分发挥作为 LLM 的优势，追求简单且无法律纠纷的策略。`,
            },
          ],
          response_format: { type: 'json_object' },
        },
      },
      {
        type: 'ExtractJSONFromText',
        dep: ['last_chat_response'],
      },
    ];

    const [json, err] = await awaitWrap(this.taskExecutor.execute(steps2));
    console.log(json, err);
    debugger;
  }
}
