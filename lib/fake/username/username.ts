export const data = [
	'albert alice bob betty charlie cassandra dave daniela',
	'edward elena felix fiona greg gwendolyn hector hannah',
	'isaac ivy jeff judy keanu kim linus lea',
	'mike marie nick nora oscar ophelia percy patricia',
	'quentin quinn robert rey scotty selena tim thalia',
	'uriel ursula victor veronica will wendy xavier xenia',
	'yuri yasmin zion zoe',
]
	.map((frag) => frag.split(' '))
	.flat();

export const username = (): string => {
	return data[Math.floor(Math.random() * data.length)];
};

export const usernames = (amount: number): string[] => {
	const result = new Array(amount);
	for (let index = 0; index < amount; index++) {
		result[index] = data[Math.floor(Math.random() * data.length)];
	}
	return result;
};
