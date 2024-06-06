import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import StoreProvider from '@/app/StoreProvider'
 
export default function App({ Component, pageProps }: AppProps) {
  return <ChakraProvider>
        <StoreProvider>
            <Component {...pageProps} />
        </StoreProvider>
    </ChakraProvider>
}
