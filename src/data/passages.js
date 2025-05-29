export default {

	edges: [
		[[0, 1], [1, 1], 5, ['elevator']],
		[[0, 11], [1, 11], 10, ['ladder']],
		[[0, 12], [1, 13], 10, ['ladder']],
		[[1, 1], [2, 1], 5, ['elevator']],
		[[1, 12], [2, 11], 10, ['ladder']],
		[[2, 1], [3, 1], 5, ['elevator']],
		[[2, 12], [3, 11], 10, ['ladder']],
		[[2, 13], [3, 12], 10, ['ladder']],
		[[2, 14], [3, 13], 10, ['ladder']],
	].map(([[fromFloor, from], [toFloor, to], weight, tags = []]) => ({
		fromFloor, from, toFloor, to, weight,
		tags: new Set(tags)
	})),
	
};