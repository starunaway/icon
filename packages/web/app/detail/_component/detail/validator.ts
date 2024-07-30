import { z } from 'zod';

export const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'iconname 需要大于等于 2 个字符',
    })
    .refine(
      (value) => {
        // 检查字符串是否包含空格
        if (/\s/.test(value)) {
          return false;
        }

        return true;
      },
      {
        message: '不允许包含空格',
      }
    )
    .refine(
      (value) => {
        // 检查字符串是否以字母开头
        if (!/^[a-zA-Z]/.test(value)) {
          return false;
        }

        // 检查字符串是否只包含大小写字母、数字、下划线和中划线
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          return false;
        }

        return true;
      },
      {
        message: '必须以大小写字母开头，且只能包含大小写字母、数字、下划线和中划线',
      }
    ),

  label: z.string(),
  // todo，后面支持数组
  tag: z.optional(z.string()),
  desc: z.string(),
});
