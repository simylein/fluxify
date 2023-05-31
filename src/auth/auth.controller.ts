import { jwtDto } from 'lib/auth';
import { router } from 'lib/router';
import { findMe, signIn, signUp } from './auth.service';
import { signInDto } from './dto/sign-in.dto';
import { signUpDto } from './dto/sign-up.dto';

const app = router('/auth');

app.get('/me', { jwt: jwtDto }, ({ jwt }) => {
	return findMe(jwt.id);
});

app.post('/sign-in', { body: signInDto }, ({ body }) => {
	return signIn(body);
});

app.post('/sign-up', { body: signUpDto }, ({ body }) => {
	return signUp(body);
});
