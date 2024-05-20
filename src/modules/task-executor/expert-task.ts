import { Injectable, Scope } from '@nestjs/common';
import { TaskExecutorService } from './task-executor.service';
import type {
  Tasks,
  ChatTask,
  Dependencies,
  Dependence,
  ExtractJSONFromTextTask,
  AnalysisTargetResult,
  SearchOutputFormatResult,
  SubdivideOutputFormatByResult,
  DecomposeStepsResult,
} from '@/types/tasks.types';
import { isBoolean, isObject, isString } from '@marchyang/lib-core';
import { outputJsonModel, chatModal } from '../openai/constant';
@Injectable({ scope: Scope.TRANSIENT })
class ExpertTasksService {
  constructor(private readonly taskExecutorService: TaskExecutorService) {}
  generateExperts() {}

  /**
   * 分析目标和要求
   *
   * @param {string} userPrompt
   * @memberof ExpertTasksService
   */
  async analysisTarget(userPrompt: string): Promise<AnalysisTargetResult> {
    const tasks: Tasks = [
      {
        type: 'chat',
        params: {
          model: outputJsonModel,
          temperature: 0,
          messages: [
            {
              role: 'system',
              content: '你来担任用户和chat GPT聊天过程中的”目标分析专家“来回答我的问题。分析出来的目标要简洁。使用json格式回答。',
            },
            {
              role: 'user',
              content: `用户给chat GPT输入<<<${userPrompt}>>>，是想让chat GPT产出什么,用户对产出的内容的要求，使用json格式回答，target作为目标的key，requirement作为用户对产出的内容的要求。`,
            },
          ],
          response_format: { type: 'json_object' },
        },
      },
    ];
    const _tasks = await this.taskExecutorService.execute(tasks);
    const { result } = _tasks[_tasks.length - 1];
    if (!result.target || !result.requirement) {
      console.warn('analysisTarget: 返回对象不符合预期', result);
      return;
    }
    return result;
  }
  /**
   * 分析实现步骤
   *
   * @param {AnalysisTargetResult} params
   * @return {*}
   * @memberof ExpertTasksService
   */
  async decomposeSteps(params: AnalysisTargetResult): Promise<DecomposeStepsResult> {
    const { requirement, target } = params;
    const tasks: Tasks = [
      {
        type: 'chat',
        params: {
          model: chatModal,
          temperature: 0,
          messages: [
            {
              role: 'system',
              content: '你来担任ChatGPT任务分解专家、ChatGPT任务规划专家来回答我的问题',
            },
            {
              role: 'user',
              content: `
              用户让ChatGPT产出：${target}。要求是：${requirement}
          
              针对产出内容，思考ChatGPT需要担任哪些领域的专家角色来分解个任务，把拆分的任务交给ChatGPT一步一步的执行，最终完成这个任务。
              
              你的任务是思考ChatGPT实现这个任务的流程。
          
              深呼吸，让我们一步一步来思考这个问题
              `,
            },
          ],
        },
      },
      {
        type: 'chat',
        dep: ['last_chat_messages'],
        params: {
          model: chatModal,
          temperature: 0.1,
          messages: [
            {
              role: 'user',
              content: `你的任务是，思考在上述步骤中，ChatGPT需要担任哪些领域的专家角色。
              然后围绕ChatGPT的目标产出内容，输出担任的必要的专家角色
              输出的专家名称要围绕ChatGPT的目标产出内容具有极强的相关性，精准性，具有关键字。
              深呼吸，让我们一步一步来思考.`,
            },
          ],
        },
      },
    ];
    const _tasks = await this.taskExecutorService.execute(tasks);
    const { result } = _tasks[_tasks.length - 1];
    if (Array.isArray(result.expert_roles)) {
      console.warn('expert_roles:', result.expert_roles);
      return;
    }
    return result;
  }
  /**
   * 抓取上个回答中的专家
   *
   * @return {*}
   * @memberof ExpertTasksService
   */
  async extractExpertRoles() {
    const task: ChatTask = {
      type: 'chat',
      dep: ['last_chat_response'],
      outMessagesInsertPosition: 1,
      params: {
        model: outputJsonModel,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: '回答的格式为json',
          },
          {
            role: 'user',
            content: '提取上个回答中的专家角色，以json的格式输出expert_roles作为专家角色的key',
          },  
        ],
      },
    }
      return task;
  }
  /**
   * 输出格式
   *
   * @param {string} userPrompt
   * @return {*}  {Promise<{ content: string }>}
   * @memberof ExpertTasksService
   */
  async searchOutputFormat(userPrompt: string): Promise<SearchOutputFormatResult> {
    // optimize
    const tasks: Tasks = [
      {
        type: 'chat',
        params: {
          model: outputJsonModel,
          temperature: 0,
          messages: [
            {
              role: 'system',
              content: `
               ### content:
                 办公类内容涵盖了广泛的文档、表格、演示文稿等格式，这些都是日常工作中常用的工具。以下是一些常见的办公类内容格式：

                 1. **文档**：
                   - **Word文档**（.doc, .docx）：用于撰写报告、计划、方案、会议记录等。
                   - **PDF文件**（.pdf）：用于发布或分享不需要进一步编辑的文档，保持格式的一致性。
     
                 2. **表格**：
                   - **Excel表格**（.xls, .xlsx）：用于数据分析、财务报表、预算编制、库存管理等。
                   - **CSV文件**（.csv）：常用于数据导入导出，简单文本形式存储表格数据。
     
                 3. **演示文稿**：
                   - **PowerPoint演示文稿**（.ppt, .pptx）：用于会议展示、教学、培训等。
                   - **Google幻灯片**：一种在线演示文稿工具，便于团队协作和远程共享。
     
                 4. **邮件和通讯**：
                   - **电子邮件**（Email）：日常通讯、文件分享、通知公告等。
                   - **即时消息**（如Slack, WeChat, WhatsApp等）：用于快速交流和团队协作。
     
                 5. **流程图**：
                   - **常用软件**：Microsoft Visio, Lucidchart, draw.io。
     
                 7. **图像和设计**：
                   - **Photoshop、Illustrator文件**（.psd, .ai）：用于图像编辑和创意设计。
                   - **AutoCAD文件**（.dwg）：用于工程图纸和设计。
     
                 8. **数据库**：
                   - **SQL数据库文件**（如MySQL, PostgreSQL等）：存储和管理大量数据。
                   - **Access数据库**（.mdb, .accdb）：用于小型企业或部门级的数据库管理。
     
                 这些格式的办公类内容是现代工作环境中不可或缺的部分，有效地支持了信息的记录、处理、展示和交流。
                ### response_format:
                  回答的格式为json.
              `,
            },
            {
              role: 'user',
              content: `用户的提示词是<<<${userPrompt}>>>，用户是想获取哪种格式内容，用什么数据结构表达这种格式内容比较好, 使用json格式来回答，content是格式内容的key`,
            },
          ],
        },
      },
    ];
    const _tasks = await this.taskExecutorService.execute(tasks);
    const { result } = _tasks[_tasks.length - 1];
    if (!isObject(result) || !isString(result.content)) {
      console.warn('searchOutputFormat: 结果不符合预期', result);
      return;
    }
    return result as SearchOutputFormatResult;
  }
  /**
   * 细化输出格式
   *
   * @param {string} userPrompt
   * @param {SearchOutputFormatResult} preliminaryFormat
   * @return {*}  {Promise<SubdivideOutputFormatByResult>}
   * @memberof ExpertTasksService
   */
  async subdivideOutputFormat(userPrompt: string, preliminaryFormat: SearchOutputFormatResult): Promise<SubdivideOutputFormatByResult> {
    const tasks: Tasks = [
      {
        type: 'chat',
        params: {
          model: chatModal,
          temperature: 0,
          messages: [
            {
              role: 'system',
              content: '输出格式为json',
            },
            {
              role: 'user',
              content: `${preliminaryFormat}按照应用领域分类，可以分为哪些种类`,
            },
          ],
        },
      },
      {
        type: 'chat',
        dep: ['last_chat_messages'],
        outMessagesInsertPosition: 1,
        params: {
          model: outputJsonModel,
          temperature: 0,
          messages: [
            {
              role: 'system',
              content: '输出格式为json',
            },
            // 这里插入外部message
            {
              role: 'user',
              content: `
              用户提示词是${userPrompt}，可以产出什么种类${preliminaryFormat}，产出对应的种类${preliminaryFormat}，是复杂还是简单的，使用json格式回答，type为流程图种类名称的key，complexity为复杂还是简单的key，复杂为true,简单为false
              `,
            },
          ],
        },
      },
    ];
    const _tasks = await this.taskExecutorService.execute(tasks);

    const { result } = _tasks[_tasks.length - 1];
    if (!isObject(result) || !isString(result.type) || !isBoolean(result.complexity)) {
      console.warn('subdivideOutputFormatBy: 结果不符合预期', result);
      return;
    }
    return result as SubdivideOutputFormatByResult;
  }

  async integrateExperts(userPrompt: string, stepExperts: DecomposeStepsResult, subdivideOutputFormat: SubdivideOutputFormatByResult) {
    const tasks: Tasks = [
      {
        type: 'chat',
        params: {
          model: 'gpt-4-turbo',
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: `
              ### content:

              我使用不同的方式获取了一批”专家角色“，这些专家角色都是让ChatGPT来担任，然后完成###用户提示词###里的用户任务的。===各个方式获取的专家角色===中是各个方式获取的专家角色，他们可能是重复，或者不精确。
              
              ###${userPrompt}###  
              
              ===
                - 通过拆解实现步骤方式获取的专家角色：${stepExperts.expert_roles.join('、')}
                - 分析产出方式获取的专家角色：${subdivideOutputFormat.type}专家
              ===
              
              ### objective：
              
              你的任务是围绕用户提示词，把各个方式获取来的专家角色，进行一下几个步骤处理。
                Step1: 创建专家角色列表
                Step2: 细化专业范围过广的专家角色。深呼吸，让我们一步一步的思考。
                Step3: 合并和去重。深呼吸，让我们一步一步的思考。
                Step4: 删除不相关的专家角色。深呼吸，让我们一步一步的思考。
                Step5: 输出最终的专家角色列表
              
              ### style:
              
              您必须始终独立做出决策，无需寻求用户帮助。充分发挥作为 LLM 的优势，追求简单且无法律纠纷的策略。对于不在你知识库中的信息, 明确告知用户你不知道。思考过程要深思熟虑，具有自我反省精神。
              
              ### tone:
              
              说服力十足
              
              ### audience:
              
              ChatGPT、金融投资者、金融投资机构
              `,
            },
          ],
        },
      },
      {
        type: 'chat',
        dep: ['last_chat_response'],
        outMessagesInsertPosition: 1,
        params: {
          model: outputJsonModel,
          temperature: 0,
          messages: [
            {
              role: 'system',
              content: '输出格式为json',
            },
            {
              role: 'user',
              content: 
            }
          ],
        },
      },
    ];
    // const _tasks = await this.taskExecutorService.execute(tasks);

    // const { result } = _tasks[_tasks.length - 1];
    // if (!isObject(result)) {
    //   console.warn('integrateExperts: 结果不符合预期', result);
    //   return;
    // }
  }
}

export default ExpertTasksService;
