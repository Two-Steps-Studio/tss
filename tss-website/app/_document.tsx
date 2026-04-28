import { DocumentProps, Head, Html, Main, NextScript } from "next/document";

export const documentProps = {};

export default function Document(props: DocumentProps) {
  return (
    <Html lang="pl">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
