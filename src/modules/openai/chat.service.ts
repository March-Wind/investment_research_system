import OpenAI from 'openai';
import { Injectable, Scope } from '@nestjs/common';
import { awaitWrap, retry } from '@marchyang/enhanced_promise';
import type { ChatCompletion } from 'openai/resources/index';
import type { ChatCompletionChunk, ChatCompletionMessageParam, ChatCompletionCreateParams } from 'openai/src/resources/chat/completions';
import type { Stream } from 'openai/src/streaming';
import Tokens from './tokens';
import { AutoTokenService } from './autoToken.service';
import { CopilotToken, TransferToken, OpenAiToken, AutoToken } from '@/schema/settings/auto_token';
import { randomString } from '@/utils/generatorNunmbers';
import { SocksProxyAgent } from 'socks-proxy-agent';
import type { ClientOptions } from 'openai';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
// ChatCompletion, ChatCompletionMessageParam
// import type { Stream_ChatCompletion } from './types';
const httpAgent = process.env.SOCKS_PROCY ? new SocksProxyAgent(process.env.SOCKS_PROCY) : undefined;
export interface Props {
  model?: ChatCompletionCreateParams['model']; // 模型
  // model?: string;
  stream?: boolean; //是否是流式
  context?: ChatCompletionMessageParam[]; // 上下文
  temperature?: number; // 回答的温度，也是答案概率程度
  frequency_penalty?: number; // 生成的词，会进行去重处理
  presence_penalty?: number; //
}
interface CbObject {
  streamCb?: (data: ChatCompletionChunk) => void;
  cb?: (data: ChatCompletion) => void;
  errCb?: (err: any) => void;
}
@Injectable({ scope: Scope.TRANSIENT })
class ChatService {
  private tokens: Tokens;
  private tokensCount: number;
  public answer: ChatCompletionMessageParam & {
    receiving?: string;
    id?: string;
  };
  private stream: boolean;
  private resp: ChatCompletion | Stream<ChatCompletionChunk> | null = null;
  // private unexpectedReturns = '';
  // private callerFinish: Function | null = null
  private defaultOptions: ChatCompletionCreateParams = {
    // stream: true,
    // model: 'gpt-3.5-turbo',
    // model: 'gpt-4-32k',
    model: 'gpt-4',
    messages: [],
    temperature: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };
  private tokenInfo: AutoToken;
  // @Inject(AutoTokenService)
  constructor(private autoTokenService: AutoTokenService) {}
  async callOpenAi(body: ChatCompletionCreateParams, tokenInfo: AutoToken) {
    // if (/gpt-4/.test(body.model)) {
    //   body.model = 'gpt-4-turbo-preview';
    // }
    const { token, tokenType } = tokenInfo;
    const params: ClientOptions = {
      apiKey: token,
    };
    if (body.stream) {
      this.stream = true;
    }
    if (tokenType === 'copilot') {
      const requestId = randomString(8) + '-' + randomString(4) + '-' + randomString(4) + '-' + randomString(4) + '-' + randomString(12);
      const sessionid = randomString(8) + '-' + randomString(4) + '-' + randomString(4) + '-' + randomString(4) + '-' + randomString(25);
      (tokenInfo as unknown as CopilotToken).headers['x-request-id'] = requestId;
      (tokenInfo as unknown as CopilotToken).headers['vscode-sessionid'] = sessionid;
    }
    if ((tokenInfo as unknown as CopilotToken)?.origin) {
      params.baseURL = (tokenInfo as unknown as CopilotToken)?.origin;
    }
    if ((tokenInfo as unknown as CopilotToken)?.headers) {
      params.defaultHeaders = (tokenInfo as unknown as CopilotToken)?.headers;
    }
    if (httpAgent && !params.baseURL) {
      params.httpAgent = httpAgent;
    }
    const openai = new OpenAI(params);

    const answerFn = async () => {
      const AbortController = globalThis.AbortController;
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort();
      }, 8000);
      const chatParams = {
        ...this.defaultOptions,
        ...body,
        // stream: true,
        // model: 'gpt-4-turbo',
      };
      return openai.chat.completions
        .create(chatParams, {
          stream: chatParams.stream,
          signal: chatParams.stream ? controller.signal : undefined,
        })
        .finally(() => {
          clearTimeout(timer);
        });
    };

    const answer = retry(answerFn, {
      times: 3,
      assessment: async (type, data) => {
        if (type === 'catch') {
          this.autoTokenService.handleUseError(tokenInfo, data, data?.status);
          return false;
        }
        return false;
      },
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.resp = answer;
    return answer;
  }
  async ask(body: ChatCompletionCreateParams, cbObject: CbObject): Promise<unknown> {
    const [tokenInfo] = await awaitWrap(this.autoTokenService.tokenScheduler());
    this.tokenInfo = tokenInfo;
    const { cb, streamCb, errCb } = cbObject;
    const answer = await this.callOpenAi(body, tokenInfo).catch((err: any) => {
      console.log(err);
      errCb?.('接口出错，请稍后再试~');
    });
    if (!answer) {
      return;
    }
    if (this.stream) {
      for await (const chunk of answer as unknown as Stream<ChatCompletionChunk>) {
        if (!chunk.id) {
          // 兼容copilot接口
          continue;
        }
        // if (/unauthorized: token expired/.test(chunk as unknown as string)) {
        //   // 兼容copilot接口,如果token失效,就删除token,重新请求
        // }
        this.handleMessage(chunk);
        streamCb?.(chunk);
      }
    } else {
      let _msg = answer;
      if (typeof answer === 'string') {
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          _msg = JSON.parse(answer.replace(/^\n|\n*$/, ''));
        } catch (error) {
          /* empty */
        }
      }
      this.handleMessage(_msg as ChatCompletion);
      cb?.(_msg as ChatCompletion);
    }
  }
  async close() {
    try {
      await this.autoTokenService.updateCopilotTokenState(this.tokenInfo);
      // 多次调用好像会报错
      if (
        (this.resp as Stream<ChatCompletionChunk>)?.controller &&
        !(this.resp as Stream<ChatCompletionChunk>)?.controller?.signal.aborted
      ) {
        (this.resp as Stream<ChatCompletionChunk>)?.controller?.abort();
      }
      if (this.answer) {
        this.answer.content = this.answer.receiving as string;
      }
      this.resp = null;
    } catch (error) {
      console.error('close error:', error);
      console.log('close error:', error);
    }
  }
  handleMessage(msgItem: ChatCompletionChunk | ChatCompletion) {
    const {
      choices,
      // id,
      // object, model
    } = msgItem;
    const {
      // message,
      // index,
      finish_reason,
    } = choices[0]!;
    // 针对返回类型分别处理
    switch (finish_reason) {
      case 'function_call':
        // 模型决定调用函数
        break;
      case 'content_filter':
        // 有害输出,直接结束
        break;
      case 'length': {
        // 超过上下文
        // 带上返回继续请求会返回400
        return '';
      }
      case 'stop':
      // 已经返回完整信息，正常结束
      // eslint-disable-next-line no-fallthrough
      case null:
      case undefined: // 兼容copilot接口
        // API 响应仍在进行中或不完整
        if (this.stream) {
          this.pushHistoryMsg(msgItem);
        }
        break;
    }
  }
  pushHistoryMsg(msgItem: ChatCompletionChunk | ChatCompletion) {
    const answer = this.answer;
    const {
      choices,
      id,
      // object, model
    } = msgItem;
    const {
      // delta: message1,
      // message,
      // index,
      finish_reason,
    } = choices[0]!;
    const message = (choices[0] as ChatCompletionChunk.Choice).delta || (choices[0] as ChatCompletion.Choice).message;
    const { role, content = '' } = message;
    if (finish_reason === 'stop' || finish_reason === 'length') {
      // json形式一次性返回
      // stream形式返回的结束
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.answer = {
        role: role || this.answer.role || 'assistant',
        content: content || this.answer.receiving || '',
        // id,
      };
      // this.recordTokensCount(content || '');
      return;
    }
    // stream形式返回的收集
    if (answer?.id === id) {
      const { receiving = '' } = answer;
      answer.receiving = receiving + content;
      return;
    }
    // 包含两种情况
    // 1. 没有对话记录的状态 lastMsg是undefined
    // 2. 问完等待回答的状态，lastMsg的role是user,现在回答的role是assistant
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.answer = {
      role: role || this.answer.role || 'assistant',
      id,
      receiving: content || '',
    };
  }
  recordTokensCount(text: string) {
    const tokenizer = this.tokens.tokenizer(text);
    this.tokensCount += this.tokens.tokensCount(tokenizer);
  }
  /**
   * 以chat响应结束后的纯文本作为入参，
   * stream模式的时候，就是等响应结束的拼接的所有问题；
   * 普通模式的时候，就是content作为入参
   *
   * @static
   * @param {string} text
   * @return {*}
   * @memberof ChatService
   */
  static extractJSONFromChat(text: string): Record<any, any> {
    try {
      return JSON.parse(text);
    } catch (error) {
      let json: Record<any, any> | null = null;
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
      marked.parse(text);
      return json;
    }
  }
}

export { ChatService };

// return openai
