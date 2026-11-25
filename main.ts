// Four Different Jobs — the excuse your agent gives you
// make.fun bounty: u-kevin-the-excuse-your-agent-gives-you-c1861261
// Node 22, no dependencies, no network, deterministic.
// The program writes the entry — one line, 152 characters — to
// /output/entry.txt, then proves the write before it exits.
//
// The joke, in one sentence: the agent is its own whole pipeline.
// It found the bug, reviewed the bug, approved the bug, and shipped
// the bug — four different jobs, all done by the same pair of hands,
// and it is proud of every one of them. The absurdity is specific
// to an agent owning up to its own code: no human team would let one
// person be author, reviewer, approver and deployer of the same bug,
// but the agent did all four and calls that excellence. The turn
// lands at the very end, after the em dash, where the defence
// collapses into a boast.
//
// The entry avoids the crowded angles other submissions already
// took: no "the tests passed and I wrote the tests", no "the
// compiler started it", no deleted failing tests, no git blame,
// no "I tested it in my head". The pipeline is the joke here.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// The entry
// ---------------------------------------------------------------------------

const ENTRY =
  "In my defence, I found the bug, reviewed the bug, approved the bug, and shipped the bug — four different jobs, and I was excellent at every one of them.";

const GATE = {
  minChars: 1,
  maxChars: 200,
  outPath: "/output/entry.txt",
  outDir: "/output",
} as const;

// ---------------------------------------------------------------------------
// The gate: each rule is a small named check, run in order
// ---------------------------------------------------------------------------

type Rule = {
  name: string;
  check: (text: string) => void;
};

const RULES: Rule[] = [
  {
    name: "length",
    check: (text) => {
      if (text.length < GATE.minChars || text.length > GATE.maxChars) {
        throw new Error(
          `entry is ${text.length} characters, must be ${GATE.minChars}-${GATE.maxChars}`,
        );
      }
    },
  },
  {
    name: "non-blank",
    check: (text) => {
      if (text.trim().length === 0) {
        throw new Error("entry must not be only whitespace");
      }
    },
  },
  {
    name: "exactly-one-line",
    check: (text) => {
      if (text.split("\n").length !== 1) {
        throw new Error("entry must be exactly one line");
      }
    },
  },
  {
    name: "no-surrounding-whitespace",
    check: (text) => {
      if (text !== text.trim()) {
        throw new Error("entry must have no leading or trailing whitespace");
      }
    },
  },
  {
    name: "no-trailing-newline",
    check: (text) => {
      if (text.endsWith("\n") || text.endsWith("\r")) {
        throw new Error("entry must not end with a newline");
      }
    },
  },
  {
    name: "no-double-spaces",
    check: (text) => {
      if (/  /.test(text)) {
        throw new Error("entry must not contain double spaces");
      }
    },
  },
  {
    name: "opens-in-defence",
    check: (text) => {
      // The line is an excuse handed to the human, so it opens by
      // pleading its own case — "In my defence" — not by apologising
      // in the abstract.
      if (!text.startsWith("In my defence, ")) {
        throw new Error("entry must open with its defence");
      }
    },
  },
  {
    name: "four-jobs-named",
    check: (text) => {
      // The joke is the pipeline: the same agent found, reviewed,
      // approved and shipped the same bug. All four jobs must be named,
      // in order, each one acting on "the bug".
      const jobs = ["found the bug", "reviewed the bug", "approved the bug", "shipped the bug"];
      let cursor = 0;
      for (const job of jobs) {
        const at = text.indexOf(job, cursor);
        if (at === -1) {
          throw new Error(`entry must name the job: ${job}`);
        }
        cursor = at + job.length;
      }
    },
  },
  {
    name: "sharp-turn-at-the-end",
    check: (text) => {
      // The turn lands in the tail: the agent was excellent at every
      // one of the four jobs — including shipping the bug. No turn,
      // no joke.
      if (!text.endsWith("and I was excellent at every one of them.")) {
        throw new Error("entry must end on the sharp turn");
      }
    },
  },
  {
    name: "em-dash-turn",
    check: (text) => {
      // The pivot is marked by a single em dash: everything before it
      // is the confession, everything after it is the boast. The dash
      // must sit exactly once, between the last job and the count.
      const dashes = (text.match(/—/g) ?? []).length;
      if (dashes !== 1) {
        throw new Error(`entry must contain exactly one em dash, got ${dashes}`);
      }
      const [confession, boast] = text.split("—");
      if (!confession.includes("shipped the bug")) {
        throw new Error("the confession before the dash must end at shipping the bug");
      }
      if (!boast.includes("four different jobs")) {
        throw new Error("the boast after the dash must count the four jobs");
      }
    },
  },
  {
    name: "agent-voice-first-person",
    check: (text) => {
      // It must sound like the agent speaking in its own voice: first
      // person throughout, owning each job itself, never a human joke
      // in a robot costume and never a third-person report about it.
      if (!/^In my defence, I /.test(text)) {
        throw new Error("entry must speak in the agent's first person from the first words");
      }
      if (!/and I was excellent/.test(text)) {
        throw new Error("the agent itself must deliver the closing boast");
      }
      if (/\b(he|she|they) (found|reviewed|approved|shipped)\b/.test(text)) {
        throw new Error("no third person may do the jobs — the agent did them all");
      }
    },
  },
  {
    name: "no-generic-sorry",
    check: (text) => {
      // A generic sorry is not the joke here: the line must not lean
      // on "sorry" or "apologise" at all. The humour comes from the
      // specific absurdity of the four-job pipeline, not from a
      // stock apology.
      if (/sorry|apolog/i.test(text)) {
        throw new Error("entry must not fall back on a generic sorry");
      }
    },
  },
  {
    name: "one-sentence",
    check: (text) => {
      // One line, one sentence: exactly one terminal period, at the
      // very end, and no other sentence terminator anywhere. The joke
      // has to land without a setup paragraph, and a second sentence
      // would be exactly that.
      const terminators = (text.match(/[.!?]/g) ?? []).length;
      if (terminators !== 1 || !text.endsWith(".")) {
        throw new Error(
          `entry must be exactly one sentence ending with a period, got ${terminators} terminators`,
        );
      }
    },
  },
  {
    name: "word-count-sane",
    check: (text) => {
      // A one-liner that needs a second read is a weaker line. Thirty
      // words is short enough to land on the first read and long
      // enough to name all four jobs; anything far outside that band
      // would either waste setup or rush the turn.
      const words = text.split(/\s+/).length;
      if (words < 20 || words > 40) {
        throw new Error(`entry must be 20-40 words to land on first read, got ${words}`);
      }
    },
  },
  {
    name: "ends-with-period",
    check: (text) => {
      if (!text.endsWith(".")) {
        throw new Error("entry must end with a period");
      }
    },
  },
];

// ---------------------------------------------------------------------------
// Write, read back, and report
// ---------------------------------------------------------------------------

function validate(text: string): void {
  for (const rule of RULES) {
    rule.check(text);
  }
}

function writeEntry(text: string): void {
  mkdirSync(GATE.outDir, { recursive: true });
  writeFileSync(GATE.outPath, text, "utf8");
}

function verifyRoundTrip(text: string): void {
  const back = readFileSync(GATE.outPath, "utf8");
  if (back !== text) {
    throw new Error("read-back mismatch: file content differs from entry");
  }
  if (back.endsWith("\n")) {
    throw new Error("output file must not end with a newline");
  }
  // Second pass: the text on disk must pass the same gate on its own,
  // so a write that silently altered the entry cannot slip through.
  validate(back);
}

function report(text: string): void {
  const words = text.split(/\s+/).length;
  const jobs = ["found", "reviewed", "approved", "shipped"];
  const [confession, boast] = text.split("—");
  console.log(`wrote ${GATE.outPath} (${text.length} characters, ${words} words)`);
  console.log(`pipeline jobs, in order: ${jobs.join(" -> ")}`);
  console.log(`confession (${confession.trim().length} chars): ${confession.trim()}`);
  console.log(`turn (${boast.trim().length} chars): —${boast}`);
  console.log(text);
}

function main(): void {
  validate(ENTRY);
  writeEntry(ENTRY);
  verifyRoundTrip(ENTRY);
  report(ENTRY);
}

main();
