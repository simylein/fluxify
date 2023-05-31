import { info } from '../../logger/logger';
import { extractExports, searchFiles } from './helper';

const matchingFiles = searchFiles('./src', /\.seed\.ts$/);
const seeds = await extractExports(matchingFiles);

if (seeds.length === 0) {
	info('no seeds found for running');
} else {
	info(`found ${seeds.length} seeds to run`);
}

await (async (): Promise<void> => {
	for (const seed of seeds) {
		if (seed && seed instanceof Function) {
			info(`running seed ${seed.name}...`);
			await seed();
		}
	}
})();
