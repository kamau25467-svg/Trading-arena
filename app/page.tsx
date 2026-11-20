
"use client";

import { useEffect, useMemo, useState } from "react";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type Position = {
  id: number;
  side: "BUY" | "SELL";
  entry: number;
  quantity: number;
};

const pairs = [
  { name: "EUR/USD", price: 1.16482 },
  { name: "GBP/USD", price: 1.32340 },
  { name: "USD/JPY", price: 154.285 },
  { name: "AUD/USD", price: 0.65120 },
  { name: "USD/CHF", price: 0.80240 },
];

function createCandles(start: number): Candle[] {
  let price = start;
  return Array.from({ length: 65 }, (_, i) => {
    const open = price;
    const change = (Math.random() - 0.49) * 0.0007;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 0.00015;
    const low = Math.min(open, close) - Math.random() * 0.00015;
    price = close;
    return { time: i, open, high, low, close };
  });
}

export default function Home() {
  const [mode, setMode] = useState<"DEMO" | "REAL">("DEMO");
  const [pair, setPair] = useState(pairs[0]);
  const [price, setPrice] = useState(pairs[0].price);
  const [candles, setCandles] = useState<Candle[]>(() =>
    createCandles(pairs[0].price)
  );
  const [positions, setPositions] = useState<Position[]>([]);
  const [balance, setBalance] = useState(10000);
  const [nextId, setNextId] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode !== "DEMO") return;

    const timer = window.setInterval(() => {
      setCandles((previous) => {
        const last = previous[previous.length - 1];
        const open = last.close;
        const close = open + (Math.random() - 0.49) * 0.00035;
        const candle = {
          time: last.time + 1,
          open,
          close,
          high: Math.max(open, close) + Math.random() * 0.00008,
          low: Math.min(open, close) - Math.random() * 0.00008,
        };
        return [...previous.slice(1), candle];
      });

      setPrice((previous) =>
        Number((previous + (Math.random() - 0.49) * 0.00025).toFixed(5))
      );
    }, 650);

    return () => window.clearInterval(timer);
  }, [mode, pair]);

  const floating = useMemo(
    () =>
      positions.reduce((total, position) => {
        const difference = price - position.entry;
        const direction = position.side === "BUY" ? 1 : -1;
        return total + difference * direction * 100000 * position.quantity;
      }, 0),
    [positions, price]
  );

  const equity = balance + floating;

  const openTrade = (side: "BUY" | "SELL") => {
    if (mode === "REAL") {
      setMessage("Real trading is locked until a licensed broker is connected.");
      return;
    }

    setPositions((previous) => [
      ...previous,
      { id: nextId, side, entry: price, quantity: 0.01 },
    ]);
    setNextId((value) => value + 1);
    setMessage(`${side} demo position opened.`);
  };

  const closeTrade = (position: Position) => {
    const difference = price - position.entry;
    const direction = position.side === "BUY" ? 1 : -1;
    const profit = difference * direction * 100000 * position.quantity;

    if (!window.confirm(`Close position? Estimated P/L: $${profit.toFixed(2)}`))
      return;

    setBalance((value) => value + profit);
    setPositions((previous) =>
      previous.filter((item) => item.id !== position.id)
    );
    setMessage(
      profit > 0
        ? `Profit secured: +$${profit.toFixed(2)}`
        : `Position closed: $${profit.toFixed(2)}`
    );
  };

  const chart = useMemo(() => {
    const values = candles;
    const min = Math.min(...values.map((c) => c.low));
    const max = Math.max(...values.map((c) => c.high));
    const range = max - min || 0.0001;
    const y = (value: number) => 190 - ((value - min) / range) * 170;

    return values.map((candle, index) => {
      const x = 12 + index * 8;
      const top = Math.min(y(candle.open), y(candle.close));
      const height = Math.max(2, Math.abs(y(candle.open) - y(candle.close)));
      const up = candle.close >= candle.open;

      return (
        <g key={candle.time}>
          <line
            x1={x + 2}
            x2={x + 2}
            y1={y(candle.high)}
            y2={y(candle.low)}
            stroke={up ? "#16a875" : "#ef5266"}
            strokeWidth="1.3"
          />
          <rect
            x={x}
            y={top}
            width="4"
            height={height}
            fill={up ? "#16a875" : "#ef5266"}
            rx="0.7"
          />
        </g>
      );
    });
  }, [candles]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-white px-5 py-4">
        <div>
          <div className="text-xl font-black tracking-tight">
            <span className="text-blue-600">PIP</span> ARENA
          </div>
          <div className="text-xs text-slate-500">TRADE THE MOMENT</div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
          <button
            onClick={() => {
              setMode("DEMO");
              setMessage("Demo Arena selected.");
            }}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              mode === "DEMO"
                ? "bg-blue-600 text-white"
                : "text-slate-600"
            }`}
          >
            DEMO
          </button>
          <button
            onClick={() => {
              setMode("REAL");
              setMessage("Real Arena requires a broker connection.");
            }}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              mode === "REAL"
                ? "bg-slate-900 text-white"
                : "text-slate-600"
            }`}
          >
            REAL
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-5 p-4 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Trading Arena</h1>
            <p className="text-sm text-slate-500">
              Your strategy. Your arena.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800">
            {mode === "DEMO" ? "SIMULATED MARKET" : "BROKER NOT CONNECTED"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Balance", balance],
            ["Equity", equity],
            ["Floating P/L", floating],
            ["Free margin*", equity],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">{label}</div>
              <div className="mt-2 text-xl font-extrabold">
                ${Number(value).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_310px]">
          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
              <div>
                <select
                  value={pair.name}
                  onChange={(event) => {
                    const selected = pairs.find(
                      (item) => item.name === event.target.value
                    )!;
                    setPair(selected);
                    setPrice(selected.price);
                    setCandles(createCandles(selected.price));
                    setMessage("Pair changed.");
                  }}
                  className="rounded-lg border px-3 py-2 font-bold"
                >
                  {pairs.map((item) => (
                    <option key={item.name}>{item.name}</option>
                  ))}
                </select>
                <div className="mt-2 text-2xl font-black">
                  {price.toFixed(5)}
                </div>
              </div>
              <span className="rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                ● SIMULATED TICK
              </span>
            </div>

            <div className="bg-[#071525] p-3">
              <div className="mb-2 flex justify-between text-xs text-slate-400">
                <span>PRICE ACTION</span>
                <span>DEMO FEED · NOT LIVE BROKER DATA</span>
              </div>
              <svg
                viewBox="0 0 540 205"
                preserveAspectRatio="none"
                className="h-64 w-full"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <line
                    key={i}
                    x1="0"
                    x2="540"
                    y1={20 + i * 42}
                    y2={20 + i * 42}
                    stroke="#24374a"
                    strokeDasharray="3 5"
                  />
                ))}
                {chart}
                <line
                  x1="0"
                  x2="540"
                  y1={190 - ((price - Math.min(...candles.map(c => c.low))) /
                    (Math.max(...candles.map(c => c.high)) -
                      Math.min(...candles.map(c => c.low)) || 0.0001)) * 170}
                  y2={190 - ((price - Math.min(...candles.map(c => c.low))) /
                    (Math.max(...candles.map(c => c.high)) -
                      Math.min(...candles.map(c => c.low)) || 0.0001)) * 170}
                  stroke="#f6c453"
                  strokeDasharray="5 4"
                />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">
              <button
                onClick={() => openTrade("BUY")}
                className="rounded-xl bg-emerald-600 py-4 font-black text-white hover:bg-emerald-700"
              >
                BUY ↑
                <span className="block text-xs font-medium">Market order · Demo</span>
              </button>
              <button
                onClick={() => openTrade("SELL")}
                className="rounded-xl bg-rose-600 py-4 font-black text-white hover:bg-rose-700"
              >
                SELL ↓
                <span className="block text-xs font-medium">Market order · Demo</span>
              </button>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="font-extrabold">Order settings</h2>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-slate-500">Trade size</span>
                <strong>0.01 lot</strong>
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-slate-500">Chart speed</span>
                <strong>Fast simulation</strong>
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-slate-500">Leverage</span>
                <strong>Not yet configured</strong>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                Demo prices are generated locally for interface testing.
                This is not a live market feed or an accurate brokerage
                profit calculation.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="font-extrabold">Open positions</h2>
              {positions.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  No open positions yet.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {positions.map((position) => (
                    <div key={position.id} className="rounded-lg bg-slate-50 p-3">
                      <div className="flex justify-between">
                        <strong className={position.side === "BUY" ? "text-green-600" : "text-rose-600"}>
                          {position.side} {pair.name}
                        </strong>
                        <span className="text-xs">0.01 lot</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Entry: {position.entry.toFixed(5)}
                      </div>
                      <button
                        onClick={() => closeTrade(position)}
                        className="mt-3 w-full rounded-lg border border-slate-300 py-2 text-sm font-bold hover:bg-white"
                      >
                        Close position
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          <strong>Development build:</strong> Demo mode only. Real mode is a
          placeholder until secure broker connectivity, account controls and
          regulatory checks are completed.
        </div>

        {message && (
          <div className="rounded-lg border bg-white p-3 text-sm font-semibold">
            {message}
          </div>
        )}

        <p className="text-xs text-slate-400">
          *Free margin is a temporary placeholder. Margin, spread, fees,
          stop-loss, take-profit and accurate multi-pair valuation will be
          implemented before the simulator is treated as complete.
        </p>
      </section>
    </main>
  );
}
