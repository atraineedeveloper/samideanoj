/**
 * Malgranda D1-adaptilo super node:sqlite, por testi veran SQL kun la veraj
 * migradoj. Ĝi kovras nur la parton de la D1-API, kiun la projekto uzas.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";

class Deklaro {
  constructor(
    private db: DatabaseSync,
    private sql: string,
    private valoroj: SQLInputValue[] = [],
  ) {}
  bind(...valoroj: unknown[]) {
    return new Deklaro(this.db, this.sql, valoroj as SQLInputValue[]);
  }
  async all<T>() {
    return { results: this.db.prepare(this.sql).all(...this.valoroj) as T[], success: true };
  }
  async first<T>() {
    return (this.db.prepare(this.sql).get(...this.valoroj) as T) ?? null;
  }
  async run() {
    this.db.prepare(this.sql).run(...this.valoroj);
    return { success: true };
  }
}

export function testaDatumbazo(): { d1: D1Database; sqlite: DatabaseSync } {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  const dosierujo = join(import.meta.dirname, "..", "..", "migrations");
  for (const dosiero of readdirSync(dosierujo)
    .filter((d) => d.endsWith(".sql"))
    .sort()) {
    sqlite.exec(readFileSync(join(dosierujo, dosiero), "utf8"));
  }
  const d1 = {
    prepare: (sql: string) => new Deklaro(sqlite, sql),
    batch: async (deklaroj: Deklaro[]) => Promise.all(deklaroj.map((d) => d.all())),
  };
  return { d1: d1 as unknown as D1Database, sqlite };
}
