import { createMenu, editMenu, queryAllMenus, queryMenuById } from '@/services/swagger/menuManage';
import { ProForm, ProFormText, ProFormTreeSelect } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@umijs/max';
import { Modal, Spin } from 'antd';
import { atom, useAtom } from 'jotai';
import type { FC } from 'react';

/**
 * @description 控制操作的主键ID, 用于新建和编辑
 * @description 用于编辑或查看时，传入主键ID
 * @description 用于新建时，传入主键ID为 0
 */
export const EditMenuModalAtom = atom<string | undefined>(undefined);

type Props = {
  onOk?: () => void;
};

export const EditMenuModal: FC<Props> = ({ onOk }) => {
  const [id, setId] = useAtom(EditMenuModalAtom);
  const [form] = ProForm.useForm();

  const { isFetching, data: initialValues } = useQuery({
    queryKey: [queryMenuById, id],
    queryFn() {
      if (id) {
        return queryMenuById({
          id,
        });
      }
      return {};
    },
    onSettled() {
      setTimeout(() => {
        form.resetFields();
      });
    },
  });

  const mutation = useMutation({
    mutationFn(values: API.Menu) {
      if ('id' in values) {
        return editMenu(values);
      }
      return createMenu(values);
    },
    onSuccess() {
      setId(undefined);
      onOk?.();
    },
  });

  const title = id === '' ? '新建菜单' : '编辑菜单';

  return (
    <Modal
      title={title}
      open={id !== undefined}
      onCancel={() => {
        // 判断 form 是否被修改过, 二次确认是否关闭
        const isTouched = form.isFieldsTouched();
        if (isTouched) {
          Modal.confirm({
            title: '确定要关闭吗?',
            content: '尚未保存，所有修改将丢失',
            onOk() {
              setId(undefined);
            },
          });
          // 一般不需要手动 destroy, 在切换路由的时候执行 Modal.destroyAll();
        } else {
          setId(undefined);
        }
      }}
      onOk={() => {
        form.submit();
      }}
      confirmLoading={mutation.isLoading}
      afterClose={() => {
        form.resetFields();
      }}
    >
      <Spin spinning={isFetching}>
        <ProForm
          onFinish={async (values) => {
            await mutation.mutateAsync(values);
            return true;
          }}
          layout="horizontal"
          submitter={false}
          form={form}
          initialValues={initialValues}
        >
          <ProFormText name="id" hidden />
          <ProFormText
            label="name"
            name="name"
            rules={[
              {
                required: true,
              },
            ]}
          />
          <ProFormText
            label="path"
            name="path"
            rules={[
              {
                required: true,
              },
            ]}
          />
          <ProFormTreeSelect
            label="parent menu"
            name={['parent', 'id']}
            request={queryAllMenus}
            fieldProps={{
              fieldNames: {
                label: 'name',
                value: 'id',
              },
              treeDefaultExpandAll: true,
            }}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};
