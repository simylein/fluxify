import { Infer, column, created, entity, primary, updated } from 'lib/database';

export const userEntity = entity('user', {
	id: primary(),
	username: column('varchar').length(16).unique(),
	password: column('varchar').length(64),
	createdAt: created().name('created_at'),
	updatedAt: updated().name('updated_at'),
});

export type User = Infer<typeof userEntity>;
