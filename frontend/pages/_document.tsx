import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#22c55e" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}