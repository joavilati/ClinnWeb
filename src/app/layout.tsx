import type { Metadata } from "next";
import "./globals.css";
import "../styles/theme.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SWRProvider } from "@/lib/swrConfig";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ClinNota | Emissor de Notas Fiscais de Serviço",
  description: "ClinNota - Plataforma completa para emissão e gestão de NFS-e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 antialiased">
        <SWRProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
