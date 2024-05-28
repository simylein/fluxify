import { error, info } from '../../logger/logger';
import { runQuery } from '../database';
import { extractExports, filterFiles, searchFiles } from './helper';

const matchingFiles = filterFiles(searchFiles('./src', /\.entity\.ts$/), process.argv[2]);
const entities = await extractExports(matchingFiles);

if (entities.length === 0) {
	info('no entities found for dropping');
} else {
	info(`found ${entities.length} entities to drop`);
}

await runQuery('pragma foreign_keys = off');

await (async (): Promise<void> => {
	for (const entity of entities) {
		if (
			entity &&
			typeof entity === 'object' &&
			'name' in entity &&
			'schema' in entity &&
			typeof entity.name === 'string' &&
			typeof entity.schema === 'string'
		) {
			info(`dropping table ${entity.name}...`);
			try {
				await runQuery(`drop table if exists ${entity.name}`);
			} catch (err) {
				error(`failed to drop table ${entity.name}`, err);
			}
		}
	}
})();
