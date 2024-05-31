import { randomInt } from 'crypto';
import { adjective, excuses, material } from 'lib/fake';
import { repository } from 'lib/repository';
import { todoEntity } from '../todo/todo.entity';
import { userEntity } from '../user/user.entity';

const userRepository = repository(userEntity);
const todoRepository = repository(todoEntity);

export const todos = async (): Promise<void> => {
	const users = await userRepository.find({ select: { id: true } });
	await todoRepository.insertMany(
		Array(Math.floor(32 + Math.random() * 32))
			.fill(null)
			.map(() => ({
				title: `${adjective()} ${material()}`,
				description: excuses(randomInt(1, 4)).join('. '),
				done: randomInt(0, 2) === 0,
				dueAt: randomInt(0, 2) === 0 ? new Date() : null,
				userId: users[randomInt(0, users.length - 1)].id,
			})),
	);
};
