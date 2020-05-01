import React, { useContext, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Typography, Table, Button } from 'antd';
import OperationButtons from '../../components/OperationButtons';
import { I18nContext } from '../../locales';
import { ContentContainer } from '../../components/CommonStyles';
import {
  getOrganizationsAction,
  deleteOrganizationAction,
} from '../../redux/Organization/actions';
import moment from 'moment';

const { Title } = Typography;

export default () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { translate } = useContext(I18nContext);
  const loading = useSelector((store: any) => store.loading.isLoading);
  const { listData } = useSelector((store: any) => store.organization);

  const fetchData = useCallback(() => dispatch(getOrganizationsAction()), [
    dispatch,
  ]);

  const deleteItem = useCallback(() => dispatch(deleteOrganizationAction()), [
    dispatch,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    history.push('/organizations/create');
  };

  const handleEdit = (id: string) => {
    history.push(`/organizations/${id}}`);
  };

  const columns: any = [
    {
      title: 'organizationName',
      dataIndex: 'name',
    },
    {
      title: 'organizationCode',
      dataIndex: 'organizationCode',
    },
    {
      title: 'message',
      dataIndex: 'message',
    },
    {
      title: 'addedByAdminEmail',
      dataIndex: 'addedByAdminEmail',
    },
    {
      title: 'createdDate',
      dataIndex: 'created',
      render: (value: number) => {
        console.log(value);
        console.log(moment(value).format('YYYY-MM-DD HH:MM'));
        return moment(value).format('YYYY-MM-DD HH:MM');
      },
    },
    {
      title: 'operation',
      render: ({ id }: { id: string }) => {
        return (
          <OperationButtons
            handleEdit={() => handleEdit(id)}
            deleteItem={deleteItem}
          />
        );
      },
    },
  ];

  return (
    <ContentContainer>
      <header>
        <Title level={4}>{translate('list')}</Title>
        <Button type="primary" size="large" onClick={handleCreate}>
          {translate('createItem')}
        </Button>
      </header>

      <section>
        <Table
          loading={loading}
          dataSource={listData}
          rowKey={(record: any) => record.id}
          columns={columns.map((item: any) => {
            return {
              ...item,
              title: translate(item.title),
            };
          })}
        />
      </section>
    </ContentContainer>
  );
};
