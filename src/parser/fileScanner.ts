import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively scans a directory for JavaScript and TypeScript files.
 * @param dir Directory to scan.
 * @returns Array of matched file paths.
 */
export default function scanDirectory(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (file === 'node_modules' || file.startsWith('.')) {
            return;
        }

        if (stat && stat.isDirectory()) {
            results = results.concat(scanDirectory(fullPath));
        } else {
            const ext = path.extname(fullPath);
            if (['.js', '.ts'].includes(ext)) {
                results.push(fullPath);
            }
        }
    });

    return results;
}