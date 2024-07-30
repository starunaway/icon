export enum ApiErrorCode {
  SUCCESS = 200, // 成功
  Forbidden = 403,
  // 用户类状态码，11开头
  USER_EXIST = 10001, // 用户id无效
  // 权限相关，12 开头
  // icon  13 开头
  IconSaveError = 13001,

  // 公共类型
  // 参数错误
  BadRequestException = 40001,
  // 重复的数据
  DuplicateException = 40002,
  // 未知错误
  UnknownException = 50001,
}
