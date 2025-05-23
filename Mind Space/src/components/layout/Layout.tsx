import { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import { useSession } from 'next-auth/react';

type LayoutProps = {
  children: ReactNode;
  title?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  fullHeight?: boolean;
};

export default function Layout({ 
  children, 
  title = 'Mind Haven - Mental Health Community', 
  hideHeader = false,
  hideFooter = false,
  fullHeight = false
}: LayoutProps) {
  const { status } = useSession();
  
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="A supportive mental health community platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />
      </Head>
      
      <div className={`d-flex flex-column ${fullHeight ? 'min-vh-100' : ''}`}>
        {!hideHeader && <Header />}
        
        <main className={`flex-grow-1 ${!hideHeader ? 'pt-4' : ''} ${!hideFooter ? 'pb-4' : ''}`}>
          {children}
        </main>
        
        {!hideFooter && <Footer />}
      </div>
    </>
  );
}