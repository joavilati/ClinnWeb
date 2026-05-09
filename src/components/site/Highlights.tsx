"use client";

import {
  Zap,
  Shield,
  Smartphone,
  TrendingUp,
  Award,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const highlights = [
  {
    icon: Zap,
    title: "Velocidade extraordinária",
    description:
      "Emita suas NFS-e em menos de 10 segundos com validação automática",
    metric: "10s",
    metricLabel: "tempo médio",
    color: "from-yellow-400 to-orange-500",
    bgColor:
      "bg-gradient-to-br from-yellow-50 to-orange-50",
  },
  {
    icon: Shield,
    title: "Segurança empresarial",
    description:
      "Certificação ICP-Brasil, criptografia avançada e conformidade total",
    metric: "100%",
    metricLabel: "seguro",
    color: "from-emerald-400 to-green-500",
    bgColor:
      "bg-gradient-to-br from-emerald-50 to-green-50",
  },
  {
    icon: Smartphone,
    title: "Experiência unificada",
    description:
      "Sincronização perfeita entre Android e iOS com dados na nuvem",
    metric: "2",
    metricLabel: "plataformas",
    color: "from-blue-400 to-indigo-500",
    bgColor:
      "bg-gradient-to-br from-blue-50 to-indigo-50",
  },
];

const stats = [
  {
    icon: Users,
    value: "200+",
    label: "empresas ativas",
    color: "text-violet-600",
  },
  {
    icon: TrendingUp,
    value: "30k+",
    label: "NFS-e emitidas",
    color: "text-emerald-600",
  },
  {
    icon: Award,
    value: "99.9%",
    label: "uptime garantido",
    color: "text-blue-600",
  },
];

export function Highlights() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white" />

      {/* Decorative blurred blobs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-violet-200/30 to-purple-300/30 rounded-full blur-2xl animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-2 backdrop-blur-sm bg-white/80 border border-violet-200/50"
          >
            Por que escolher o ClinNota
          </Badge>
          <h2 className="text-4xl md:text-5xl mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-bold">
            A plataforma mais completa para NFS-e
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Desenvolvida especialmente para prestadores de serviço que buscam{" "}
            <span className="text-violet-600 font-medium">eficiência</span>,{" "}
            <span className="text-emerald-600 font-medium">segurança</span> e{" "}
            <span className="text-blue-600 font-medium">praticidade</span> na
            emissão de notas fiscais.
          </p>
        </div>

        {/* Highlight cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <div
                key={index}
                className={`relative text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group rounded-xl ${highlight.bgColor} hover:-translate-y-2 p-1`}
              >
                {/* Hover gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${highlight.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                <div className="pt-10 pb-8 px-6 relative">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div
                      className={`p-4 bg-gradient-to-br ${highlight.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Metric */}
                  <div className="mb-4">
                    <div
                      className={`text-3xl font-bold bg-gradient-to-r ${highlight.color} bg-clip-text text-transparent`}
                    >
                      {highlight.metric}
                    </div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide">
                      {highlight.metricLabel}
                    </div>
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    {highlight.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {highlight.description}
                  </p>

                  {/* Decorative circle */}
                  <div
                    className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${highlight.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Global stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 hover:scale-105 transition-transform duration-300"
              >
                <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl font-bold mb-1 text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
