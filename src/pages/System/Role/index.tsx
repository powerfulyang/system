import { EditRoleModal, EditRoleModalAtom } from '@/pages/System/Role/EditRoleModal';
import { deleteRoleById, queryRoles } from '@/services/swagger/roleManage';
import type { ProStrictColumns } from '@/types/ProStrictColumns';
import { paginateTableRequest } from '@/utils/tableRequest';
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Divider, Modal, Space, Typography } from 'antd';
import { useAtom } from 'jotai';
import dayjs from 'dayjs';
import { useRef } from 'react';

const Index = () => {
  const actionRef = useRef<ActionType>();
  const [, setId] = useAtom(EditRoleModalAtom);
  const columns: ProStrictColumns<API.Role>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'name',
      dataIndex: 'name',
    },
    {
      title: 'createdAt',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      render(_, __) {
        return dayjs(__.createdAt).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: 'updatedAt',
      dataIndex: 'updatedAt',
      valueType: 'dateRange',
      render(_, __) {
        return dayjs(__.updatedAt).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: 'Action',
      valueType: 'option',
      width: 'auto',
      render(_, __) {
        return (
          <Space>
            <Typography.Link
              onClick={() => {
                setId(__.id);
              }}
            >
              Edit
            </Typography.Link>
            <Divider type="vertical" />
            <Typography.Link
              type="danger"
              onClick={() => {
                Modal.confirm({
                  title: 'Delete Role',
                  content: 'Are you sure to delete this role?',
                  onOk: async () => {
                    await deleteRoleById({
                      id: __.id,
                    });
                    actionRef.current?.reload();
                  },
                });
              }}
            >
              Delete
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable
        rowKey="id"
        headerTitle="Role List"
        columns={columns}
        scroll={{ x: 'max-content' }}
        request={paginateTableRequest(queryRoles)}
        actionRef={actionRef}
        toolBarRender={() => [
          <Button
            type="primary"
            key="create"
            onClick={() => {
              setId(0);
            }}
          >
            Create Role
          </Button>,
        ]}
      />
      <EditRoleModal
        onOk={() => {
          actionRef.current?.reload();
        }}
      />
    </PageContainer>
  );
};

export default Index;
