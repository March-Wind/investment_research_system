import type { Types } from 'mongoose';
import { Document } from 'mongoose';
// export interface ElementaryOptions {}

interface DocumentObject extends Record<string, any> {
  _id: Types.ObjectId;
}
abstract class Elementary {
  constructor() {}
  /**
   * 将文档转成对象
   *
   * @static
   * @template T
   * @param {(T[] | T)} data
   * @return {*}  {(DocumentToObject<T>[] | DocumentToObject<T>)}
   * @memberof Elementary
   */
  static transformDocument<T extends Document>(input: T, removeId: true): Omit<T, keyof Document>;
  static transformDocument<T extends Document>(input: T, removeId?: false): Omit<T, keyof Document> & { id: string };
  static transformDocument<T extends Document>(input: T, removeId?: boolean): any {
    return input.toObject({
      getters: true,
      virtuals: true,
      versionKey: false,
      transform(...arg: any[]) {
        const ret = arg[1];
        delete ret._id;
        removeId && delete ret.id;
        return ret;
      },
    });
  }
  /**
   * 将aggregate的结果里的_id转成id
   *
   * @static
   * @template T
   * @param {T} input
   * @return {*}  {(Omit<T, '_id'> & { id: string })}
   * @memberof Elementary
   */
  static transformObject<T extends DocumentObject>(input: T): Omit<T, '_id'> & { id: string };
  static transformObject<T extends DocumentObject>(input: T, removeId: true): Omit<T, '_id'>;
  static transformObject<T extends DocumentObject>(input: T, removeId?: boolean): any {
    const { _id, ...reset } = input;
    return {
      ...reset,
      ...(removeId ? {} : { id: _id.toString() }),
    } as Omit<T, '_id'> & { id: string };
  }
  /**
   * 把数据库的结果转化成无js对象,_id转成id
   *
   * @static
   * @template T
   * @param {(T | T[])} input
   * @return {*}  {*}
   * @memberof Elementary
   */
  static transform<T extends Document>(input: T): Omit<T, keyof Document> & { id: string };
  static transform<T extends Document>(input: T[]): (Omit<T, keyof Document> & { id: string })[];
  static transform<T extends DocumentObject>(input: T): Omit<T, '_id'> & { id: string };
  static transform<T extends DocumentObject>(input: T[]): (Omit<T, '_id'> & { id: string })[];
  // removeId的类型
  static transform<T extends Document>(input: T, removeId: true): Omit<T, keyof Document>;
  static transform<T extends Document>(input: T[], removeId: true): Omit<T, keyof Document>[];
  static transform<T extends DocumentObject>(input: T, removeId: true): Omit<T, '_id'>;
  static transform<T extends DocumentObject>(input: T[], removeId: true): Omit<T, '_id'>[];
  static transform<T extends Document | DocumentObject>(input: T | T[], removeId?: any): any {
    if (Array.isArray(input)) {
      if (input[0] instanceof Document) {
        return (input as Document[]).map((item) => Elementary.transformDocument(item, removeId));
      } else {
        return (input as DocumentObject[]).map((item) => Elementary.transformObject(item, removeId));
      }
    } else {
      if (input instanceof Document) {
        return Elementary.transformDocument(input, removeId);
      } else {
        return Elementary.transformObject(input, removeId);
      }
    }
  }
}

function preCheckConnection(...arg: any[]) {
  // 装饰器函数
  const [, , descriptor] = arg;
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    (this as any).checkConnection();
    // @resolve: 如果是异步，那么将返回promise,没有改变函数的返回结果。
    return originalMethod.apply(this, args);
  };
}

export default Elementary;
export { preCheckConnection };
