import { NextPage } from "next";
import Router from "next/router";
import React, { useEffect } from "react";

const P: NextPage = () => {
  useEffect(() => {
    Router.replace("/");
  }, []);
  return <div>Redirecting...</div>;
};

export default P;
