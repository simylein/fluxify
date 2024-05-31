export const data = [
	'slate gray zinc neutral stone red orange amber',
	'yellow lime green emerald teal cyan sky blue',
	'indigo violet purple fuchsia pink rose',
]
	.map((frag) => frag.split(' '))
	.flat();

export const color = (): string => {
	return data[Math.floor(Math.random() * data.length)];
};

export const colors = (amount: number): string[] => {
	const result = new Array(amount);
	for (let index = 0; index < amount; index++) {
		result[index] = data[Math.floor(Math.random() * data.length)];
	}
	return result;
};
