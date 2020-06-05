import { AuthRestrict, SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { Col, Row } from "antd";
import { NextPage } from "next";
import React from "react";

const CreatePetPage: NextPage = () => {
  const query = useSharedQuery();

  return (
    <SharedLayout title="" query={query} forbidWhen={AuthRestrict.LOGGED_OUT}>
      <Row>
        <Col flex={1}>create pet page</Col>
      </Row>
    </SharedLayout>
  );
};

export default CreatePetPage;
