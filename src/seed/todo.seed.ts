import { randomInt } from 'crypto';
import { words } from 'lib/fake';
import { repository } from 'lib/repository';
import { todoEntity } from '../todo/todo.entity';
import { userEntity } from '../user/user.entity';

const userRepository = repository(userEntity);
const todoRepository = repository(todoEntity);

export const todos = async (): Promise<void> => {
	const users = await userRepository.findMany({ select: { id: true } });
	await Promise.all(
		Array(32)
			.fill(null)
			.map(() =>
				todoRepository.insert({
					title: words(2),
					description: words(randomInt(4, 16)),
					done: !!randomInt(0, 1),
					userId: users[randomInt(0, users.length - 1)].id,
				}),
			),
	);
};
