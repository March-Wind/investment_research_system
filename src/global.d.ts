declare global {
  // 全局变量
  namespace NodeJS {
    interface ProcessEnv {
      // mongodb的链接
      MONGODB_URI: string;
      // mongoDB的授权用户的表
      AUTH_SOURCE: string;
      SECRET_KEY: string;
      OPENAI_API_KEY: string;
      OPENAI_API_KEY_40?: string;
      OPENAI_API_KEY_35?: string;
    }
  }
}

// declare module '*.json' {
//   const value: Record<string, any>;
//   export default value;
// }

export {};
