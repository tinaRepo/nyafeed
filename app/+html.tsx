export default function Root({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja">
            <head>
                <meta charSet="utf-8" />

                <title>NyaFeed</title>

                <meta
                    name="description"
                    content="かわいい猫だけが流れる匿名掲示板"
                />

                <meta
                    property="og:title"
                    content="NyaFeed｜猫だけ匿名掲示板"
                />

                <meta
                    property="og:description"
                    content="かわいい猫だけが流れる匿名掲示板"
                />

                <meta
                    property="og:image"
                    content="https://nyafeed.app/ogp.png"
                />

                <meta
                    property="og:type"
                    content="website"
                />

                <meta
                    property="og:url"
                    content="https://nyafeed.app"
                />

                <meta
                    name="twitter:card"
                    content="summary_large_image"
                />

                <meta
                    name="twitter:title"
                    content="NyaFeed｜猫だけ匿名掲示板"
                />

                <meta
                    name="twitter:description"
                    content="かわいい猫だけが流れる匿名掲示板"
                />

                <meta
                    name="twitter:image"
                    content="https://nyafeed.app/ogp.png"
                />

                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            </head>

            <body>{children}</body>
        </html>
    );
}