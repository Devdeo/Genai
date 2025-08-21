
import type { NextPage } from "next";
import Head from "next/head";
import MarketData from "../components/MarketData";
import styles from "../styles/Home.module.css";

const Market: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Market Data</title>
        <meta name="description" content="Upstox Market Data" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>Market Data Dashboard</h1>
        <MarketData />
      </main>
    </div>
  );
};

export default Market;
