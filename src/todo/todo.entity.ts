import { Infer, column, created, deleted, entity, primary, relation, updated } from 'lib/database';
import { userEntity } from '../user/user.entity';

export const todoEntity = entity('todo', {
	id: primary('uuid'),
	title: column('varchar').length(32),
	description: column('varchar').length(256).nullable(),
	done: column('boolean').nullable(),
	dueAt: column('datetime').name('due_at').nullable(),
	userId: relation(userEntity).name('user_id'),
	createdAt: created().name('created_at'),
	updatedAt: updated().name('updated_at'),
	deletedAt: deleted().name('deleted_at'),
});

export type Todo = Infer<typeof todoEntity>;
