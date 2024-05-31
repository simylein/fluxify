export const data = [
	'awesome bespoke electronic elegant ergonomic fantastic generic gorgeous',
	'handcrafted handmade incredible intelligent licensed luxurious modern oriental',
	'practical recycled refined rustic sleek small tasty unbranded',
]
	.map((frag) => frag.split(' '))
	.flat();

export const adjective = (): string => {
	return data[Math.floor(Math.random() * data.length)];
};

export const adjectives = (amount: number): string[] => {
	const result = new Array(amount);
	for (let index = 0; index < amount; index++) {
		result[index] = data[Math.floor(Math.random() * data.length)];
	}
	return result;
};
