import React, { useContext, useCallback, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { find } from 'lodash';
import { I18nContext } from '../../locales';
import { ContentContainer, DetailForm } from '../../components/CommonStyles';
import FormField from '../../components/FormField';
import dataMap, {
  prefectureForm,
  roleOptions,
  RoleOption, FormItem
} from './dataMap';
import { createAdminUserAction, getOrganizationOptionsAction } from '../../redux/AdminUser/actions';
import { Store } from '../../redux/types';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();
  const { translate } = useContext(I18nContext);
  const [form] = Form.useForm();
  const [formatOfForm, updateFormatOfForm] = useState(dataMap);

  const loading = useSelector((store: Store) => store.loading.isLoading);

  const createItem = useCallback((params) => dispatch(createAdminUserAction(params)), [
    dispatch,
  ]);

  const getOrganizationOptions = useCallback(() => dispatch(getOrganizationOptionsAction()), [
    dispatch,
  ]);

  const handleBack = () => {
    history.goBack();
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        if (id === 'create') {
          createItem({
            data: {
              ...values,
            },
            callback: () => {
              form.resetFields();
              updateFormatOfForm(dataMap);
            }
          });
        } else {
          values.id = id;
        }
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCreate = () => {
    history.push('/organizations/create');
  };

  const onRoleChange = (roleNumber: number) => {
    form.setFieldsValue({ role: roleNumber });

    const foundItem: any = find(roleOptions, { id: roleNumber });

    if (foundItem.id === '2') {
      // case of prefecture admin
      const formattedForm = formatOfForm.concat([prefectureForm]);
      updateFormatOfForm(formattedForm);
    } else if (foundItem.id === '3') {
      // case of organization admin
      getOrganizationOptions();
      updateFormatOfForm(dataMap);
    } else {
      updateFormatOfForm(dataMap);
    };
  };

  const onPrefectureChange = (index: number) => {
    form.setFieldsValue({ prefecture: index });
  }

  const translateOptions = (item: FormItem) =>
    item.selectOptions === undefined
      ? item
      : ({
        ...item,
        selectOptions: item.selectOptions.map((option: RoleOption) => ({
          ...option,
          name: translate(option.name),
        })),
      })

  return (
    <ContentContainer>
      <header>
        <Button
          type="link"
          size="large"
          onClick={handleBack}
          icon={<ArrowLeftOutlined />}
        >
          {translate('back')}
        </Button>
        <Button type="primary" size="large" loading={loading} onClick={handleSubmit}>
          {translate('submit')}
        </Button>
      </header>

      <section>
        <DetailForm
          {...layout}
          form={form}
          name="createUser"
          size="large"
        >
          {formatOfForm &&
            formatOfForm
              .map((item: FormItem) => (
                <FormField
                  key={item.name}
                  label={translate(item.label)}
                  field={translateOptions(item)}
                  onChange={item.name === 'role'
                    ? onRoleChange
                    : item.name === 'prefecture'
                      ? onPrefectureChange
                      : undefined
                  }
                  createButton={
                    item.withCreateItem
                      ? <Button size={'small'} type="link" onClick={handleCreate} style={{ marginTop: 8 }}>
                        {translate('createNewOrganization')}
                      </Button>
                      : <div />
                  }
                />
              ))
          }
        </DetailForm>
      </section>
    </ContentContainer>
  );
};
