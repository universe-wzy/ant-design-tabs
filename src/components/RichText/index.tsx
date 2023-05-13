import '@wangeditor/editor/dist/css/style.css'; // 引入 css

import { moduleUpload } from '@/services/ant-design-pro/api';
import {
  IDomEditor,
  IEditorConfig,
  IToolbarConfig,
  SlateDescendant,
  SlateElement,
  SlateTransforms,
} from '@wangeditor/editor';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import React, { useEffect, useState } from 'react';

type InsertFnType = (url: string, alt: string, href: string) => void;
type VideoElement = SlateElement & {
  src: string;
  poster?: string;
};
const newNode: { type: string; children: SlateDescendant[] } = {
  // 生成新节点
  type: 'paragraph',
  children: [],
};
const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    'undo', // 取消
    'redo', // 重做
    'headerSelect', // 标题类型
    'fontFamily', // 字体类型
    'fontSize', // 字体大小
    'lineHeight', // 行高
    '|', // 分割线
    'bold', // 字体加粗
    'italic', // 字体倾斜
    'underline', // 下划线
    'through', // 删除线
    // 'sub',  // 上标
    // 'sup',  // 下标
    'clearStyle', // 清除样式
    'color', // 文字颜色
    'bgColor', // 背景色
    '|', // 分割线
    'indent', // 增加缩进
    'delIndent', // 减少缩进
    'bulletedList', // 无序列表
    'numberedList', // 有序列表
    'justifyLeft', // 左对齐
    'justifyRight', // 右对齐
    'justifyCenter', // 居中
    'justifyJustify', // 两端对齐
    '|', // 分割线
    'divider', // 插入分割线
    // 'todo',  // 待办
    'insertTable', // 插入表格
    // "deleteTable",  // 删除表格
    // "insertTableRow",  // 插入表格行
    // "deleteTableRow",  // 删除表格行
    // "insertTableCol",  // 插入表格列
    // "deleteTableCol",  // 删除表格列
    // "emotion",  // 插入表情符号
    'blockquote', // 引用
    // 'codeBlock',  // 代码块
    'uploadImage', // 上传图片
    // "uploadVideo",  // 上传视频
    'insertImage', // 插入网络图片
    'insertVideo', // 插入网络视频
    // "deleteImage",  // 删除图片
    // "editImage",  // 编辑图片
    // "viewImageLink",  // 查看图片链接
    // "imageWidth30",  // 图片宽度设置为30%
    // "imageWidth50",  // 图片宽度设置为50%
    // "imageWidth100",  // 图片宽度设置为100%
    'insertLink', // 插入链接
    // "editLink",  // 修改链接
    // "unLink",  // 删除链接
    // "viewLink",  // 查看链接
    'fullScreen', // 全屏
  ],
};
const RichText: React.FC<{
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
  noMenus?: string[];
}> = (props) => {
  const { onChange, value, placeholder, readOnly, noMenus } = props;
  // editor 实例
  const [editor, setEditor] = useState<IDomEditor | null>(null); // TS 语法

  // 工具栏配置
  toolbarConfig.excludeKeys = noMenus;

  // 自定义校验视频
  function customCheckVideoFn(src: string): boolean | string | undefined {
    // TS 语法
    if (!src) {
      return;
    }
    if (src.indexOf('http') !== 0) {
      return '视频地址必须以 http/https 开头';
    }
    return true;

    // 返回值有三种选择：
    // 1. 返回 true ，说明检查通过，编辑器将正常插入视频
    // 2. 返回一个字符串，说明检查未通过，编辑器会阻止插入。会 alert 出错误信息（即返回的字符串）
    // 3. 返回 undefined（即没有任何返回），说明检查未通过，编辑器会阻止插入。但不会提示任何信息
  }

  // 自定义转换视频
  function customParseVideoSrc(src: string): string {
    // TS 语法
    if (src.includes('.bilibili.com')) {
      // 转换 bilibili url 为 iframe （仅作为示例，不保证代码正确和完整）
      const arr = location.pathname.split('/');
      const vid = arr[arr.length - 1];
      return `<iframe src="//player.bilibili.com/player.html?bvid=${vid}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`;
    }
    return `<video contenteditable=false src=${src} autoplay="autoplay" width="50%" style="max-width:100%"></video>`;
  }

  const editorConfig: Partial<IEditorConfig> = {
    placeholder: placeholder,
    onCreated(editorCase: IDomEditor) {
      setEditor(editorCase);
    }, // 记录下 editor 实例，重要！
    MENU_CONF: {
      fontFamily: {
        // 配置可选字体
        fontFamilyList: [
          '黑体',
          '仿宋',
          '楷体',
          '宋体',
          '微软雅黑',
          'Arial',
          'Tahoma',
          'Courier New',
        ],
      },
      uploadImage: {
        // 配置图片上传服务器
        // 自定义插入图片
        // 自定义上传
        async customUpload(file: File, insertFn: InsertFnType) {
          // TS 语法
          // file 即选中的文件
          // 自己实现上传，并得到图片 url alt href
          moduleUpload('POATAL', 'richtext', file).then(
            (res) =>
              res.code === '00000' && insertFn(res.data.url, res.data.fileName, res.data.url),
          );
        },
      },
      insertVideo: {
        onInsertedVideo(videoNode: VideoElement | null) {
          // TS 语法
          if (videoNode === null) return;
        },
        checkVideo: customCheckVideoFn, // 也支持 async 函数
        parseVideoSrc: customParseVideoSrc, // 也支持 async 函数
      },
    },
  };
  editorConfig.readOnly = readOnly;
  editorConfig.onChange = (editor) => {
    onChange?.(editor.getHtml());
  };
  useEffect(() => {
    if (editor) {
      editor.select([]); // 全选编辑器中的内容
      editor.deleteFragment(); // 删除编辑器中被选中内容
      SlateTransforms.setNodes(editor, newNode, { mode: 'highest' }); // 配置编辑器使用新节点，节点模式设为最高级
      editor.dangerouslyInsertHtml(value || ''); // 插入html内容
    }
  }, [value]);
  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor === null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="simple"
        style={{ borderBottom: '1px solid #ccc' }}
      />
      <Editor
        defaultConfig={editorConfig}
        onCreated={setEditor}
        mode="simple"
        style={{ height: '420px', overflowY: 'hidden' }}
      />
    </div>
  );
};
RichText.defaultProps = {
  placeholder: '请输入',
  onChange: () => {},
  value: '',
  readOnly: false,
  noMenus: [],
};
export default RichText;
