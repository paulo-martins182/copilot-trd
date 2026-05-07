import { Card, CardDescription, CardTitle } from "@renderer/components/ui/card";

export function TermsPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <Card>
          <CardTitle>Disclaimer obrigatório</CardTitle>
          <CardDescription>
            O TradeScope AI é um assistente analítico. Ele não executa operações, não garante lucro e não substitui sua decisão.
          </CardDescription>
        </Card>
        <Card className="space-y-3 text-sm text-zinc-300">
          <p>Operações binárias envolvem risco elevado e podem gerar perda total do valor aplicado.</p>
          <p>Os alertas são leituras probabilísticas de frames visuais e podem atrasar, falhar ou interpretar o gráfico incorretamente.</p>
          <p>O sistema bloqueia sinais fracos por desenho, mas isso não elimina risco operacional, emocional, técnico ou de mercado.</p>
          <p>Não há martingale, auto-click, auto-trade, integração com corretora ou promessa de assertividade.</p>
          <p>Você é o único responsável por decidir se opera, quando opera, quanto arrisca e quando parar.</p>
        </Card>
        <Card>
          <CardTitle>Regras éticas implementadas</CardTitle>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Sinais atrasados são rebaixados para WAIT ou têm expiração ajustada.</li>
            <li>Risco HIGH força AVOID.</li>
            <li>Mercado UNCLEAR força WAIT.</li>
            <li>Confiança baixa força WAIT.</li>
            <li>Valor sugerido é limite de risco configurado pelo usuário.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
