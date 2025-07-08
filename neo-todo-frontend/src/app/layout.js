// app/layout.js
import { Inter, Orbitron } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

export const metadata = {
  title: "NEO-TODO Manager",
  description: "Cyberpunk-inspired TODO App with Next.js and MUI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} ${orbitron.variable}`}>
      <body style={{ 
        margin: 0,
        padding: 0,
        background: 'radial-gradient(ellipse at bottom, #0a0a0a 0%, #000000 100%)',
        minHeight: '100vh',
        color: '#e0e0e0',
        overflowX: 'hidden'
      }}>
        <div className="stars" />
        <div className="stars2" />
        <div className="stars3" />
        {children}
      </body>
    </html>
  );
}