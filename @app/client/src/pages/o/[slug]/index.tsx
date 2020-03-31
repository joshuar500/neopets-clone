import {
  ButtonLink,
  SharedLayout,
  useOrganizationLoading,
  useOrganizationSlug,
} from "@app/components";
import {
  OrganizationPage_OrganizationFragment,
  useOrganizationPageQuery,
  // useCreatePetMutation,
} from "@app/graphql";
import { formItemLayout } from "@app/lib";
import { Button, Col, Empty, Form, Input, PageHeader, Row } from "antd";
import { NextPage } from "next";
import { Store } from "rc-field-form/lib/interface";
import React, { FC, useCallback } from "react";

const OrganizationPage: NextPage = () => {
  const slug = useOrganizationSlug();
  const query = useOrganizationPageQuery({ variables: { slug } });
  const organizationLoadingElement = useOrganizationLoading(query);
  const organization = query?.data?.organizationBySlug;

  return (
    <SharedLayout
      title={`${organization?.name ?? slug}`}
      titleHref={`/o/[slug]`}
      titleHrefAs={`/o/${slug}`}
      query={query}
    >
      {organizationLoadingElement || (
        <OrganizationPageInner organization={organization!} />
      )}
    </SharedLayout>
  );
};

interface OrganizationPageInnerProps {
  organization: OrganizationPage_OrganizationFragment;
}

const OrganizationPageInner: FC<OrganizationPageInnerProps> = (props) => {
  const { organization } = props;

  const [form] = Form.useForm();

  // const [createPet] = useCreatePetMutation();

  const handleSubmit = useCallback(async (values: Store) => {
    // try {
    //   const { petName } = values;
    //   const { data } = await createPet({
    //     variables: {
    //       petName,
    //     },
    //   });
    //   console.log("data", data);
    // } catch (e) {
    //   console.log("there was an error", e);
    // }
  }, []);

  return (
    <Row>
      <Col flex={1}>
        <div>
          <PageHeader
            title={"Dashboard"}
            extra={
              organization.currentUserIsBillingContact ||
              organization.currentUserIsOwner
                ? [
                    <ButtonLink
                      key="settings"
                      href={`/o/[slug]/settings`}
                      as={`/o/${organization.slug}/settings`}
                      type="primary"
                      data-cy="organizationpage-button-settings"
                    >
                      Settings
                    </ButtonLink>,
                  ]
                : null
            }
          />
          <Empty
            description={
              <span>
                Customize this page in
                <br />
              </span>
            }
          />
          <Form {...formItemLayout} form={form} onFinish={handleSubmit}>
            <Form.Item label="Pet Name" name="petName">
              <Input placeholder="Bob" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Submit</Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default OrganizationPage;
