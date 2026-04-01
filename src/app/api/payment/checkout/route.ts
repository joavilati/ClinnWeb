import { NextRequest, NextResponse } from "next/server";

const PLANS = {
  MONTHLY: {
    externalId: "clinnota-monthly",
    name: "ClinNota - Plano Mensal",
    description: "Assinatura mensal do ClinNota",
    price: 9990, // R$ 99,90 em centavos
  },
  ANNUAL: {
    externalId: "clinnota-annual",
    name: "ClinNota - Plano Anual",
    description: "Assinatura anual do ClinNota (2 meses grátis)",
    price: 99990, // R$ 999,90 em centavos
  },
} as const;

type PlanType = keyof typeof PLANS;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ABACATEPAY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Chave da AbacatePay não configurada" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const planType = (body.planType as string)?.toUpperCase() as PlanType;

  if (!planType || !PLANS[planType]) {
    return NextResponse.json(
      { error: "Tipo de plano inválido. Use MONTHLY ou ANNUAL." },
      { status: 400 }
    );
  }

  const plan = PLANS[planType];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const response = await fetch(
    "https://api.abacatepay.com/v1/billing/create",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        frequency: "ONE_TIME",
        methods: ["PIX", "CARD"],
        products: [
          {
            externalId: plan.externalId,
            name: plan.name,
            description: plan.description,
            quantity: 1,
            price: plan.price,
          },
        ],
        returnUrl: `${baseUrl}/pagamentos`,
        completionUrl: `${baseUrl}/pagamentos?pagamento=sucesso&plano=${planType.toLowerCase()}`,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error || "Erro ao criar cobrança" },
      { status: response.status }
    );
  }

  return NextResponse.json({ url: data.data.url });
}
