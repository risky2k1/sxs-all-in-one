"use client";

import { useState } from "react";

import type { Studio } from "@/shared/api/studio/studio.types";
import { AddCustomSkill } from "../components/AddCustomSkill";
import { EquippedBoard } from "../components/EquippedBoard";
import { SkillCard } from "../components/SkillCard";
import type { SkillCardModel } from "../lib/mergeSkills";
import { mergeSkills } from "../lib/mergeSkills";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

function rankOrder(rank: string) {
  const match = rank.match(/\d+/);
  return match ? Number(match[0]) : 99;
}

function byOwned(a: SkillCardModel, b: SkillCardModel) {
  return Number(b.owned) - Number(a.owned) || a.en.localeCompare(b.en);
}

export function SkillsView({ studio }: { studio: Studio }) {
  const [query, setQuery] = useState("");
  const [ranksOn, setRanksOn] = useState<string[]>([]);
  const skills = mergeSkills(studio);
  const needle = query.trim().toLowerCase();
  const ranks = [...new Set(skills.map((skill) => skill.tierClass))].sort(
    (a, b) => rankOrder(a) - rankOrder(b),
  );

  function toggleRank(rank: string) {
    setRanksOn((current) =>
      current.includes(rank)
        ? current.filter((item) => item !== rank)
        : [...current, rank],
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <EquippedBoard studio={studio} skills={skills} />
      <div className="flex flex-wrap items-center gap-2">
        {ranks.map((rank) => (
          <Button
            key={rank}
            type="button"
            size="sm"
            variant={ranksOn.includes(rank) ? "default" : "neutral"}
            onClick={() => toggleRank(rank)}
          >
            {rank}
          </Button>
        ))}
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name"
          className="max-w-xs"
        />
      </div>
      {ranks.map((rank) => {
        if (ranksOn.length > 0 && !ranksOn.includes(rank)) return null;
        const group = skills
          .filter((skill) => skill.tierClass === rank)
          .filter((skill) =>
            needle
              ? `${skill.en} ${skill.element}`.toLowerCase().includes(needle)
              : true,
          );
        if (group.length === 0) return null;
        return (
          <section key={rank} className="flex flex-col gap-3">
            <h2 className="font-heading text-xl">{rank}</h2>
            {(["active", "passive"] as const).map((type) => {
              const rows = group
                .filter((skill) => skill.type === type)
                .sort(byOwned);
              if (rows.length === 0) return null;
              return (
                <div key={type}>
                  <h3 className="mb-2 font-heading">
                    {type === "active" ? "Technique" : "Charm"}
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {rows.map((skill) => (
                      <SkillCard key={skill.id} skill={skill} studio={studio} />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
      <AddCustomSkill characterId={studio.character.id} />
    </div>
  );
}
