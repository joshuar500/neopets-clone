import { QueryResult } from "@apollo/react-common";
import { PetPage_QueryFragment } from "@app/graphql";
import { Col, Row, Spin } from "antd";
import { useRouter } from "next/router";
import React from "react";

import { ErrorAlert, FourOhFour } from "./";

export function usePetId() {
  const router = useRouter();
  const { id: rawId } = router.query;
  return Number(rawId);
}

export function usePetLoading(
  query: Pick<
    QueryResult<PetPage_QueryFragment>,
    "data" | "loading" | "error" | "networkStatus" | "client" | "refetch"
  >
) {
  const { data, loading, error } = query;

  let child: JSX.Element | null = null;
  const pet = data?.usersPet;
  if (pet) {
    //child = <OrganizationPageInner organization={organization} />;
  } else if (loading) {
    child = <Spin />;
  } else if (error) {
    child = <ErrorAlert error={error} />;
  } else {
    // TODO: 404
    child = <FourOhFour currentUser={data?.currentUser} />;
  }

  return child ? (
    <Row>
      <Col flex={1}>{child}</Col>
    </Row>
  ) : null;
}
