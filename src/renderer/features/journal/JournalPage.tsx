import { useEffect, useState } from "react";
import type { Signal } from "@shared/domain/entities/Analysis";
import type { TradeJournalEntry, TradeJournalMetrics, TradeResult } from "@shared/domain/entities/TradeJournal";
import { TradeJournal } from "@renderer/components/composition/TradeJournal";
import { Button } from "@renderer/components/ui/button";
import { Card, CardDescription, CardTitle } from "@renderer/components/ui/card";
import { Input, Label, Textarea } from "@renderer/components/ui/input";
import { Select } from "@renderer/components/ui/select";

export function JournalPage() {
  const [entries, setEntries] = useState<TradeJournalEntry[]>([]);
  const [metrics, setMetrics] = useState<TradeJournalMetrics | null>(null);
  const [form, setForm] = useState({
    asset: "",
    entryType: "BUY" as Signal,
    result: "WIN" as TradeResult,
    stake: 0,
    notes: ""
  });

  const reload = () => {
    void window.tradeScope.journal.list({ limit: 100 }).then(setEntries);
    void window.tradeScope.journal.metrics().then(setMetrics);
  };

  useEffect(reload, []);

  const submit = async () => {
    if (!form.asset.trim()) return;
    await window.tradeScope.journal.create({
      asset: form.asset.trim(),
      entryType: form.entryType,
      result: form.result,
      stake: form.stake,
      notes: form.notes,
      entryTime: new Date().toISOString()
    });
    setForm({ asset: "", entryType: "BUY", result: "WIN", stake: 0, notes: "" });
    reload();
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <TradeJournal.Root>
        <TradeJournal.Metrics metrics={metrics} />
        <Card className="space-y-4">
          <div>
            <CardTitle>Registrar operação manual</CardTitle>
            <CardDescription>Registro pós-operação para medir disciplina e qualidade dos sinais.</CardDescription>
          </div>
          <div className="grid grid-cols-5 gap-3">
            <div>
              <Label>Ativo</Label>
              <Input value={form.asset} onChange={(event) => setForm({ ...form, asset: event.target.value })} />
            </div>
            <div>
              <Label>Entrada</Label>
              <Select value={form.entryType} onChange={(event) => setForm({ ...form, entryType: event.target.value as Signal })}>
                <option value="BUY">Compra</option>
                <option value="SELL">Venda</option>
              </Select>
            </div>
            <div>
              <Label>Resultado</Label>
              <Select value={form.result} onChange={(event) => setForm({ ...form, result: event.target.value as TradeResult })}>
                <option value="WIN">Win</option>
                <option value="LOSS">Loss</option>
                <option value="DOJI">Doji</option>
              </Select>
            </div>
            <div>
              <Label>Valor</Label>
              <Input type="number" value={form.stake} onChange={(event) => setForm({ ...form, stake: Number(event.target.value) })} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={submit}>Salvar</Button>
            </div>
          </div>
          <div>
            <Label>Observação</Label>
            <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </div>
        </Card>
        <TradeJournal.Filters />
        <TradeJournal.Table entries={entries} />
      </TradeJournal.Root>
    </div>
  );
}
