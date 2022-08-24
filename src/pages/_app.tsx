import { withTRPC } from "@trpc/next"
import type { AppRouter } from "../server/router"
import superjson from "superjson"
import { SessionProvider } from "next-auth/react"
import "../styles/globals.css"
import { NextPage } from "next"
import { ReactElement, ReactNode } from "react"
import { AppProps } from "next/app"
import { AppContextProvider } from "@/components/business/AppContext"

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const App = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <SessionProvider session={session}>
      <AppContextProvider>
        {getLayout(<Component {...pageProps} />)}
      </AppContextProvider>
    </SessionProvider>
  )
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return ""
  }

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

export default withTRPC<AppRouter>({
  config() {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    }
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(App)
