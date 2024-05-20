import { CopilotToken, TransferToken, dbName, collectionName, OpenAiToken, AutoToken } from '@/schema/settings/auto_token';
import Elementary from '@/utils/elementary';
import { randomString } from '@/utils/generatorNunmbers';
import { awaitWrap, retry } from '@marchyang/enhanced_promise';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
// const copilotDefaultHeaders = {
//   'vscode-machineid': '4b01dcbd455bdb9b67e196b03672a81e9b7fd071a0df0a6bc6c27495e7c3b9e9',
//   'editor-version': 'vscode/1.86.2',
//   'editor-plugin-version': 'copilot-chat/0.12.2',
//   'openai-organization': 'github-copilot',
//   'openai-intent': 'conversation-panel',
//   'copilot-integration-id': 'vscode-chat',
//   'content-type': 'application/json',
//   'user-agent': 'GitHubCopilotChat/0.12.2',
//   'x-github-api-version': '2023-07-07',
// };

@Injectable()
export class AutoTokenService {
  constructor(
    @InjectModel(CopilotToken.name, dbName)
    private copilotTokenModel: Model<CopilotToken>,
    @InjectModel(TransferToken.name, dbName)
    private TransferTokenModel: Model<TransferToken>,
    @InjectModel(collectionName, dbName)
    private autoTokenModel: Model<AutoToken>,
  ) {}
  async insertCopilotTokenMany(): Promise<any> {
    return this.copilotTokenModel.insertMany([
      {
        tokenType: 'copilot',
        startTime: '2024-04-1', // 一个月
        estimatedEndTime: '2024-5-1',
        key: 'tb2gq90w8qo4ef8urg9rrdqb2ria97nm',
        keyState: 'idle',
        requestTokenUrl: 'https://codex.micosoft.icu/copilot_internal/v2/token',
        requestTokenHeaders: {
          authorization: 'token tb2gq90w8qo4ef8urg9rrdqb2ria97nm',
          'editor-version': 'vscode/1.87.0',
          'editor-plugin-version': 'copilot/1.172.0',
          host: 'codex.micosoft.icu',
          'user-agent': 'GithubCopilot/1.172.0',
          accept: '*/*',
          'x-auth-token': 'user:722/fba97df2952445039052c94c5b00441a',
        },
        origin: 'https://codex.micosoft.icu',
        headers: {
          // 'authorization': 'Bearer user:722/fba97df2952445039052c94c5b00441a',
          // 'x-request-id': 'faa2d6c0-d3e2-4d0f-839a-dd5d161c30ca',
          // 'vscode-sessionid': '8e2b1ac6-01e8-42e8-86fc-eb9b13181e141711680769072',
          'x-github-api-version': '2023-07-07',
          'openai-organization': 'github-copilot',
          'copilot-integration-id': 'vscode-chat',
          'editor-version': 'vscode/1.87.0',
          'editor-plugin-version': 'copilot-chat/0.13.1',
          'openai-intent': 'conversation-panel',
          'content-type': 'application/json',
          host: 'codex.micosoft.icu',
          'user-agent': 'GitHubCopilotChat/0.13.1',
          accept: '*/*',
          'x-auth-token': 'user:722/fba97df2952445039052c94c5b00441a',
          'vscode-machineid': randomString(64),
        },
      },
      {
        kind: CopilotToken.name,
        tokenType: 'copilot',
        startTime: '2024-04-1', // 一个月
        estimatedEndTime: '2024-5-1',
        key: 'gho_yfjmn0sl02lvzv5sg69yiot9wkvmrw2mfbko',
        keyState: 'idle',
        requestTokenUrl: 'https://codex.micosoft.icu/copilot_internal/v2/token',
        requestTokenHeaders: {
          authorization: 'token gho_yfjmn0sl02lvzv5sg69yiot9wkvmrw2mfbko',
          'editor-version': 'vscode/1.87.0',
          'editor-plugin-version': 'copilot/1.172.0',
          host: 'codex.micosoft.icu',
          'user-agent': 'GithubCopilot/1.172.0',
          accept: '*/*',
          'x-auth-token': 'user:1295/851db66ef8134b98b30ebf32cbc962d2',
        },

        origin: 'https://codex.micosoft.icu',
        headers: {
          // 'authorization': 'Bearer user:722/fba97df2952445039052c94c5b00441a',
          // 'x-request-id': 'faa2d6c0-d3e2-4d0f-839a-dd5d161c30ca',
          // 'vscode-sessionid': '8e2b1ac6-01e8-42e8-86fc-eb9b13181e141711680769072',
          'x-github-api-version': '2023-07-07',
          'openai-organization': 'github-copilot',
          'copilot-integration-id': 'vscode-chat',
          'editor-version': 'vscode/1.87.0',
          'editor-plugin-version': 'copilot-chat/0.13.1',
          'openai-intent': 'conversation-panel',
          'content-type': 'application/json',
          host: 'codex.micosoft.icu',
          'user-agent': 'GitHubCopilotChat/0.13.1',
          accept: '*/*',
          'x-auth-token': 'user:1295/851db66ef8134b98b30ebf32cbc962d2',
          'vscode-machineid': randomString(64),
        },
      },
    ]);
  }
  async insertTransferTokenMany(): Promise<any> {
    return this.TransferTokenModel.insertMany([]);
  }
  async findAll(): Promise<AutoToken[]> {
    return this.autoTokenModel.find().exec();
  }
  async exchangeCopilotToken(doc: CopilotToken) {
    // AbortController was added in node v14.17.0 globally
    const AbortController = globalThis.AbortController;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 3000);
    const { requestTokenUrl, requestTokenHeaders } = doc;
    return fetch(requestTokenUrl!, {
      headers: requestTokenHeaders,
      signal: controller.signal,
    })
      .then((res: any) => {
        return res.json();
      })
      .then(async (result: any) => {
        if (result && 'token' in result && result.token) {
          // to perfect 保存token到数据库时，错误处理
          const currentTime = new Date();
          // 增加30分钟的有效期
          currentTime.setMinutes(currentTime.getMinutes() + 30);

          await this.copilotTokenModel.updateOne(
            { key: doc.key },
            {
              token: result.token,
              tokenExpiredTime: currentTime,
            },
          );
          return { ...doc, token: result.token };
        }
        return Promise.reject(result);
      })
      .catch(async (err: any) => {
        console.error('获取copilot token失败: ', err);
        // 设置冷静期
        const currentTime = new Date();
        currentTime.setMinutes(currentTime.getMinutes() + 3);
        // 设置交换token的冷静期
        this.copilotTokenModel.updateOne({ key: doc.key }, { keyState: 'idle', exChangeTokenRestTime: currentTime });
        return Promise.reject(err);
      })
      .finally(() => {
        clearTimeout(timeout);
      });
  }
  async getIdleCopilotToken(): Promise<CopilotToken> {
    const [doc, dataError] = await awaitWrap(
      this.copilotTokenModel.findOneAndUpdate(
        // 当前时间超出速率限制时间，和超出交换token冷静期
        {
          $and: [
            { keyState: 'idle' },
            {
              $or: [{ exChangeTokenRestTime: { $exists: false } }, { exChangeTokenRestTime: { $lt: new Date() } }],
            },
            {
              $or: [{ rateLimiting: { $exists: false } }, { rateLimiting: { $lt: new Date() } }],
            },
          ],
        },
        { keyState: 'occupied' },
      ),
    );
    if (!doc || dataError) {
      return Promise.reject({ type: 'NO_ONE_OR_DB_ERROR' });
    }
    const _doc = Elementary.transform(doc);
    // 还在有效期内，直接使用
    if (_doc.token && _doc.tokenExpiredTime && _doc.tokenExpiredTime.getTime() > Date.now()) {
      return _doc;
    } else {
      // token过期，需要重新获取
      return this.exchangeCopilotToken(_doc);
    }
  }
  async getIdleTransferToken(): Promise<TransferToken> {
    console.log(await this.TransferTokenModel.find().exec());
    // 查找keyState为idle并且times的值小于等于10的数据
    const [data, error] = await awaitWrap(
      this.TransferTokenModel.findOneAndUpdate(
        {
          $and: [{ keyState: 'idle' }, { $or: [{ times: { $exists: false } }, { times: { $lte: 10 } }] }],
        }, // times加1
        {
          $inc: { times: 1 },
        },
      ),
    );
    if (!data || error) {
      return Promise.reject({ type: 'NO_ONE_OR_DB_ERROR' });
    }
    const doc = Elementary.transform(data);
    return doc;
  }
  async tokenScheduler() {
    // const allToken = [this.getIdleCopilotToken.bind(this), this.getIdleTransferToken.bind(this)];
    // 这类能保留类型
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const allToken: (() => Promise<AutoToken>)[] = [() => this.getIdleCopilotToken(), () => this.getIdleTransferToken()];
    for (const channel of allToken) {
      const [tokenInfo] = await awaitWrap(
        retry(channel, {
          times: 3,
          async assessment(type, data) {
            if (type === 'catch') {
              if (data?.type === 'NO_ONE_OR_DB_ERROR') {
                // 当前没有可用的token或者数据库报错时
                return false;
              }
              return true;
            }
            return false;
          },
        }),
      );
      if (tokenInfo) {
        return tokenInfo;
      }
    }
  }
  async updateCopilotTokenState(
    tokenInfo: AutoToken,
    params?: { deleteTokenField?: boolean; rateLimiting?: boolean; exchangeTokenRest?: boolean },
  ) {
    const { deleteTokenField = false, rateLimiting = false, exchangeTokenRest = false } = params || {};
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 3);
    let method: Model<CopilotToken> | Model<TransferToken> | Model<AutoToken>;
    switch (tokenInfo.kind) {
      case CopilotToken.name:
        method = this.copilotTokenModel;
        break;
      case TransferToken.name:
        method = this.TransferTokenModel;
        break;
      default:
        method = this.autoTokenModel;
        break;
    }
    const results = await method
      .updateOne(
        { _id: new Types.ObjectId('662776214f487cefd12f05ef') },
        {
          keyState: 'idle',
          ...(deleteTokenField ? { token: '' } : {}),
          ...(rateLimiting ? { rateLimiting: currentTime } : {}),
          ...(exchangeTokenRest ? { exChangeTokenRestTime: currentTime } : {}),
          // // times 减一
          ...(tokenInfo.tokenType === 'transfer' ? { $inc: { times: -1 } } : {}),
        },
      )
      .catch((err) => {
        console.error(err);
      });
    console.log(results);
  }
  async handleUseError(tokenInfo: AutoToken, errorInfo: string, status: number) {
    if (tokenInfo.tokenType === 'copilot') {
      switch (status) {
        case 401: {
          // 401 unauthorized: token expired,或者没有token等
          await this.updateCopilotTokenState(tokenInfo, { deleteTokenField: true }).catch((err: any) => {
            console.log('updateCopilotTokenState: db出错：', err);
          });
          ``;
          return true;
        }
        case 403: {
          // 禁止访问，目前来看，token不会刷新,那就过一段时间再请求
          await this.updateCopilotTokenState(tokenInfo, { deleteTokenField: true, exchangeTokenRest: true }).catch((err: any) => {
            console.log('updateCopilotTokenState: db出错：', err);
          });
          return true;
        }
        case 429: {
          // 速率限制
          await this.updateCopilotTokenState(tokenInfo, { deleteTokenField: true, exchangeTokenRest: true }).catch((err: any) => {
            console.log('updateCopilotTokenState: db出错：', err);
          });
          return true;
        }
      }
    } else {
      if (status !== 400) {
        await this.autoTokenModel.updateOne({ key: tokenInfo.key }, { errorInfo, keyState: 'error' }).catch((err: any) => {
          console.log('updateOpenAiTokenState: db出错：', err);
        });
      }
    }
  }
}
