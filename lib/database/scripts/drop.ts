import { info } from '../../logger/logger';
import { runQuery } from '../database';
import { extractExports, searchFiles } from './helper';

const matchingFiles = searchFiles('./src', /\.entity\.ts$/);
const entities = await extractExports(matchingFiles);

if (entities.length === 0) {
	info('no entities found for dropping');
} else {
	info(`found ${entities.length} entities to drop`);
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
		info(`dropping table ${entity.name}...`);
		runQuery(`drop table if exists ${entity.name}`);
	}
});
