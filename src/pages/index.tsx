import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function Home() {
    return (
        <>
            <Head>
                <title>AWS Tetris Game - Learn AWS While Playing</title>
                <meta name="description" content="A modern Tetris-inspired game built with AWS services. Features real-time leaderboards, user authentication, and educational AWS service facts. Play and learn about Lambda, S3, DynamoDB, and more!" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta property="og:title" content="AWS Tetris Game - Learn AWS While Playing" />
                <meta property="og:description" content="A modern Tetris-inspired game built with AWS services. Features real-time leaderboards, user authentication, and educational AWS service facts." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://tetrics.sjramblings.io" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="AWS Tetris Game - Learn AWS While Playing" />
                <meta name="twitter:description" content="A modern Tetris-inspired game built with AWS services. Features real-time leaderboards, user authentication, and educational AWS service facts." />
                <meta name="keywords" content="AWS, Tetris, Game, Lambda, S3, DynamoDB, Amplify, Learning, Education, Cloud Computing" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>
                <AppWithoutSSR />
            </main>
        </>
    );
}
