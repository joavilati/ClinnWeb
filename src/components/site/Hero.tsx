"use client";

import Link from "next/link";
import {
  Download,
  Play,
  Sparkles,
  Shield,
  Zap,
  ChevronRight,
  Star,
  FileText,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const handleScrollToFeatures = () => {
    const el = document.getElementById("recursos");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-16">
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/50 to-purple-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.12),transparent_50%)]" />
      </div>

      {/* Floating geometric dots - CSS animated */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
      <div
        className="absolute top-40 right-32 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-32 left-32 w-3 h-3 bg-violet-300 rounded-full animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left side - Content */}
        <div className="space-y-8 animate-[fadeInUp_0.8s_ease-out]">
          {/* Badge */}
          <div>
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm bg-white/80 backdrop-blur-md border border-violet-200/50 shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2 text-violet-600" />
              Integração nacional com a Receita Federal
            </Badge>
          </div>

          {/* Main heading */}
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-tight">
              <span className="block text-gray-900">Emita NFS-e em</span>
              <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-clip-text text-transparent bg-[length:200%_200%] animate-[gradientShift_4s_linear_infinite]">
                segundos
              </span>
              <span className="block text-gray-700">com o ClinNota</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
              A plataforma mais completa para prestadores de serviço que buscam{" "}
              <span className="text-violet-600 font-semibold">agilidade</span>,{" "}
              <span className="text-purple-600 font-semibold">segurança</span> e{" "}
              <span className="text-violet-700 font-semibold">conformidade</span>{" "}
              na emissão de notas fiscais.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-gray-600">4.9 (50+ avaliações)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>200+ empresas ativas</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Começar gratuitamente
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              onClick={handleScrollToFeatures}
              className="group bg-white/70 backdrop-blur-md border-gray-200/50 hover:bg-white/90 px-8 py-6 text-lg shadow-lg"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Ver demonstração
            </Button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 pt-4">
            {[
              {
                icon: Zap,
                text: "Emissão em 10 segundos",
                color: "text-amber-600",
              },
              {
                icon: Shield,
                text: "Certificação ICP-Brasil",
                color: "text-emerald-600",
              },
              {
                icon: CheckCircle,
                text: "Sistema nacional",
                color: "text-blue-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/30 hover:scale-105 transition-transform cursor-default"
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-sm text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Dashboard mockup */}
        <div className="relative flex justify-center lg:justify-end animate-[fadeInRight_0.8s_ease-out_0.4s_both]">
          <div className="relative">
            {/* Main mockup */}
            <div className="relative z-10 max-w-sm w-full hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-white rounded-3xl shadow-2xl p-1 border border-gray-200/50">
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-6">
                  {/* Interface header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          ClinNota
                        </div>
                        <div className="text-xs text-gray-500">Dashboard</div>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>

                  {/* Stats cards */}
                  <div className="space-y-4">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            NFS-e emitidas hoje
                          </div>
                          <div className="text-2xl font-bold text-violet-600">
                            47
                          </div>
                        </div>
                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-violet-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Valor total
                          </div>
                          <div className="text-2xl font-bold text-emerald-600">
                            R$ 12.580
                          </div>
                        </div>
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-900 font-medium">
                            NFS-e #001247
                          </div>
                          <div className="text-xs text-gray-500">
                            Emitida há 2 min
                          </div>
                        </div>
                        <div className="text-xs text-emerald-600 font-medium">
                          R$ 1.250,00
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-violet-500/20 rounded-3xl blur-2xl -z-10" />
            </div>

            {/* Floating info card - top left */}
            <div className="absolute -top-6 -left-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 px-4 py-3 max-w-48 animate-[float_6s_ease-in-out_infinite]">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <div className="text-xs text-gray-500">Tempo médio</div>
              </div>
              <div className="text-lg font-bold text-gray-900">8.5s</div>
              <div className="text-xs text-gray-600">por emissão</div>
            </div>

            {/* Floating info card - bottom right */}
            <div
              className="absolute -bottom-6 -right-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 px-4 py-3 max-w-48 animate-[float_8s_ease-in-out_infinite_1s]"
            >
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-emerald-500" />
                <div className="text-xs text-gray-500">Conformidade</div>
              </div>
              <div className="text-lg font-bold text-emerald-600">100%</div>
              <div className="text-xs text-gray-600">certificada</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border border-gray-300 rounded-full flex justify-center bg-white/50 backdrop-blur-sm">
          <div className="w-1 h-3 bg-violet-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
