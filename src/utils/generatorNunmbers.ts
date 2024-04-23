import crypto from 'crypto';

/**
 * 生成随机字符串
 * @param {number} length
 * @return {*}
 */
const randomString = (length: number) => {
  // 在这段代码中，length 参数表示要生成的十六进制字符串的长度。
  // 由于 crypto.randomBytes() 方法生成的是字节（bytes）
  // 而每个字节可以表示两个十六进制字符，所以需要将 length 除以 2，以确保生成的字节数与所需的十六进制字符长度相匹配。
  const bytes = crypto.randomBytes(length / 2);
  return bytes.toString('hex');
};

export { randomString };
