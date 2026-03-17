import { FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 px-4 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">ClinNota</span>
          </div>

          {/* Links and copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
            <span>&copy; 2025 ClinNota. Todos os direitos reservados.</span>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="hover:text-violet-600 transition-colors"
              >
                Politica de Privacidade
              </a>
              <span className="text-gray-300">|</span>
              <a
                href="#"
                className="hover:text-violet-600 transition-colors"
              >
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
