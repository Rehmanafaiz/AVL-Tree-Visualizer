
import type {Metadata} from 'next';
import './globals.css';
// Toaster and use-toast are no longer used, so imports are removed.

export const metadata: Metadata = {
  title: 'TreeVisualizerGUI',
  description: 'Visualize and compare BST and AVL Trees',
  icons: {
    icon: '/favicon.ico', // Default path if favicon.ico is in src/app/ or public/
    // You can also specify other icon types:
    // apple: '/apple-icon.png',
    // shortcut: '/shortcut-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased font-sans`}>
        {children}
        {/* Toaster component is removed as toast functionality is no longer used */}
      </body>
    </html>
  );
}
