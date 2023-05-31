import { signJwt } from 'lib/auth';
import { Unauthorized } from 'lib/exception';
import { info, mask, warn } from 'lib/logger';
import { User } from '../user/user.entity';
import { createUser, findExisting, findUser, findUserByCredentials } from '../user/user.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

export type AuthUser = Pick<User, 'id' | 'username'>;

export const findMe = (id: User['id']): Promise<AuthUser> => {
	info(`finding user with id '${mask(id)}'`);

	return findUser(id);
};

export const signIn = async (body: SignInDto): Promise<{ token: string }> => {
	const user = await findUserByCredentials(body.username, body.password);
	if (!user) {
		warn(`user '${body.username}' provided invalid credentials`);
		throw Unauthorized();
	}

	info(`user with username '${body.username}' signed in`);

	return { token: signJwt({ id: user.id }) };
};

export const signUp = async (body: SignUpDto): Promise<AuthUser> => {
	info(`user with username '${body.username}' signed up`);

	const { id } = await createUser(body);
	return findExisting({ select: { id: true, username: true }, where: { id } });
};
