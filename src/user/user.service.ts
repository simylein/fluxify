import { hash } from 'lib/auth';
import { Conflict, NotFound, Unauthorized } from 'lib/exception';
import { info, warn } from 'lib/logger';
import { FindOneOptions, repository } from 'lib/repository';
import { AuthUser } from '../auth/auth.service';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { User, userEntity } from './user.entity';

const userRepository = repository(userEntity);

export const findExisting = async <S extends keyof User>(options: FindOneOptions<User, S>): Promise<Pick<User, S>> => {
	const user = await userRepository.findOne(options);

	if (!user) {
		throw NotFound(`user with id '${options.where.id}' was not found`);
	}
	return user;
};

export const findUser = (id: User['id']): Promise<AuthUser> => {
	return findExisting({ select: { id: true, username: true }, where: { id } });
};

export const findUserByCredentials = async (
	username: User['username'],
	password: User['password'],
): Promise<AuthUser> => {
	const user = await userRepository.findOne({
		select: { id: true, username: true },
		where: { username, password: hash(password, 'sha256') },
	});

	if (!user) {
		warn(`user '${username}' provided invalid credentials`);
		throw Unauthorized();
	}

	return user;
};

export const createUser = async (body: SignUpDto): Promise<User> => {
	info('creating new user');

	const existing = await userRepository.findOne({ where: { username: body.username } });

	if (existing) {
		warn(`user with username ${existing.username} already exists`);
		throw Conflict(`user with username ${existing.username} already exists`);
	}

	const { id } = await userRepository.insert({ ...body, password: hash(body.password, 'sha256') });
	return findExisting({ where: { id } });
};
