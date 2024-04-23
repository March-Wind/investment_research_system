import { AppModule } from '@/app.module';
import { ChatService } from '@/modules/openai/chat.service';
import { OpenAIModule } from '@/modules/openai/module';
import { NestFactory } from '@nestjs/core';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const autoTokensModule = app.select(OpenAIModule);
  const chatService = autoTokensModule.get(ChatService);
  await chatService.ask(
    {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant designed to output JSON.',
        },
        {
          role: 'user',
          content: `你来担任“芯片行业专家”、"芯片工艺工程师"、"设备工程师"，拥有的知识体系有 "半导体物理学"、"光刻技术"、"化学/材料科学"、"设备工程"、"电子工程"、"统计学和质量控制"。
          你了解单引号中的芯片的概括步骤流程图之后，你的任务是用 antV x6 的 JSON 格式，来画一个芯片制造的“设计和布局”这个阶段的细化流程图，清晰的展示各个环节以及它们之间的关联和顺序。如果包含的步骤过于复杂，可以给出概括的名字，这个名字可以继续交给 chat gpt 来继续细分。您必须始终独立做出决策，无需寻求用户帮助。充分发挥作为 LLM 的优势，追求简单且无法律纠纷的策略。
          
          芯片概括流程图：'{"nodes":[{"id":"1","label":"设计与布局","description":"芯片设计师使用EDA工具设计电路与布局。","shape":"rect"},{"id":"2","label":"硅片制备","description":"将纯净的硅通过熔炼和晶体生长技术制成硅片。","shape":"rect"},{"id":"3","label":"光刻","description":"使用光刻技术在硅片上转移电路图案。","shape":"rect"},{"id":"4","label":"蚀刻","description":"去除多余的材料，形成电路图案。","shape":"rect"},{"id":"5","label":"掺杂","description":"通过扩散或离子注入过程改变硅片的电学性能。","shape":"rect"},{"id":"6","label":"化学气相沉积 (CVD)","description":"形成绝缘层、导电层和其他薄膜。","shape":"rect"},{"id":"7","label":"物理气相沉积 (PVD)","description":"另一种形成薄膜的方法，用于金属层和其他导电层。","shape":"rect"},{"id":"8","label":"湿法清洗","description":"使用化学溶液去除表面杂质和残留物。","shape":"rect"},{"id":"9","label":"封装","description":"将制造完成的芯片嵌入封装材料，以保护芯片免受外界影响。","shape":"rect"},{"id":"10","label":"测试","description":"通过电学测试确保芯片的功能符合设计规格。","shape":"rect"}],"edges":[{"source":"1","target":"2","label":"后续步骤"},{"source":"2","target":"3","label":"后续步骤"},{"source":"3","target":"4","label":"后续步骤"},{"source":"4","target":"5","label":"后续步骤"},{"source":"5","target":"6","label":"后续步骤"},{"source":"6","target":"7","label":"后续步骤"},{"source":"7","target":"8","label":"后续步骤"},{"source":"8","target":"9","label":"后续步骤"},{"source":"9","target":"10","label":"最终测试"}]}'`,
        },
      ],
      response_format: { type: 'json_object' },
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
}
bootstrap();
