import "antd/dist/antd.less";
import "nprogress/nprogress.css";
import "nes.css/css/nes.min.css";
import "../styles.less";

import { ApolloProvider } from "@apollo/react-hooks";
import { withApollo } from "@app/lib";
import { notification } from "antd";
import { ApolloClient } from "apollo-client";
import App from "next/app";
import Router from "next/router";
import NProgress from "nprogress";
import * as React from "react";

NProgress.configure({
  showSpinner: false,
});

if (typeof window !== "undefined") {
  Router.events.on("routeChangeStart", () => {
    NProgress.start();
  });

  Router.events.on("routeChangeComplete", () => {
    NProgress.done();
  });
  Router.events.on("routeChangeError", (err: Error | string) => {
    NProgress.done();
    if (err["cancelled"]) {
      // No worries; you deliberately cancelled it
    } else {
      notification.open({
        message: "Page load failed",
        description: `This is very embarassing! Please reload the page. Further error details: ${
          typeof err === "string" ? err : err.message
        }`,
        duration: 0,
      });
    }
  });
}

class MyApp extends App<{ apollo: ApolloClient<any> }> {
  static async getInitialProps({ Component, ctx }: any) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps, apollo } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <Component {...pageProps} />
      </ApolloProvider>
    );
  }
}

export default withApollo(MyApp);
