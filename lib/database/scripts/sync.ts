import { info } from '../../logger/logger';
import { runQuery } from '../database';
import { extractExports, searchFiles } from './helper';

const matchingFiles = searchFiles('./src', /\.entity\.ts$/);
const entities = await extractExports(matchingFiles);

if (entities.length === 0) {
	info('no entities found for syncing');
} else {
	info(`found ${entities.length} entities to sync`);
}

runQuery('pragma foreign_keys = off');

entities.forEach((entity) => {
	if (
		entity &&
		typeof entity === 'object' &&
		'name' in entity &&
		'schema' in entity &&
		typeof entity.name === 'string' &&
		typeof entity.schema === 'string'
	) {
		info(`syncing table ${entity.name}...`);
		runQuery(entity.schema);
	}
});
