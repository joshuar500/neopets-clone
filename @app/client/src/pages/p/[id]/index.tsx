import { SharedLayout, usePetId, usePetLoading } from "@app/components";
import { PetPage_UsersPetsFragment, usePetPageQuery } from "@app/graphql";
import { Col, Row } from "antd";
import { NextPage } from "next";
import React, { FC } from "react";

const PetPage: NextPage = () => {
  const id = usePetId();
  const query = usePetPageQuery({ variables: { id } });
  const petLoadingElement = usePetLoading(query);
  const pet = query?.data?.usersPet;

  return (
    <SharedLayout
      title={`${pet?.petName ?? id}`}
      titleHref={`/o/[id]`}
      titleHrefAs={`/o/${id}`}
      query={query}
    >
      {petLoadingElement || <PetPageInner pet={pet!} />}
    </SharedLayout>
  );
};

interface PetPageInnerProps {
  pet: PetPage_UsersPetsFragment;
}

const PetPageInner: FC<PetPageInnerProps> = (props) => {
  // const { pet } = props;

  return (
    <Row>
      <Col>
        <img src="/images/kawaii_pixel_pet.png" />
      </Col>
    </Row>
  );
};

export default PetPage;
