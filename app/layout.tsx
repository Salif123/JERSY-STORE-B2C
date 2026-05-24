import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/store/Header';
import { ToastContainer } from '@/components/ui/Toast';
import { ThemeProvider } from '@/components/store/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: {
    default: 'Jersey Store - Premium Sports Apparel',
    template: '%s | Jersey Store',
  },
  description: 'Shop authentic high-quality sports jerseys online. Secure INR checkout via Razorpay.',
  metadataBase: new URL('http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'JERSEY STORE';

  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {/* Navigation Bar */}
          <Header />

          {/* Core Main Area */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Global Footer */}
          <footer className="bg-white dark:bg-navy-950 border-t border-slate-200 dark:border-navy-800 py-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-8">
                <div>
                  <h3 className="font-heading text-3xl tracking-wider text-navy-900 dark:text-white uppercase">{storeName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    Premium jerseys. Delivered to your door. Built for high performance.
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Links</h4>
                  <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                    <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</a></li>
                    <li><a href="/products" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">All Jerseys</a></li>
                    <li><a href="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Admin Dashboard</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Support</h4>
                  <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                    <li><span>Email: support@jerseystore.in</span></li>
                    <li><span>Hours: Mon - Sat (9 AM - 6 PM)</span></li>
                    <li><span>100% Secure Checkout</span></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-navy-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                <p>
                  &copy; {new Date().getFullYear()} {storeName}. Built for champions.
                </p>
                <div className="flex gap-4">
                  <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
                  <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
                </div>
              </div>
            </div>
          </footer>

          {/* Toast Alerts Portal */}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
