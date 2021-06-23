import React from "react";
import Layout from "../client/components/layouts";

const Index = ({ fetch }) => {
  console.log(fetch);
  React.useEffect(() => {
    fetch("/test").then((res) => console.log(res));
  }, []);
  return <Layout>aadadana🎉</Layout>;
};

export default Index;
