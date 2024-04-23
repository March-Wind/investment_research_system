import type { ChatCompletionCreateParams, ChatCompletionMessageParam } from 'openai/src/resources/chat/completions';
import type { ChatCompletion } from 'openai/resources/index';
interface Dependencies {
  last_chat_messages?: ChatCompletionMessageParam[]; // 上个聊天的所有messages,包括响应
  last_chat_response?: ChatCompletion; // 上个聊天的响应
  injectPromptJson?: Record<any, any>; // 注入提示词的json
  json?: Record<any, any>; // 上个任务的json
}
type Dependence = keyof Dependencies;

interface ChatTask {
  type: 'chat'; // 聊天
  injectPrompt?: boolean; // 是否注入提示词
  dep?: Dependence[];
  params: ChatCompletionCreateParams;
}

interface ExtractJSONFromTextTask {
  type: 'ExtractJSONFromText';
  dep?: Dependence[];
}
type Task = ChatTask | ExtractJSONFromTextTask;
// interface Task {
//   type:
//     | 'chat' // 聊天
//     | 'extract_JSON_from_text'; // 从文本中抓取json
//   dep?: Dependence;
//   params?: ChatCompletionCreateParams;
//   cb?: (data: ChatCompletionMessageParam) => void;
// }
// [];

// type NestTasks<T> = Array<T | NestTasks<T>>;
// type Tasks = NestTasks<Task>;
type Tasks = Task[];
export { Tasks, Task, Dependencies, Dependence, ChatTask, ExtractJSONFromTextTask };
