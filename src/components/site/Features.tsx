"use client";

import { useState } from "react";
import {
  User,
  MapPin,
  Package,
  FileText,
  History,
  Headphones,
  CheckCircle,
  Settings,
  Zap,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const featureCategories = [
  {
    id: "setup",
    label: "Configuração",
    icon: Settings,
    features: [
      {
        icon: User,
        title: "Cadastro Inteligente do Prestador",
        description:
          "Configure seus dados fiscais uma única vez com validação automática de CNPJ, inscrição municipal e certificado digital",
        highlights: [
          "Validação automática",
          "Backup na nuvem",
          "Assinatura digital integrada",
        ],
      },
      {
        icon: MapPin,
        title: "Integração Nacional Avançada",
        description:
          "Conexão direta com a Receita Federal para emissão de NFS-e nacional com validação automática",
        highlights: [
          "Sistema nacional",
          "Receita Federal",
          "Validação automática",
        ],
      },
    ],
  },
  {
    id: "emission",
    label: "Emissão",
    icon: Zap,
    features: [
      {
        icon: Package,
        title: "Catálogo de Serviços Inteligente",
        description:
          "Gerencie serviços com códigos CNAE, tributação automática e sugestões baseadas em IA",
        highlights: [
          "IA para tributação",
          "Códigos CNAE",
          "Templates personalizados",
        ],
      },
      {
        icon: FileText,
        title: "Assinatura e Transmissão Segura",
        description:
          "Assinatura digital ICP-Brasil automática e transmissão criptografada para a Receita Federal",
        highlights: [
          "ICP-Brasil",
          "Transmissão segura",
          "Conformidade nacional",
        ],
      },
    ],
  },
  {
    id: "management",
    label: "Gestão",
    icon: Globe,
    features: [
      {
        icon: History,
        title: "Histórico e Relatórios Avançados",
        description:
          "Dashboard completo com analytics, exportação em múltiplos formatos e sincronização contábil",
        highlights: [
          "Dashboard analytics",
          "Múltiplos formatos",
          "Sync contábil",
        ],
      },
      {
        icon: Headphones,
        title: "Suporte Premium e Atualizações",
        description:
          "Suporte técnico especializado 24/7, atualizações automáticas e treinamento incluído",
        highlights: [
          "Suporte 24/7",
          "Treinamento incluído",
          "Updates automáticos",
        ],
      },
    ],
  },
];

const benefits = [
  "Redução de 90% no tempo de emissão",
  "100% de conformidade fiscal garantida",
  "Integração com sistemas contábeis",
  "Backup automático na nuvem",
  "Interface responsiva e intuitiva",
  "Relatórios gerenciais avançados",
];

export function Features() {
  const [activeTab, setActiveTab] = useState("setup");
  const activeCategory = featureCategories.find((c) => c.id === activeTab)!;

  return (
    <section
      id="recursos"
      className="py-20 px-4 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50/50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.06),transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-2 backdrop-blur-sm bg-white/80 border border-violet-200/50"
          >
            Recursos que fazem a diferença
          </Badge>
          <h2 className="text-4xl md:text-5xl mb-6 bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent font-bold">
            Plataforma completa para NFS-e
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Do cadastro inicial até relatórios avançados, temos tudo que sua
            empresa precisa para uma gestão fiscal{" "}
            <span className="text-violet-600 font-medium">moderna</span>,{" "}
            <span className="text-purple-600 font-medium">eficiente</span> e{" "}
            <span className="text-violet-700 font-medium">100% conforme</span>.
          </p>
        </div>

        {/* Tab selector */}
        <div className="mb-12">
          <div className="flex justify-center">
            <div className="inline-flex bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg p-1 gap-1">
              {featureCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === category.id
                        ? "bg-violet-100 text-violet-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feature cards for active tab */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {activeCategory.features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={`${activeTab}-${index}`}
                className="h-full bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 group hover:-translate-y-1"
              >
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-violet-200 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold mb-2 group-hover:text-violet-700 transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    {feature.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Benefits list */}
          <div>
            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Benefícios comprovados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30 hover:scale-[1.02] transition-transform"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-violet-100 to-purple-100 p-8 rounded-3xl">
              <div className="aspect-video bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-lg font-medium text-gray-800">
                    Interface do ClinNota
                  </div>
                  <div className="text-sm text-gray-500">
                    Dashboard principal
                  </div>
                </div>
              </div>

              {/* Decorative dots */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse" />
              <div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>

            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-3xl blur-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
