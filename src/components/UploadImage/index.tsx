import { deleteFile } from '@/services/ant-design-pro/api';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Modal, Tooltip, Upload } from 'antd';
import update from 'immutability-helper';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const type = 'DraggableUploadList';

const initialState = {
  fileList: [], //文件列表
  previewVisible: false, //图片预览控制
  previewImage: '', //图片预览url
  loading: false,
};

const DraggableUploadListItem = ({ originNode, moveRow, file, fileList }: any) => {
  const ref = useRef(null);
  const index = fileList.indexOf(file);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};

      if (dragIndex === index) {
        return {};
      }

      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item: any) => {
      moveRow(item.index, index);
    },
  });
  const [, drag] = useDrag({
    type,
    item: {
      index,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));
  const errorNode = <Tooltip title="Upload Error">{originNode.props.children}</Tooltip>;
  return (
    <div
      ref={ref}
      className={`ant-upload-draggable-list-item ${isOver ? dropClassName : ''}`}
      style={{
        cursor: 'move',
        width: '100%',
        height: '100%',
      }}
    >
      {file.status === 'error' ? errorNode : originNode}
    </div>
  );
};

function reducer(state: any, { data, type }: any) {
  switch (type) {
    case 'SetState':
      return {
        ...state,
        ...data,
      };
    default:
      return state;
  }
}

export default function Index({
  onChange,
  maxSize,
  value,
  maxLength,
  title,
  disabled,
  showRemoveIcon,
  data,
  api,
}: any) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const uploadButton = (
    <div>
      {state.loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>图片上传</div>
    </div>
  );

  // 设置state
  function setState(data: any) {
    dispatch({ type: 'SetState', data });
  }

  // 取消预览
  function handleCancel() {
    setState({
      previewVisible: false,
      previewImage: '',
    });
  }

  function beforeUpload(file: any) {
    const isJpgOrPng = ['image/jpg', 'image/png', 'image/jpeg'].some((v) => v === file.type);
    const isSize = maxSize === 0 || file.size / 1024 / 1024 < maxSize;
    if (state.fileList?.length > maxLength) {
      Modal.error({
        title: `上传的图片不能超过${maxLength}个，请重新选择`,
      });
    }
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG/JPEG 图片!');
    }
    if (!isSize) {
      message.error(`图片超过${maxSize}MB的不能上传!`);
    }
    return isJpgOrPng && isSize;
  }

  // 添加图片
  function handleChange(info: any) {
    // setState({
    //     fileList: info.fileList.filter(item => ((item['size'] / 1024 / 1024) < maxSize) || (item['status'] && item['status'] == 'done'))
    // })
    setState({ fileList: info.fileList });
    let bol = info.fileList.every((item: { status: string }) => item.status === 'done');
    if (bol) {
      let returnThumbUrl = info.fileList.map(
        (v: { response: { data: { url: any } } }) => v.response.data.url,
      );
      if (returnThumbUrl.length) {
        if (maxLength === 1) {
          onChange(returnThumbUrl[0]);
          return;
        }
        onChange(returnThumbUrl);
      } else {
        onChange(null);
      }
    }
  }

  // 图片预览
  function handlePreview(file: any) {
    setState({
      previewVisible: true,
      previewImage: file.thumbUrl,
    });
  }

  function handleRemove(file: any) {
    let src = file.thumbUrl as string;
    if (src) {
      return new Promise<boolean>((resolve, reject) => {
        Modal.confirm({
          content: '删除后将无法恢复!',
          title: '确认要删除？',
          onOk() {
            deleteFile('PORTAL', src).then((res) => res.ok);
            resolve(true);
          },
          onCancel() {
            reject(false);
          },
        });
      });
    } else {
      return true;
    }
  }

  useEffect(() => {
    if (!value) {
      setState({ fileList: [] });
      return;
    }
    if (maxLength === 1) {
      setState({
        fileList: [
          {
            uid: Math.ceil(Math.random() * 100000),
            thumbUrl: value,
            status: 'done',
            response: {
              data: { url: value },
            },
          },
        ],
      });
      return;
    }
    let fileList: {
      uid: number;
      thumbUrl: any;
      status: string;
      response: { data: { url: any } };
    }[] = [];
    value.map((item: any): number =>
      fileList.push({
        uid: Math.ceil(Math.random() * 100000),
        thumbUrl: item,
        status: 'done',
        response: {
          data: { url: item },
        },
      }),
    );
    setState({ fileList });
  }, [value]);

  const moveRow = useCallback(
    (dragIndex: any, hoverIndex: any) => {
      const dragRow = state.fileList[dragIndex];
      //   setFileList(
      //     update(fileList, {
      //       $splice: [
      //         [dragIndex, 1],
      //         [hoverIndex, 0, dragRow],
      //       ],
      //     }),
      //   );
      setState({
        fileList: update(state.fileList, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        }),
      });
    },
    [state.fileList],
  );

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <Upload
          disabled={disabled}
          action={`/api${api}`}
          headers={{ Authorization: `Bearer ${localStorage.getItem('access_token')}` }}
          data={data}
          listType="picture-card"
          accept={'.jpg, .png, .jpeg'}
          showUploadList={{ showRemoveIcon: showRemoveIcon }}
          fileList={state.fileList}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          onPreview={handlePreview}
          onRemove={handleRemove}
          multiple
          itemRender={(originNode, file, currFileList) => (
            <DraggableUploadListItem
              originNode={originNode}
              file={file}
              fileList={currFileList}
              moveRow={moveRow}
            />
          )}
        >
          {state.fileList?.length >= maxLength || disabled ? null : uploadButton}
        </Upload>
      </DndProvider>
      {title && <span className="tipTxt">*{title}</span>}
      <Modal open={state.previewVisible} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: '100%' }} src={state.previewImage} />
      </Modal>
    </div>
  );
}
Index.defaultProps = {
  maxLength: 1,
  maxSize: 0,
  title: '',
  onChange: () => {},
  data: {
    moduleEnum: 'PORTAL',
    folder: 'portal',
  },
  value: undefined,
  disabled: false,
  showRemoveIcon: true,
  api: '/file/upload/oss/module',
};
