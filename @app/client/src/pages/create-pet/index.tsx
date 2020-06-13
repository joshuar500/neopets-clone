import { AuthRestrict, Redirect, SharedLayout } from "@app/components";
import {
  CreatedUserPetFragment,
  useCreateUserPetMutation,
  useSharedQuery,
  useUserPetBySlugLazyQuery,
} from "@app/graphql";
import {
  extractError,
  formItemLayout,
  getCodeFromError,
  tailFormItemLayout,
} from "@app/lib";
import { Alert, Button, Col, Form, Input, Row, Spin } from "antd";
import { useForm } from "antd/lib/form/util";
import Text from "antd/lib/typography/Text";
import { ApolloError } from "apollo-client";
import { debounce } from "lodash";
import { NextPage } from "next";
import { Store } from "rc-field-form/lib/interface";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import slugify from "slugify";

const CreatePetPage: NextPage = () => {
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const [form] = useForm();
  const query = useSharedQuery();
  const [slug, setSlug] = useState("");
  const [slugCheckIsValid, setSlugCheckIsValid] = useState(false);
  const [
    lookupUserPetBySlug,
    { data: existingUserPetData, loading: slugLoading, error: slugError },
  ] = useUserPetBySlugLazyQuery();

  const checkSlug = useMemo(
    () =>
      debounce(async (slug: string) => {
        try {
          if (slug) {
            await lookupUserPetBySlug({
              variables: {
                slug,
              },
            });
          }
        } catch (e) {
          /* NOOP */
        } finally {
          setSlugCheckIsValid(true);
        }
      }, 500),
    [lookupUserPetBySlug]
  );

  useEffect(() => {
    setSlugCheckIsValid(false);
    checkSlug(slug);
  }, [checkSlug, slug]);

  const code = getCodeFromError(formError);
  const [userPet, setUserPet] = useState<null | CreatedUserPetFragment>(null);
  const [createUserPet] = useCreateUserPetMutation();
  const handleSubmit = useCallback(
    async (values: Store) => {
      setFormError(null);
      try {
        const { name } = values;
        const slug = slugify(name || "", {
          lower: true,
        });
        const { data } = await createUserPet({
          variables: {
            petName: name,
            slug,
          },
        });
        setFormError(null);
        setUserPet(data?.createUserPet?.userPet || null);
      } catch (e) {
        setFormError(e);
      }
    },
    [createUserPet]
  );

  const handleValuesChange = useCallback((values: Store) => {
    if ("name" in values) {
      setSlug(
        slugify(values.name, {
          lower: true,
        })
      );
    }
  }, []);

  if (userPet) {
    return <Redirect layout href={`/o/[slug]`} as={`/o/${userPet.slug}`} />;
  }

  return (
    <SharedLayout title="" query={query} forbidWhen={AuthRestrict.LOGGED_OUT}>
      <Row>
        <Col flex={1}>
          <div>
            <Form
              {...formItemLayout}
              form={form}
              onValuesChange={handleValuesChange}
              onFinish={handleSubmit}
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please choose a name for your pet",
                  },
                ]}
              >
                <div>
                  <Input data-cy="createpet-input-name" />
                  <p>
                    Your pet&apos;s URL will be{" "}
                    <span data-cy="createpet-slug-value">{`${process.env.ROOT_URL}/p/${slug}`}</span>
                  </p>
                  {!slug ? null : !slugCheckIsValid || slugLoading ? (
                    <div>
                      <Spin /> Checking pet name
                    </div>
                  ) : existingUserPetData?.userPetBySlug ? (
                    <Text type="danger" data-cy="createpet-hint-nameinuse">
                      Pet name is already in use
                    </Text>
                  ) : slugError ? (
                    <Text type="warning">
                      Error occurred checking for existing pet with this name
                      (error code: ERR_{getCodeFromError(slugError)})
                    </Text>
                  ) : null}
                </div>
              </Form.Item>
              {formError ? (
                <Form.Item {...tailFormItemLayout}>
                  <Alert
                    type="error"
                    message={`Creating pet failed`}
                    description={
                      <span>
                        {code === "NUNIQ" ? (
                          <span data-cy="createpet-alert-nuniq">
                            That pet name is already in use, please choose a
                            different organization name.
                          </span>
                        ) : (
                          extractError(formError).message
                        )}
                        {code ? (
                          <span>
                            {" "}
                            (Error code: <code>ERR_{code}</code>)
                          </span>
                        ) : null}
                      </span>
                    }
                  />
                </Form.Item>
              ) : null}
              <Form.Item {...tailFormItemLayout}>
                <Button htmlType="submit" data-cy="createpet-button-create">
                  Create
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </SharedLayout>
  );
};

export default CreatePetPage;
