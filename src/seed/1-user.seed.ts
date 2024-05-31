import { randomBytes } from 'crypto';
import { usernames } from 'lib/fake';
import { repository } from 'lib/repository';
import { userEntity } from '../user/user.entity';

const userRepository = repository(userEntity);

export const users = async (): Promise<void> => {
	await userRepository.insertMany(
		[...new Set(usernames(Math.floor(8 + Math.random() * 8)))].map((username) => ({
			username,
			password: randomBytes(8).toString('hex'),
		})),
	);
};
