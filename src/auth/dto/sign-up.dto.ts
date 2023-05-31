import { Infer, object, string } from 'lib/validation';

export const signUpDto = object({
	username: string().min(2).max(16),
	password: string().min(8).max(64),
});

export type SignUpDto = Infer<typeof signUpDto>;
