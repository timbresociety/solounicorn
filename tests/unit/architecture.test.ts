import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const files = (directory: string): string[] => readdirSync(directory).flatMap((name) => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});

describe('engine dependency boundary', () => {
  it('contains no browser, React, storage, wall-clock, or unseeded random authority', () => {
    const forbidden = [/from ['"]react/, /window\./, /document\./, /localStorage/, /indexedDB/, /Date\.now/, /performance\.now/, /Math\.random/];
    const violations = files(join(process.cwd(), 'src/game/engine')).flatMap((path) => {
      const source = readFileSync(path, 'utf8');
      return forbidden.filter((pattern) => pattern.test(source)).map((pattern) => `${path}:${pattern}`);
    });
    expect(violations).toEqual([]);
  });
});
