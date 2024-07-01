import { runQuery } from '../../database/database';
import { debug, error } from '../../logger/logger';

const keys = (input: string): string[] => {
	return input
		.split(',')
		.map((frag) => frag.split(' ')[0])
		.map((key) => (key.startsWith('(') ? key.substring(1) : key))
		.filter((key) => key !== 'id');
};

export const migrate = async (name: string, before: string, after: string): Promise<void> => {
	const oldRaw = keys(before);
	const newRaw = keys(after);
	const filteredOld = oldRaw.filter((key) => newRaw.includes(key));
	const filteredNew = newRaw.filter((key) => oldRaw.includes(key));
	const oldKeys = filteredOld.map((key, ind) => `${filteredNew[ind]} as ${key}`).join(',');
	const newKeys = filteredNew.join(',');
	await runQuery('pragma foreign_keys = off');
	try {
		debug(`migrating schema for table '${name}'`);
		await runQuery(`create table ${name}_migration ${after}`);
		await runQuery(`insert into ${name}_migration (id,${newKeys}) select id,${oldKeys} from ${name}`);
		await runQuery(`drop table ${name}`);
		await runQuery(`create table ${name} ${after}`);
		await runQuery(`insert into ${name} (id,${newKeys}) select id,${newKeys} from ${name}_migration`);
	} catch (err) {
		error(`failed to migrate table '${name}'`, err);
	}
	await runQuery(`drop table ${name}_migration`);
	await runQuery('pragma foreign_keys = on');
};
