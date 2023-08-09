import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export const searchFiles = (dir: string, pattern: RegExp): string[] => {
	const files = readdirSync(dir);
	return files.reduce((acc: string[], file: string) => {
		const filePath = join(dir, file);
		if (statSync(filePath).isDirectory()) {
			const subDirFiles = searchFiles(filePath, pattern);
			return acc.concat(subDirFiles);
		} else if (pattern.test(filePath)) {
			return acc.concat(filePath);
		}
		return acc.sort((alpha, bravo) => alpha.localeCompare(bravo));
	}, []);
};

export const extractExports = (files: string[]): Promise<unknown[]> => {
	return Promise.all(
		files.map(async (filePath: string) => {
			const module = await import(`../../../${filePath}`);
			const properties = Object.keys(module).filter((key) => key !== 'default');
			return properties.map((prop: string) => module[prop])[0];
		}),
	);
};
