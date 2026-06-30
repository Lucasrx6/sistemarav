import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sistema RAv — SEEDF',
  description: 'Sistema de Registro de Avaliação das escolas públicas do Distrito Federal.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={cn("h-full", inter.className, "font-sans", geist.variable)}>
      <body className="min-h-full bg-gray-50 antialiased">{children}</body>
    </html>
  )
}
