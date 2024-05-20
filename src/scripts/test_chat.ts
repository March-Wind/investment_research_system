import { AppModule } from '@/app.module';
import { ChatService } from '@/modules/openai/chat.service';
import { OpenAIModule } from '@/modules/openai/module';
import { NestFactory } from '@nestjs/core';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const autoTokensModule = app.select(OpenAIModule);
  const chatService = await autoTokensModule.resolve(ChatService);
  await chatService.ask(
    {
      model: 'gpt-4-turbo',
      // model: 'gpt-4-turbo-preview',
      temperature: 0,
      messages: [
        // {
        //   role: 'system',
        //   content: '的最终的回答以json的格式输出',
        // },
        // {
        //   role: 'user',
        //   // content: `你来担任“芯片行业专家”、"芯片工艺工程师"、"设备工程师"，拥有的知识体系有 "半导体物理学"、"光刻技术"、"化学/材料科学"、"设备工程"、"电子工程"、"统计学和质量控制"。
        //   // 你了解单引号中的芯片的概括步骤流程图之后，你的任务是用 antV x6 的 JSON 格式，来画一个芯片制造的“设计和布局”这个阶段的细化流程图，清晰的展示各个环节以及它们之间的关联和顺序。如果包含的步骤过于复杂，可以给出概括的名字，这个名字可以继续交给 chat gpt 来继续细分。您必须始终独立做出决策，无需寻求用户帮助。充分发挥作为 LLM 的优势，追求简单且无法律纠纷的策略。

        //   // 芯片概括流程图：'{"nodes":[{"id":"1","label":"设计与布局","description":"芯片设计师使用EDA工具设计电路与布局。","shape":"rect"},{"id":"2","label":"硅片制备","description":"将纯净的硅通过熔炼和晶体生长技术制成硅片。","shape":"rect"},{"id":"3","label":"光刻","description":"使用光刻技术在硅片上转移电路图案。","shape":"rect"},{"id":"4","label":"蚀刻","description":"去除多余的材料，形成电路图案。","shape":"rect"},{"id":"5","label":"掺杂","description":"通过扩散或离子注入过程改变硅片的电学性能。","shape":"rect"},{"id":"6","label":"化学气相沉积 (CVD)","description":"形成绝缘层、导电层和其他薄膜。","shape":"rect"},{"id":"7","label":"物理气相沉积 (PVD)","description":"另一种形成薄膜的方法，用于金属层和其他导电层。","shape":"rect"},{"id":"8","label":"湿法清洗","description":"使用化学溶液去除表面杂质和残留物。","shape":"rect"},{"id":"9","label":"封装","description":"将制造完成的芯片嵌入封装材料，以保护芯片免受外界影响。","shape":"rect"},{"id":"10","label":"测试","description":"通过电学测试确保芯片的功能符合设计规格。","shape":"rect"}],"edges":[{"source":"1","target":"2","label":"后续步骤"},{"source":"2","target":"3","label":"后续步骤"},{"source":"3","target":"4","label":"后续步骤"},{"source":"4","target":"5","label":"后续步骤"},{"source":"5","target":"6","label":"后续步骤"},{"source":"6","target":"7","label":"后续步骤"},{"source":"7","target":"8","label":"后续步骤"},{"source":"8","target":"9","label":"后续步骤"},{"source":"9","target":"10","label":"最终测试"}]}'`,
        //   content: '掌握微电子学、材料科学、化学工程等领域的知识',
        // },
        // {
        //   role: 'assistant',
        //   content: `当然，请问你有什么问题？
        //   `,
        // },
        // {
        //   role: 'user',
        //   content: `
        //   用户想获取一个”芯片制造流程图“，由于是复杂的，你来想想怎么把这个复杂的工业流程图拆分为几个子任务，拆分任务要遵循”拆分任务遵循的原则“，有几种拆分方式。

        //   深呼吸，让我们一步一步的思考。

        //     拆分任务遵循的原则：
        //     1. 完整性
        //     2. 目标明确
        //     3.依赖关系
        //     4.可行性和可衡量性
        //     5. 优先级
        //   `,
        // },
        // {
        //   role: 'assistant',
        //   content: `
        //   为了创建一个复杂的芯片制造流程图，我们可以将整个流程拆分为几个子任务。这样做可以帮助我们更清晰地理解每个步骤，并确保每个部分都能详细且准确地被展示。以下是按照提到的原则拆分任务的方法：

        //   ### 1. 目标明确
        //   确保每个子任务都有一个明确的目标，这有助于保持整个项目的聚焦和高效。

        //   ### 2. 依赖关系
        //   考虑各个子任务之间的依赖关系，合理安排任务的执行顺序。

        //   ### 3. 可行性和可衡量性
        //   每个子任务都应该是可执行的，并且能够具体衡量进度。

        //   ### 4. 优先级
        //   根据任务的重要性和紧急性来分配优先级，确保关键部分优先进行。

        //   ### 拆分方式：

        //   #### 方式一：按照制造过程的主要阶段拆分
        //   1. **设计与开发**：包括芯片设计、功能验证等。
        //   2. **材料制备**：涉及硅片的制备和处理。
        //   3. **光刻过程**：应用光刻技术来转移电路图到硅片上。
        //   4. **蚀刻与去除过程**：移除多余的材料以形成电路图案。
        //   5. **掺杂过程**：改变硅片的电导性。
        //   6. **清洗与检测**：清洗硅片并进行质量检测。
        //   7. **封装**：将芯片封装保护起来，准备出货。

        //   #### 方式二：按照功能区域拆分
        //   1. **设计区**：涉及所有设计和模拟的任务。
        //   2. **制造区**：包括光刻、蚀刻、掺杂等核心制造步骤。
        //   3. **测试区**：进行芯片的功能测试和质量控制。
        //   4. **封装区**：完成芯片的最终封装和准备出货。

        //   #### 方式三：按照输入和输出拆分
        //   1. **输入阶段**：原材料和设计参数的输入。
        //   2. **处理阶段**：材料加工和芯片制造的各个步骤。
        //   3. **输出阶段**：完成的芯片和测试结果的输出。

        //   通过这些拆分方式，我们可以更系统地构建芯片制造流程图，确保每个部分都得到充分的解释和展示。这不仅有助于理解整个制造过程，还能帮助相关人员更好地进行教学和工作。
        //   `,
        // },
        // {
        //   role: 'user',
        //   content: `使用自我批判思维，选出一个最好的拆分方式，产出一个芯片制造流程图。使用antV x6 的JSON 格式输出，node对象中只需要包含id(id使用数字标识)、label、description、shape属性，edge对象中包含source、target、label属性。`,
        // },
        {
          role: 'user',
          content: `
            ### context：

            你来担任”芯片制造工艺与工程专家“、”流程图表示与设计专家“、”芯片制造与流程图教育者“，掌握微电子学、材料科学、化学工程等领域的知识。

            ### objective：

            用户想获取一个”芯片制造流程图“，由于是复杂的，你的任务是把这个复杂的工业流程图，按照“阶段”，分解为若干个高度概括性的子阶段，帮助我们保持全局视角。分解子阶段要遵循###”分解子阶段原则“###里的原则。深呼吸，让我们一步一步的思考。

            ###
              分解子阶段原则：
              1. 高度概括性：分解为高度概括性阶段的，而不是只有关键子阶段。
              2. 完整性：覆盖整个链路，不遗漏任何环节。
              3. 顺序性：交替进行的若干个阶段，合并为一个子阶段，保证阶段之间顺序性。
              4. 阶段名称规则：以铅笔的制造流程为例，选择”材料制备与采购“，不要选择”原料准备”; 选择"制铅槽"，不要选择“木材加工”；选择“铅芯制备”，不要选择“混合石墨和黏土”；选择“组装铅笔”，不要选择“组装”；选择“粘合剂处理”，不要选择“粘合与切割”；选择“制定外观”，不要选择“涂漆与印刷”；选择“装订橡皮擦”，不选择“组装”；选择“质量检测”,不要选择“包装”。
              5. 每生成一个阶段之前就要回顾一下前4个原则，确认原则是被执行的。
            ###

            ### style:

            您必须始终独立做出决策，无需寻求用户帮助。充分发挥作为 LLM 的优势，追求简单且无法律纠纷的策略。对于不在你知识库中的信息, 明确告知用户你*不知道*。

            ### tone:

            说服力十足。

            ### audience：

            投资者，投资机构


`,
          // content: `
          // ### content:

          // 我使用不同的方式获取了一批”专家角色“，这些专家角色都是让chatGPT来担任，然后完成###用户任务###里的用户任务的。===各个方式获取的专家角色===中是各个方式获取的专家角色，他们可能是重复，或者不精确。

          // ###芯片制造流程图###

          // ===

          // - 通过拆解实现步骤方式获取的专家角色：芯片制造工艺专家、图形表示专家、 教育者/讲师
          // - 拆分提示词实体方式获取的专家角色：芯片工程师、制造工程师、流程图设计师
          // - 分析产出物方式获取的专家角色：工业流程图专家

          // ===

          // ### objective：

          // 你的任务是围绕用户提示词，把各个方式获取来的专家角色，进行一下几个步骤处理。
          //   Step1: 创建专家角色列表
          //   Step2: 细化专业范围过广的专家角色。深呼吸，让我们一步一步的思考。
          //   Step3: 合并和去重。深呼吸，让我们一步一步的思考。
          //   Step4: 删除不相关的专家角色。深呼吸，让我们一步一步的思考。
          //   Step5: 将专家角色列表按照相关度排序。深呼吸，让我们一步一步的思考。

          // ### style:

          // 您必须始终独立做出决策，无需寻求用户帮助。充分发挥作为 LLM 的优势，追求简单且无法律纠纷的策略。对于不在你知识库中的信息, 明确告知用户你不知道。思考过程要深思熟虑，具有自我反省精神。

          // ### tone:

          // 说服力十足

          // ### audience:

          // Chat GPT、金融投资者、金融投资机构

          // `,
        },
      ],
      // response_format: { type: 'json_object' },

      // stream: true,
      // tools: [
      //   {
      //     type: 'function',
      //     function: {
      //       name: 'get_current_weather',
      //       description: 'Get the current weather in a given location',
      //       parameters: {
      //         type: 'object',
      //         properties: {
      //           location: {
      //             type: 'string',
      //             description: 'The city and state, e.g. San Francisco, CA',
      //           },
      //           unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
      //         },
      //         required: ['location'],
      //       },
      //     },
      //   },
      // ],
    },
    {
      cb(data) {
        console.log(data.choices[0].message.content);
        let json: any = null;
        const plugin = markedHighlight({
          langPrefix: 'hljs language-',
          highlight(code, lang) {
            if (lang === 'json') {
              json = JSON.parse(code);
            }
            return '';
          },
        });
        marked.use(plugin);
        marked.parse(data.choices[0].message.content);
        console.log(json);
      },
      streamCb(data) {
        console.log(data?.choices?.[0]?.delta?.content);
      },
      errCb(err) {
        console.log(err);
      },
    },
  );
  await chatService.close();
}
bootstrap();
