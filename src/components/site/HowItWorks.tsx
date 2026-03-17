"use client";

import Link from "next/link";
import {
  User,
  MapPin,
  Package,
  Send,
  ArrowRight,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    icon: User,
    title: "Cadastre seu emissor",
    subtitle: "Configuração inicial",
    description:
      "Configure seus dados fiscais, certificado digital e informações do prestador em minutos",
    details: [
      "CNPJ e dados fiscais",
      "Certificado ICP-Brasil",
      "Informações tributárias",
    ],
    time: "5 min",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
  },
  {
    number: "02",
    icon: MapPin,
    title: "Configure a integração",
    subtitle: "Sistema nacional",
    description:
      "Ative a integração com a Receita Federal para emissão nacional de NFS-e",
    details: [
      "Sistema nacional",
      "Receita Federal",
      "Configuração automática",
    ],
    time: "2 min",
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
  },
  {
    number: "03",
    icon: Package,
    title: "Adicione serviços",
    subtitle: "Catálogo inteligente",
    description:
      "Cadastre seus serviços com códigos CNAE e tributação",
    details: [
      "Códigos CNAE automáticos",
      "Tributação inteligente",
      "Templates personalizados",
    ],
    time: "3 min",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-gradient-to-br from-violet-50 to-purple-50",
  },
  {
    number: "04",
    icon: Send,
    title: "Assine e envie",
    subtitle: "Processo automatizado",
    description:
      "Gere, assine digitalmente e transmita suas notas fiscais com um clique",
    details: [
      "Assinatura automática",
      "Transmissão segura",
      "Confirmação instantânea",
    ],
    time: "10 seg",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="py-20 px-4 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />

      {/* Decorative blobs */}
      <div className="absolute top-40 left-20 w-20 h-20 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-xl animate-pulse" />
      <div
        className="absolute bottom-40 right-20 w-32 h-32 bg-gradient-to-br from-purple-200/40 to-violet-200/40 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-2 backdrop-blur-sm bg-white/80 border border-blue-200/50"
          >
            Simples e rápido
          </Badge>
          <h2 className="text-4xl md:text-5xl mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-violet-900 bg-clip-text text-transparent font-bold">
            Como funciona o ClinNota
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Do cadastro à emissão, tudo foi pensado para ser{" "}
            <span className="text-blue-600 font-medium">intuitivo</span>,{" "}
            <span className="text-emerald-600 font-medium">rápido</span> e{" "}
            <span className="text-violet-600 font-medium">automatizado</span>.
            Comece a emitir suas notas em menos de 10 minutos.
          </p>

          {/* Total time badge */}
          <div className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-full shadow-lg">
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              Configuração completa em menos de 10 minutos
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative mb-16">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 via-violet-200 to-orange-200 transform -translate-y-1/2 hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative hover:-translate-y-2 transition-transform duration-300"
                >
                  {/* Step card */}
                  <div
                    className={`relative overflow-hidden group hover:shadow-2xl transition-all duration-500 ${step.bgColor} border-0 rounded-xl`}
                  >
                    {/* Background number */}
                    <div className="absolute -top-8 -right-8 text-8xl font-bold opacity-10 select-none pointer-events-none text-gray-900">
                      {step.number}
                    </div>

                    {/* Hover overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    />

                    <div className="pt-8 pb-6 px-6 relative z-10">
                      {/* Card header */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge
                          className={`px-3 py-1 bg-gradient-to-r ${step.color} text-white border-0`}
                        >
                          {step.time}
                        </Badge>
                        <div
                          className={`p-3 bg-gradient-to-br ${step.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                          {step.subtitle}
                        </div>
                        <h3 className="text-xl font-semibold mb-3 group-hover:text-gray-900 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {step.description}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              {detail}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Arrow connector */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                      <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">
              Pronto para começar?
            </h3>
            <p className="text-gray-600">
              Configure tudo em minutos e comece a emitir suas notas hoje mesmo
            </p>
          </div>

          <Link href="/register">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:from-blue-700 hover:via-violet-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Zap className="w-5 h-5 mr-2" />
              Começar configuração
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
