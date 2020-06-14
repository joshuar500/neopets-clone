import { SharedLayout, usePetLoading, usePetSlug } from "@app/components";
import { PetPage_UserPetsFragment, usePetPageQuery } from "@app/graphql";
import { Col, Row } from "antd";
import { DateTime } from "luxon";
import { NextPage } from "next";
import React, { FC } from "react";

const PetPage: NextPage = () => {
  const slug = usePetSlug();
  const query = usePetPageQuery({ variables: { slug } });
  const petLoadingElement = usePetLoading(query);
  const pet = query?.data?.userPetBySlug;

  return (
    <SharedLayout
      title={`${pet?.petName ?? slug}`}
      titleHref={`/p/[slug]`}
      titleHrefAs={`/p/${slug}`}
      query={query}
    >
      {petLoadingElement || <PetPageInner pet={pet!} />}
    </SharedLayout>
  );
};

interface PetPageInnerProps {
  pet: PetPage_UserPetsFragment;
}

const PetPageInner: FC<PetPageInnerProps> = (props) => {
  const { pet } = props;

  return (
    <>
      <Row>
        <Col span={4}>
          <div>Level: {pet.level}</div>
          <div>Experience: {pet.experience}</div>
          <div>
            Last Fed:{" "}
            {DateTime.fromISO(pet.lastFed).toLocaleString(
              DateTime.DATETIME_SHORT
            )}
          </div>
        </Col>
        <Col span={20}>
          <progress className="nes-progress" value="90" max="100"></progress>
        </Col>
      </Row>
      <Row>
        <img src="/images/kawaii_pixel_pet.png" />
      </Row>
    </>
  );
};

export default PetPage;
