"use client";

import {
  Download,
  Smartphone,
  Apple,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const platforms = [
  {
    icon: Smartphone,
    title: "Google Play",
    subtitle: "Android 8.0+",
    description: "App nativo com sincronização em tempo real",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
    features: [
      "Segurança criptografada",
      "Push notifications",
      "Sync automática",
    ],
    popular: false,
  },
  {
    icon: Apple,
    title: "App Store",
    subtitle: "iOS 14.0+",
    description: "Interface otimizada para iPhone",
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
    features: [
      "Interface adaptativa",
      "Acessibilidade avançada",
      "Widgets iOS",
    ],
    popular: false,
  },
];

const globalStats = [
  { label: "Avaliação média", value: "4.9" },
  { label: "Empresas ativas", value: "200+" },
];

export function Downloads() {
  return (
    <section
      id="download"
      className="py-20 px-4 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50" />

      {/* Decorative blobs */}
      <div
        className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-violet-200/30 to-purple-300/30 rounded-full blur-3xl animate-pulse"
      />
      <div
        className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "3s" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-2 backdrop-blur-sm bg-white/80 border border-violet-200/50"
          >
            Multiplataforma
          </Badge>
          <h2 className="text-4xl md:text-5xl mb-6 bg-gradient-to-r from-gray-900 via-violet-900 to-indigo-900 bg-clip-text text-transparent font-bold">
            Baixe o ClinNota
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Escolha a plataforma ideal e tenha acesso completo às suas notas
            fiscais em{" "}
            <span className="text-violet-600 font-medium">qualquer lugar</span>
            ,{" "}
            <span className="text-indigo-600 font-medium">
              a qualquer momento
            </span>
            . Dados sempre sincronizados entre todos os dispositivos.
          </p>

          {/* Global stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            {globalStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="text-2xl font-bold text-violet-600">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <div
                key={index}
                className="relative hover:-translate-y-2 transition-transform duration-300"
              >
                {/* Popular badge */}
                {platform.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 px-3 py-1 shadow-lg">
                      Mais popular
                    </Badge>
                  </div>
                )}

                <div
                  className={`relative text-center transition-all duration-500 ${platform.bgColor} border-0 overflow-hidden group rounded-xl ${
                    platform.popular
                      ? "ring-2 ring-yellow-400/50 shadow-xl"
                      : "shadow-lg hover:shadow-2xl"
                  }`}
                >
                  {/* Hover overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  <div className="pt-10 pb-8 px-6 relative z-10">
                    {/* Platform icon */}
                    <div className="flex justify-center mb-6">
                      <div
                        className={`p-5 bg-gradient-to-br ${platform.color} rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    {/* Platform info */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-semibold mb-2 group-hover:text-gray-900 transition-colors">
                        {platform.title}
                      </h3>
                      <div className="text-gray-500 mb-2">
                        {platform.subtitle}
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {platform.description}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="mb-6 space-y-2">
                      {platform.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Download button */}
                    <Button
                      className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${platform.color} hover:opacity-90 text-white border-0 py-6 text-lg group/btn transition-all duration-300`}
                    >
                      <Download className="w-5 h-5" />
                      Baixar agora
                      <ExternalLink className="w-4 h-4 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                    </Button>
                  </div>

                  {/* Decorative circle */}
                  <div
                    className={`absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br ${platform.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
