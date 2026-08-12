import { useEffect, useMemo, useState } from "react";
import "./CreatureQuest.css";

type Direction = "up" | "down" | "left" | "right";
type Tile = "grass" | "path" | "water" | "stone";
type Phase = "explore" | "battle";

type Creature = {
  id: string;
  name: string;
  element: "Spark" | "Leaf" | "Tide" | "Stone";
  maxHp: number;
  attack: number;
  catchRate: number;
  colors: [string, string];
  trait: string;
};

type BattleState = {
  creature: Creature;
  hp: number;
  message: string;
};

const mapRows: Tile[][] = [
  ["grass", "grass", "path", "path", "grass", "grass", "water", "water", "grass", "grass"],
  ["grass", "path", "path", "grass", "grass", "stone", "stone", "water", "grass", "grass"],
  ["grass", "path", "grass", "grass", "path", "path", "grass", "grass", "grass", "stone"],
  ["path", "path", "grass", "water", "water", "path", "grass", "stone", "grass", "grass"],
  ["grass", "grass", "grass", "water", "grass", "path", "path", "path", "grass", "grass"],
  ["grass", "stone", "grass", "grass", "grass", "grass", "stone", "path", "path", "grass"],
  ["grass", "grass", "path", "path", "stone", "grass", "grass", "grass", "path", "grass"],
];

const creatures: Creature[] = [
  {
    id: "glimkit",
    name: "Glimkit",
    element: "Spark",
    maxHp: 24,
    attack: 7,
    catchRate: 0.48,
    colors: ["#60a5fa", "#f8fbff"],
    trait: "Stores tiny storms in its tail.",
  },
  {
    id: "mossmew",
    name: "Mossmew",
    element: "Leaf",
    maxHp: 30,
    attack: 5,
    catchRate: 0.54,
    colors: ["#34d399", "#d9f99d"],
    trait: "Naps under glowing ferns.",
  },
  {
    id: "brinet",
    name: "Brinet",
    element: "Tide",
    maxHp: 28,
    attack: 6,
    catchRate: 0.44,
    colors: ["#38bdf8", "#99f6e4"],
    trait: "Sings when rain is close.",
  },
  {
    id: "cobbowl",
    name: "Cobbowl",
    element: "Stone",
    maxHp: 36,
    attack: 8,
    catchRate: 0.35,
    colors: ["#94a3b8", "#e2e8f0"],
    trait: "Rolls downhill for fun.",
  },
];

const tileLabels: Record<Tile, string> = {
  grass: "Tall grass",
  path: "Trail",
  water: "Pond",
  stone: "Ridge",
};

function getRandomCreature() {
  return creatures[Math.floor(Math.random() * creatures.length)];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function CreatureSprite({ creature, small = false }: { creature: Creature; small?: boolean }) {
  return (
    <svg
      className={small ? "cq-creature cq-creature-small" : "cq-creature"}
      viewBox="0 0 120 120"
      role="img"
      aria-label={creature.name}
    >
      <defs>
        <linearGradient id={`${creature.id}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={creature.colors[0]} />
          <stop offset="100%" stopColor={creature.colors[1]} />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="68" rx="37" ry="34" fill={`url(#${creature.id}-body)`} />
      <circle cx="43" cy="58" r="7" fill="#08111f" />
      <circle cx="76" cy="58" r="7" fill="#08111f" />
      <circle cx="45" cy="56" r="2" fill="#f8fbff" />
      <circle cx="78" cy="56" r="2" fill="#f8fbff" />
      <path d="M48 76 Q60 86 73 76" fill="none" stroke="#08111f" strokeWidth="5" strokeLinecap="round" />
      <path d="M32 38 Q42 12 54 40" fill={creature.colors[0]} />
      <path d="M66 40 Q80 12 90 38" fill={creature.colors[1]} />
      <ellipse cx="60" cy="104" rx="30" ry="8" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

function CreatureQuest() {
  const [player, setPlayer] = useState({ x: 1, y: 3 });
  const [phase, setPhase] = useState<Phase>("explore");
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [team, setTeam] = useState<Creature[]>([]);
  const [steps, setSteps] = useState(0);
  const [log, setLog] = useState("Move through tall grass to find wild critters.");

  const currentTile = mapRows[player.y][player.x];
  const uniqueTeam = useMemo(
    () => team.filter((member, index) => team.findIndex((item) => item.id === member.id) === index),
    [team]
  );

  const startEncounter = () => {
    const creature = getRandomCreature();
    setBattle({
      creature,
      hp: creature.maxHp,
      message: `A wild ${creature.name} appeared.`,
    });
    setPhase("battle");
  };

  const move = (direction: Direction) => {
    if (phase === "battle") {
      return;
    }

    const movement = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    }[direction];
    const nextX = clamp(player.x + movement.x, 0, mapRows[0].length - 1);
    const nextY = clamp(player.y + movement.y, 0, mapRows.length - 1);
    const nextTile = mapRows[nextY][nextX];

    if (nextTile === "water") {
      setLog("The pond is too deep to cross.");
      return;
    }

    setPlayer({ x: nextX, y: nextY });
    setSteps((current) => current + 1);

    if (nextTile === "grass" && Math.random() < 0.32) {
      startEncounter();
      return;
    }

    setLog(`You moved onto ${tileLabels[nextTile].toLowerCase()}.`);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") move("up");
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") move("down");
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") move("left");
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") move("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const attack = () => {
    if (!battle) return;

    const damage = 6 + Math.floor(Math.random() * 9);
    const nextHp = clamp(battle.hp - damage, 0, battle.creature.maxHp);

    if (nextHp === 0) {
      setBattle(null);
      setPhase("explore");
      setLog(`${battle.creature.name} dashed back into the grass.`);
      return;
    }

    setBattle({
      ...battle,
      hp: nextHp,
      message: `You dealt ${damage} focus damage. ${battle.creature.name} looks easier to catch.`,
    });
  };

  const catchCreature = () => {
    if (!battle) return;

    const hpBonus = 1 - battle.hp / battle.creature.maxHp;
    const chance = battle.creature.catchRate + hpBonus * 0.38;
    const caught = Math.random() < chance;

    if (caught) {
      setTeam((current) => [...current, battle.creature]);
      setLog(`${battle.creature.name} joined your team.`);
      setBattle(null);
      setPhase("explore");
      return;
    }

    setBattle({
      ...battle,
      message: `${battle.creature.name} popped free. Try weakening it first.`,
    });
  };

  const flee = () => {
    if (!battle) return;
    setLog(`You backed away from ${battle.creature.name}.`);
    setBattle(null);
    setPhase("explore");
  };

  return (
    <main className="cq-page">
      <section className="cq-shell">
        <header className="cq-header">
          <div>
            <p className="cq-kicker">Creature Quest</p>
            <h1>Catch tiny legends in the midnight grove.</h1>
          </div>
          <div className="cq-stats">
            <div><span>{team.length}</span>Caught</div>
            <div><span>{steps}</span>Steps</div>
            <div><span>{tileLabels[currentTile]}</span>Tile</div>
          </div>
        </header>

        <section className="cq-game">
          <div className="cq-map-panel">
            <div className="cq-map" aria-label="Creature Quest map">
              {mapRows.map((row, y) =>
                row.map((tile, x) => {
                  const isPlayer = player.x === x && player.y === y;
                  return (
                    <button
                      key={`${x}-${y}`}
                      type="button"
                      className={`cq-tile cq-tile-${tile}`}
                      aria-label={`${tileLabels[tile]} tile`}
                    >
                      {isPlayer && <span className="cq-player" />}
                    </button>
                  );
                })
              )}
            </div>

            <div className="cq-controls" aria-label="Movement controls">
              <button type="button" onClick={() => move("up")}>Up</button>
              <button type="button" onClick={() => move("left")}>Left</button>
              <button type="button" onClick={() => move("down")}>Down</button>
              <button type="button" onClick={() => move("right")}>Right</button>
            </div>
          </div>

          <aside className="cq-side-panel">
            <div className="cq-log">
              <p className="cq-panel-label">Field Log</p>
              <p>{battle?.message ?? log}</p>
            </div>

            <div className="cq-team">
              <p className="cq-panel-label">Your Team</p>
              {uniqueTeam.length ? (
                <div className="cq-team-grid">
                  {uniqueTeam.map((creature) => (
                    <div key={creature.id} className="cq-team-card">
                      <CreatureSprite creature={creature} small />
                      <div>
                        <strong>{creature.name}</strong>
                        <span>{creature.element}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="cq-empty-team">No critters yet. Walk through tall grass.</p>
              )}
            </div>
          </aside>
        </section>

        {battle && (
          <section className="cq-battle" role="dialog" aria-modal="true">
            <div className="cq-battle-card">
              <div className="cq-battle-stage">
                <CreatureSprite creature={battle.creature} />
              </div>
              <div className="cq-battle-info">
                <p className="cq-kicker">{battle.creature.element} type</p>
                <h2>{battle.creature.name}</h2>
                <p>{battle.creature.trait}</p>
                <div className="cq-hp" aria-label={`${battle.hp} health remaining`}>
                  <span style={{ width: `${(battle.hp / battle.creature.maxHp) * 100}%` }} />
                </div>
                <p className="cq-hp-text">
                  HP {battle.hp} / {battle.creature.maxHp}
                </p>
                <div className="cq-actions">
                  <button type="button" onClick={attack}>Focus Hit</button>
                  <button type="button" onClick={catchCreature}>Throw Charm</button>
                  <button type="button" onClick={flee}>Run</button>
                </div>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default CreatureQuest;
