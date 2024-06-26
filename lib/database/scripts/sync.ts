import { error, info } from '../../logger/logger';
import { runQuery } from '../database';
import { extractExports, filterFiles, searchFiles } from './helper';

const matchingFiles = filterFiles(searchFiles('./src', /\.entity\.ts$/), process.argv[2]);
const entities = await extractExports(matchingFiles);

if (entities.length === 0) {
	info('no entities found for syncing');
} else {
	info(`found ${entities.length} entities to sync`);
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
			info(`syncing table ${entity.name}...`);
			try {
				await runQuery(entity.schema);
			} catch (err) {
				error(`failed to sync table ${entity.name}`, err);
			}
		}
	}
})();
