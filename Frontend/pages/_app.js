import "@/styles/globals.css";
import "@/styles/common.scss";
import Layout from "@/components/Layout";
export default function App({ Component, pageProps, props }) {
  return (
    <Layout props={props}>
      <Component {...pageProps} />
    </Layout>
  );
}