'use client';
import { IconItemInfo } from '@/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Trash2, Upload, Eye, EyeOff, SaveOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import dayjs from 'dayjs';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formSchema } from './validator';
import { useToast } from '@/components/ui/use-toast';
import { createIcon, deleteIcon, updateIcon } from '@/api';
import { redirect } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppSelector } from '@/lib/store';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export default function IconDetail(props: { icon?: IconItemInfo }) {
  const { icon } = props;
  const { toast } = useToast();

  const user = useAppSelector((state) => state.user);

  const [showOrigin, setShowOrigin] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  const [previewSvg, setPreviewSvg] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: icon?.name || '',
      label: icon?.label || 'normal',
      desc: icon?.desc || '',
      tag: icon?.tag?.toString(),
    },
  });

  const handleDelete = async () => {
    try {
      await deleteIcon(icon?.id!);
      redirect('/');
    } catch (e) {
      toast({
        title: (e as any).message || '删除Icon失败',
        variant: 'destructive',
      });
      console.error(e);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svg';
    input.onchange = (e) => {
      const file = (e as any as React.ChangeEvent<HTMLInputElement>).target.files?.[0];
      setFile(file || null);
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        const result = event.target?.result;
        console.log('svg', result);
        setPreviewSvg(result as string);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('label', values.label);
    formData.append('desc', values.desc);
    formData.append('tag[]', values.tag || '');
    formData.append('updater', user?.name || '');
    if (!icon) {
      // 创建流程
      if (!file) {
        toast({
          title: '请选择Icon文件',
          variant: 'destructive',
        });
        return;
      }

      formData.append('file', file);

      try {
        await createIcon(formData);
        redirect(`/detail/${values.name}`);
      } catch (e) {
        console.error(e);
        toast({
          title: (e as any).message || '创建Icon失败',
          variant: 'destructive',
        });
      }
    } else {
      formData.append('id', icon.id);

      if (file) {
        formData.append('file', file);
      }

      try {
        await updateIcon(formData);
        redirect(`/detail/${values.name}`);
      } catch (e) {
        console.error(e);
        toast({
          title: (e as any).message || '更新Icon失败',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="mb-10 h-[360px] flex gap-8">
      <div className="w-[40%] flex flex-col justify-center items-center relative group">
        {previewSvg && (
          <span
            className={`anticon fill-current inline-block h-36 w-36  overflow-hidden outline-none flex items-center justify-center`}
            dangerouslySetInnerHTML={{ __html: previewSvg }}
          ></span>
        )}
        {!previewSvg &&
          icon &&
          (showOrigin ? (
            <span
              className={`anticon fill-current inline-block h-36 w-36  overflow-hidden outline-none flex items-center justify-center`}
              dangerouslySetInnerHTML={{ __html: icon.svg }}
            ></span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              className={`anticon fill-current inline-block h-36 w-36  overflow-hidden outline-none`}
            >
              <use xlinkHref={`#icon-${icon.name}`} fill="currentColor" />
            </svg>
          ))}
        {!icon && !previewSvg && <span>暂无图标</span>}

        {
          <p className="hover:text-[#7a7a7a] h-12 ">
            <span className="flex gap-2 cursor-pointer" onClick={handleImport}>
              上传图标 <Upload />
            </span>
          </p>
        }

        {(icon || previewSvg) &&
          (previewSvg ? (
            <div className="absolute top-10 left-10 text-green-500">新</div>
          ) : showOrigin ? (
            <div className="absolute top-10 left-10 text-orange-500">原始图标</div>
          ) : (
            <div className="absolute top-10 left-10 text-green-500">处理后图标</div>
          ))}

        {icon && (
          <div className="absolute top-10 right-10 flex gap-2 ">
            {!previewSvg &&
              (showOrigin ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <EyeOff
                        size={18}
                        className="hover:text-[#7a7a7a]  cursor-pointer"
                        onClick={() => {
                          setShowOrigin(!showOrigin);
                        }}
                      ></EyeOff>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>原始 Icon</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Eye
                        size={18}
                        className="hover:text-[#7a7a7a]  cursor-pointer"
                        onClick={() => {
                          setShowOrigin(!showOrigin);
                        }}
                      ></Eye>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>预览</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}

            {previewSvg && (
              <SaveOff
                onClick={() => {
                  setPreviewSvg(null);
                  setShowOrigin(false);
                }}
                size={18}
                className="hover:text-[#7a7a7a]  cursor-pointer"
              />
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Trash2 size={18} className="hover:text-[#7a7a7a]  cursor-pointer" />
              </DialogTrigger>
              <DialogContent className="w-80">
                <p>确定删除 {icon?.name} 吗?</p>

                <DialogFooter className="sm:justify-end">
                  <DialogClose asChild>
                    <Button variant="secondary">取消</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={handleDelete}>
                      删除
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {icon && (
          <p className="absolute bottom-8">
            <p className="text-xs text-muted-foreground">
              更新时间:{dayjs.utc(icon?.updateTime).format('YYYY-MM-DD HH:mm:ss')}
            </p>
            {icon.updater && (
              <p className="text-xs text-muted-foreground">最近更新:{icon.updater}</p>
            )}
          </p>
        )}
      </div>
      <div className="flex items-center justify-start flex-1">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full relative h-full flex flex-col justify-center"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <div className="flex">
                      <FormLabel className="min-w-[120px] flex items-center">IconName</FormLabel>
                      <FormControl>
                        <Input placeholder="iconname" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage className="!mb-2 ms-[120px]" />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <div className="flex">
                    <FormLabel className="min-w-[120px] flex items-center">分类</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      // 不允许修改颜色类型
                      // disabled={!!icon}
                      // 允许修改颜色类型
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Icon type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">标准</SelectItem>
                        <SelectItem value="color">彩色</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage className="!mb-2 ms-[120px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <div className="flex">
                    <FormLabel className="min-w-[120px] flex items-center">Tags</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="工作流">工作流</SelectItem>
                        <SelectItem value="Agent">Agent</SelectItem>
                        <SelectItem value="导航栏">导航栏</SelectItem>
                        <SelectItem value="个人中心">个人中心</SelectItem>
                        <SelectItem value="消息对话">消息对话</SelectItem>
                        <SelectItem value="设计器">设计器</SelectItem>
                        <SelectItem value="通用">通用</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage className="!mb-2 ms-[120px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start">
                    <FormLabel className="min-w-[120px] flex items-center pt-3">描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage className="!mb-2 ms-[120px]" />
                </FormItem>
              )}
            />
            <Button type="submit" className="absolute bottom-0 right-0">
              {icon ? 'Update' : 'Create'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
