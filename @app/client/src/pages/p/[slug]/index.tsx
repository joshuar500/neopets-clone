import { SharedLayout, usePetLoading, usePetSlug } from "@app/components";
import { PetPage_UserPetsFragment, usePetPageQuery } from "@app/graphql";
import { Col, Row } from "antd";
import { NextPage } from "next";
import React, { FC } from "react";

const PetPage: NextPage = () => {
  const slug = usePetSlug();
  const query = usePetPageQuery({ variables: { slug } });
  const petLoadingElement = usePetLoading(query);
  const pet = query?.data?.userPet;

  return (
    <SharedLayout
      title={`${pet?.petName ?? slug}`}
      titleHref={`/o/[slug]`}
      titleHrefAs={`/o/${slug}`}
      query={query}
    >
      {petLoadingElement || <PetPageInner pet={pet!} />}
    </SharedLayout>
  );
};

interface PetPageInnerProps {
  pet: PetPage_UserPetsFragment;
}

const PetPageInner: FC<PetPageInnerProps> = () => {
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
