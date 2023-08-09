import { describe, expect, test } from 'bun:test';
import { sortFiles } from './helper';

describe(sortFiles.name, () => {
	test('should sort files alphabetically', () => {
		expect(sortFiles(['charlie', 'alpha', 'delta', 'bravo'])).toEqual(['alpha', 'bravo', 'charlie', 'delta']);
	});

	test('should sort files numerical', () => {
		expect(sortFiles(['src/seed/2-todo.seed.ts', 'src/seed/3-log.seed.ts', 'src/seed/1-user.seed.ts'])).toEqual([
			'src/seed/1-user.seed.ts',
			'src/seed/2-todo.seed.ts',
			'src/seed/3-log.seed.ts',
		]);
	});
});
