import React, { useState, type ReactNode } from 'react';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';

interface QueryProviderProps {
    children: ReactNode;
}

export default function QueryProvider({
    children,
}: QueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: 1,
                        staleTime: 30_000,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    );

    return React.createElement(QueryClientProvider, { client: queryClient }, children);
}
