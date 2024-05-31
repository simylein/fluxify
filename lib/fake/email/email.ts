export const data = [
	'beach-music-8e@icloud.com book-guitar-0z@gmail.com car-dolphin-9j@proton.gov',
	'cloud-shadow-2n@hotmail.com dragon-rain-7x@icloud.com fish-galaxy-5r@gmail.com',
	'ice-forest-3p@proton.gov jazz-lion-4l@alpine.net kite-planet-2b@gmail.com',
	'lamp-safari-4m@hotmail.com leaf-bison-0t@icloud.com moon-tiger-6f@gmail.com',
	'panda-mirror-3w@proton.gov pizza-robot-1q@alpine.net plane-falcon-8y@icloud.com',
	'river-dance-7v@gmail.com ship-apple-2k@hotmail.com snow-rocket-1s@proton.gov',
	'star-matrix-3d@alpine.net sun-whale-6g@icloud.com train-window-9x@gmail.com',
	'tree-chess-7h@icloud.com wave-polaris-9d@proton.gov wind-fox-5c@hotmail.com',
]
	.map((frag) => frag.split(' '))
	.flat();

export const email = (): string => {
	return data[Math.floor(Math.random() * data.length)];
};

export const emails = (amount: number): string[] => {
	const result = new Array(amount);
	for (let index = 0; index < amount; index++) {
		result[index] = data[Math.floor(Math.random() * data.length)];
	}
	return result;
};
