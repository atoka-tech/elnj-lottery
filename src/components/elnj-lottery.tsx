"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { usePersistedState } from "@/hooks/uss-parsist";
import { Trash2 } from "lucide-react";

interface Lottery {
  title: string;
  candidates: string;
}

interface Result {
  title: string;

  selection: string;
}

interface Weapon {
  Label: string;
  Type: "Coop" | "Versus" | "Mission";
}

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

const ElnjLottery: React.FC = () => {
  const [lotteries, setLotteries] = usePersistedState<Lottery[]>("lotteries", [
    { title: "", candidates: "" },
  ]);
  const [results, setResults] = useState<Result[]>([]);
  const [webhook, setWebhook] = usePersistedState<string>("webhook", "");
  const [isSending, setIsSending] = useState<boolean>(false);

  const onChange = (
    key: keyof Lottery,
    event:
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newLotteries = [...lotteries];
    newLotteries[index][key] = event.target.value;

    setLotteries(newLotteries);
  };

  const removeLottery = (index: number) => {
    const newLotteries = [...lotteries];
    newLotteries.splice(index, 1);

    setLotteries(newLotteries);
  };

  const execLottery = () => {
    const results = lotteries.map((lottery) => {
      const candidates = lottery.candidates.split("\n").filter((c) => c !== "");

      const result = candidates[Math.floor(Math.random() * candidates.length)];

      return {
        title: lottery.title,
        selection: result,
      };
    });

    setResults(results);
  };

  const loadWeapons = async (index: number) => {
    const weapons: Weapon[] = await fetch(
      "https://leanny.github.io/splat3/data/mush/600/WeaponInfoMain.json"
    ).then((res) => res.json());

    const filteredWeapons = weapons
      .filter((weapon) => weapon.Type === "Versus")
      .sort((a, b) => (a.Label > b.Label ? 1 : -1));

    const newLotteries = [...lotteries];
    newLotteries[index].candidates = filteredWeapons
      .map((item) => item.Label)
      .join("\n");

    setLotteries(newLotteries);
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (isSending) return;

    setIsSending(true);

    const payload = {
      content: "==============【えるのじろたりー】==============",
      embeds: results.map((result) => ({
        title: result.title,
        description: result.selection,
      })),
    };

    await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    await sleep(2000);

    setIsSending(false);
  };

  return (
    <div className="grid gap-y-6">
      {lotteries.map((lottery, index) => (
        <section
          key={index}
          className="relative rounded border border-gray-400 p-5 grid gap-y-5"
        >
          <label htmlFor={`title-${index}`} className="grid gap-y-2">
            <h2 className="text-sm">タイトル</h2>
            <input
              type="text"
              id={`title-${index}`}
              value={lottery.title}
              onChange={(e) => onChange("title", e, index)}
              className="rounded bg-gray-100 border-gray-300 border p-2 text-sm"
            />
          </label>

          <label htmlFor={`candidates-${index}`} className="grid gap-y-2">
            <h2 className="text-sm flex justify-between">
              <span>候補（改行区切り）</span>
              <button
                onClick={() => loadWeapons(index)}
                className="text-white bg-gray-600 text-xs px-4 py-1 rounded-full"
              >
                最新のブキ一覧を読み込む
              </button>
            </h2>
            <textarea
              id={`candidates-${index}`}
              onChange={(e) => onChange("candidates", e, index)}
              value={lottery.candidates}
              className="h-40 rounded bg-gray-100 border-gray-300 border p-2 text-sm"
            ></textarea>
          </label>

          {lotteries.length > 1 && (
            <button
              onClick={() => removeLottery(index)}
              className="absolute -right-4 -top-4 w-8 h-8"
            >
              <Trash2 size={30} />
            </button>
          )}
        </section>
      ))}

      <div className="grid gap-y-5">
        <button
          className="block border-gray-400 border w-full rounded py-2"
          onClick={() =>
            setLotteries([...lotteries, { title: "", candidates: "" }])
          }
        >
          抽選を追加する
        </button>

        <hr className="border-gray-400" />

        <button
          className="block bg-gray-600 text-white w-full rounded py-2"
          onClick={execLottery}
        >
          抽選スタート
        </button>
      </div>

      {results.length > 0 && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center fade-in">
          <div
            className="absolute w-full h-full top-0 left-0 bg-black/30"
            onClick={() => setResults([])}
          ></div>

          <div className="relative bg-white rounded w-full max-w-4xl">
            <h2 className="text-xl font-bold bg-gray-600 text-white py-2 px-5 text-center">
              抽選結果
            </h2>

            <ul className="grid gap-y-4 p-5">
              {results.map((result, index) => (
                <li key={index}>
                  <h3 className="text-sm font-bold">【{result.title}】</h3>
                  <p className="text-sm">{result.selection}</p>
                </li>
              ))}
            </ul>

            <hr />

            <div className="p-5 grid gap-y-2">
              <h3 className="text-sm">
                Webhookを使ってDiscordへ結果を送信する
              </h3>

              <form onSubmit={onSubmit} className="flex gap-x-2">
                <input
                  type="text"
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  required
                  placeholder="e.g. https://discord.com/api/webhooks/xxx"
                  className="bg-gray-100 border-gray-300 border p-2 text-sm rounded w-full"
                />

                <button
                  type="submit"
                  disabled={isSending}
                  className="bg-gray-600 relative gap-x-1 text-white w-28 rounded py-2 disabled:opacity-50"
                >
                  {isSending && (
                    <span className="absolute flex h-4 w-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    </span>
                  )}

                  <span>送信</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(ElnjLottery), { ssr: false });
