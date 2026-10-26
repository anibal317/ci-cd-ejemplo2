import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Demo CI/CD',
  description: 'Ejemplo de pipeline que bloquea merges si los tests fallan',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
