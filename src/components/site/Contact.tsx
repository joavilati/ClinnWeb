"use client";

import { useState } from "react";
import {
  Send,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const faqs = [
  {
    question: "Preciso de conta para usar o ClinNota?",
    answer:
      "Sim, é necessário criar uma conta gratuita para sincronizar seus dados entre dispositivos e manter seu histórico de notas fiscais seguro na nuvem. O cadastro é simples e leva menos de 2 minutos.",
    category: "Conta",
  },
  {
    question: "Como funciona a emissão nacional de NFS-e?",
    answer:
      "O ClinNota utiliza o sistema nacional de NFS-e da Receita Federal, permitindo emissão válida em todo território brasileiro. Não há limitações por município ou estado - sua nota fiscal é aceita nacionalmente com total conformidade fiscal.",
    category: "Sistema",
  },
  {
    question: "Tem plano grátis ou período de teste?",
    answer:
      "Oferecemos um período de teste gratuito de 7 dias com acesso completo a todos os recursos. Após este período, temos planos flexíveis a partir de R$ 29,90/mês para pequenos prestadores de serviço, com descontos para pagamento anual.",
    category: "Planos",
  },
  {
    question: "Os dados ficam seguros na nuvem?",
    answer:
      "Sim, utilizamos criptografia de ponta a ponta e servidores certificados no Brasil. Seus dados são protegidos por certificação ICP-Brasil e fazemos backups automáticos diários. Garantimos 99.9% de uptime e conformidade total com a LGPD.",
    category: "Segurança",
  },
  {
    question: "Qual o suporte oferecido?",
    answer:
      "Oferecemos suporte técnico especializado via email e telefone durante horário comercial. Clientes dos planos premium têm acesso a suporte prioritário 24/7 e treinamento personalizado.",
    category: "Suporte",
  },
];

const contactMethods = [
  {
    icon: Mail,
    title: "E-mail",
    description: "contato@clinnota.com.br",
    subtitle: "",
  },
  {
    icon: Phone,
    title: "Telefone",
    description: "(11) 3000-0000",
    subtitle: "Seg a Sex, 9h às 18h",
  },
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").substring(0, 11);
    if (numbers.length >= 11) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
    } else if (numbers.length >= 7) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
    } else if (numbers.length >= 2) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
    } else if (numbers.length >= 1) {
      return `(${numbers}`;
    }
    return numbers;
  };

  const validateField = (id: string, value: string) => {
    let error = "";
    switch (id) {
      case "name":
        if (!value.trim()) error = "Por favor, insira seu nome";
        break;
      case "email":
        if (!value.trim()) error = "Por favor, insira seu e-mail";
        else if (!validateEmail(value)) error = "Por favor, insira um e-mail válido";
        break;
      case "subject":
        if (!value.trim()) error = "Por favor, insira o assunto";
        break;
      case "message":
        if (!value.trim()) error = "Por favor, escreva sua mensagem";
        break;
    }
    setErrors((prev) => ({ ...prev, [id]: error }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    if (id === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
    if (touched[id]) validateField(id, value);
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setTouched((prev) => ({ ...prev, [id]: true }));
    validateField(id, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Por favor, insira seu nome";
    if (!formData.email.trim()) newErrors.email = "Por favor, insira seu e-mail";
    else if (!validateEmail(formData.email)) newErrors.email = "Por favor, insira um e-mail válido";
    if (!formData.subject.trim()) newErrors.subject = "Por favor, insira o assunto";
    if (!formData.message.trim()) newErrors.message = "Por favor, escreva sua mensagem";

    setErrors(newErrors);
    setTouched({ name: true, email: true, subject: true, message: true });

    if (Object.values(newErrors).every((e) => !e)) {
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      setFormData({ name: "", email: "", company: "", phone: "", subject: "", message: "" });
      setTouched({});
      setErrors({});
    } else {
      toast.error("Por favor, preencha todos os campos obrigatórios");
    }
  };

  const getFieldClass = (id: string) => {
    if (!touched[id]) return "border-gray-200";
    if (errors[id]) return "border-red-400 focus:border-red-500";
    if (formData[id as keyof typeof formData]) return "border-green-400 focus:border-green-500";
    return "border-gray-200";
  };

  return (
    <section id="contato" className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50" />

      {/* Decorative blobs */}
      <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-2xl animate-pulse" />
      <div
        className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-violet-200/30 to-purple-300/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-2 backdrop-blur-sm bg-white/80 border border-blue-200/50"
          >
            Estamos aqui para ajudar
          </Badge>
          <h2 className="text-4xl md:text-5xl mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent font-bold">
            Fale com nossa equipe
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Dúvidas sobre cadastro, sistema nacional, planos ou configuração?
            Nossa equipe especializada está pronta para ajudar você a{" "}
            <span className="text-blue-600 font-medium">começar</span> ou{" "}
            <span className="text-indigo-600 font-medium">otimizar</span> seu
            uso do ClinNota.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-16 mb-16">
          {/* Contact form */}
          <div className="xl:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl shadow-2xl">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold">Entre em contato</h3>
                </div>
              </div>
              <div className="px-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 font-medium">
                        Nome completo <span className="text-red-400 text-xs">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="name"
                          placeholder="Como podemos te chamar?"
                          className={`bg-white/50 transition-all duration-300 pr-10 ${getFieldClass("name")}`}
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {touched.name && !errors.name && formData.name && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                        {errors.name && (
                          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                        )}
                      </div>
                      {errors.name && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {errors.name}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 font-medium">
                        E-mail <span className="text-red-400 text-xs">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com.br"
                          className={`bg-white/50 transition-all duration-300 pr-10 ${getFieldClass("email")}`}
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {touched.email && !errors.email && formData.email && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                        {errors.email && (
                          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                        )}
                      </div>
                      {errors.email && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="font-medium">
                        Empresa <span className="text-gray-400 text-xs">(opcional)</span>
                      </Label>
                      <Input
                        id="company"
                        placeholder="Nome da sua empresa"
                        className="bg-white/50 border-gray-200 transition-all duration-300"
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-medium">
                        Telefone <span className="text-gray-400 text-xs">(opcional)</span>
                      </Label>
                      <Input
                        id="phone"
                        placeholder="(00) 00000-0000"
                        className="bg-white/50 border-gray-200 transition-all duration-300"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="flex items-center gap-2 font-medium">
                      Assunto <span className="text-red-400 text-xs">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="subject"
                        placeholder="Sobre o que você gostaria de falar?"
                        className={`bg-white/50 transition-all duration-300 pr-10 ${getFieldClass("subject")}`}
                        value={formData.subject}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.subject && !errors.subject && formData.subject && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                      {errors.subject && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                      )}
                    </div>
                    {errors.subject && (
                      <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errors.subject}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-2 font-medium">
                      Mensagem <span className="text-red-400 text-xs">*</span>
                    </Label>
                    <div className="relative">
                      <textarea
                        id="message"
                        placeholder="Descreva sua dúvida, necessidade ou sugestão. Quanto mais detalhes, melhor poderemos ajudar!"
                        className={`flex min-h-[140px] w-full rounded-md border px-3 py-2 text-base bg-white/50 transition-all duration-300 pr-10 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-violet-500/20 focus-visible:border-violet-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none ${getFieldClass("message")}`}
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.message && !errors.message && formData.message && (
                        <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                      )}
                      {errors.message && (
                        <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-400" />
                      )}
                    </div>
                    {errors.message && (
                      <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errors.message}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg group hover:shadow-lg transition-all"
                  >
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Enviar mensagem
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    Ao enviar, você aceita nossos termos de privacidade
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Contact info sidebar */}
          <div className="space-y-8">
            {/* Contact methods */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">
                Outros meios de contato
              </h3>
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/80 transition-all hover:scale-[1.02]"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {method.title}
                      </div>
                      <div className="text-gray-700">{method.description}</div>
                      {method.subtitle && (
                        <div className="text-sm text-gray-500">
                          {method.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Business hours */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-semibold">
                  Horário de atendimento
                </h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Segunda a Sexta:</span>
                  <span className="font-medium text-gray-900">9h às 18h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sábado:</span>
                  <span className="font-medium text-gray-900">9h às 13h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Domingo:</span>
                  <span className="text-gray-500">Fechado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ section */}
        <div>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <HelpCircle className="w-6 h-6 text-indigo-600" />
              <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Perguntas frequentes
              </h3>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Respostas detalhadas para as dúvidas mais comuns sobre o ClinNota
            </p>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="w-full text-left px-6 py-5 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5 text-xs shrink-0">
                      {faq.category}
                    </Badge>
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? "max-h-60 pb-5" : "max-h-0"
                  }`}
                >
                  <div className="px-6 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
