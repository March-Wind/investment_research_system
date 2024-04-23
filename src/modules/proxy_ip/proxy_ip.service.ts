import { awaitWrap } from '@marchyang/enhanced_promise';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { collectionName, dbName, ProxyIp } from '@/schema/settings/proxy_ip';

import type { CheckerProxy } from './types';

@Injectable()
export class ProxyIpService {
  constructor(
    @InjectModel(collectionName, dbName)
    private ProxyIpModal: Model<ProxyIp>,
  ) {}

  // 类别一
  async ['checkerProxy'](): Promise<ProxyIp[]> {
    const [ips] = await awaitWrap(
      fetch('https://checkerproxy.net/api/archive/2024-04-12', {
        headers: {
          accept: '*/*',
          'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          cookie: '_ga=GA1.2.667622452.1712650047; _gid=GA1.2.815704047.1712888376; _gat=1',
          referer: 'https://checkerproxy.net/archive/2024-04-12',
          'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36h/',
        },
      }).then((res) => {
        return res.json() as Promise<CheckerProxy[]>;
      }),
    );
    if (!ips) {
      return;
    }
    // const typeMap = {
    //   1: 'http',
    //   2: 'https',
    //   4: 'socks5',
    // };
    // return ips.map((item) => {
    //   return {
    //     ip: String(item.ip),
    //     port: String(item.post),
    //     type: typeMap[item.type],
    //     country: item.addr_geo_country,
    //     city: item.addr_geo_city,
    //     timeout: item.timeout,
    //   };
    // });
  }

  // 增量、更新存量的方式，放入mongoDb
  async collectProxyIp(data: ProxyIp[]) {
    const bulkOperations = data.map((item) => ({
      updateOne: {
        filter: { ip: item.ip }, // 根据 id 进行匹配
        update: item, // 更新为新数据对象
        upsert: true, // 如果数据不存在则插入
      },
    }));
    this.ProxyIpModal.bulkWrite(bulkOperations);
  }
}
