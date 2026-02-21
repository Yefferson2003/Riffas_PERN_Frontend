/**
 * @author yangjh
 * @date 2023-03-09 10:00:00
 * @param {string} OrganizationId 组织ID
 * @param {string} DevKey 开发者Key
 * @param {string} DevSecret 开发者Secret
 * @param {string} BspName BSP 名称
 * @param {string} Logo logo在线地址
 * @param {string} RedirectUrl 重定向地址
 * @param {string} CustomArgs 用户自定义参数；长度不超过100字节
 */
export type JgConfig = {
  OrganizationId: string; // 组织ID
  DevKey: string; // 开发者Key
  DevId?: string; // 开发者ID
  engagelab_logo?: string;
  BspName: string; // BSP 名称
  Logo: string; // logo
  RedirectUrl?: string; // 重定向地址
  CustomArgs?: string; // 用户自定义参数；长度不超过100字节
};
