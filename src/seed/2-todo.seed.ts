import { randomInt } from 'crypto';
import { words } from 'lib/fake';
import { repository } from 'lib/repository';
import { todoEntity } from '../todo/todo.entity';
import { userEntity } from '../user/user.entity';

const userRepository = repository(userEntity);
const todoRepository = repository(todoEntity);

export const todos = async (): Promise<void> => {
	const users = await userRepository.find({ select: { id: true } });
	await todoRepository.insertMany(
		Array(32)
			.fill(null)
			.map(() => ({
				title: words(2),
				description: words(randomInt(4, 16)),
				done: randomInt(0, 2) === 0,
				dueAt: randomInt(0, 2) === 0 ? new Date() : null,
				userId: users[randomInt(0, users.length - 1)].id,
			})),
	);
};
