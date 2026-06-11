import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

function findPackageRoot(startDir: string): string {
  let current = startDir;
  while (true) {
    const candidate = join(current, 'package.json');
    try {
      readFileSync(candidate, 'utf8');
      return current;
    } catch {
      const parent = dirname(current);
      if (parent === current) {
        throw new Error('package.json not found');
      }
      current = parent;
    }
  }
}

const moduleDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = findPackageRoot(moduleDir);

export const PACKAGE_VERSION: string = JSON.parse(
  readFileSync(join(packageRoot, 'package.json'), 'utf8')
).version;