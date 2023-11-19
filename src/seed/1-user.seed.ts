import { word, words } from 'lib/fake';
import { repository } from 'lib/repository';
import { userEntity } from '../user/user.entity';

const userRepository = repository(userEntity);

export const users = async (): Promise<void> => {
	await userRepository.insertMany(
		[
			...new Set(
				Array(8)
					.fill(null)
					.map(() => word(4)),
			),
		].map((username) => ({ username, password: words(4).split(' ').join('-') })),
	);
};
