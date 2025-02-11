import React, { useState, useMemo, useCallback } from "react";
import dijkstra from "../logic/dijkstra";
import calculateWeight, { calculateWeights } from "../logic/weight";
import Floor from "./Floor";
import VertexForm from "./VertexForm";
import PathDimensions from "./PathDimensions";

export default function MapView({
	floors,
	passages,
	initialStart = 0,
	initialEnd = 0
}) {
	floors = useMemo(() => floors.map(({ edges, vertices, ...floor }) => ({
		vertices: vertices.sort((v1, v2) => v1.id - v2.id),
		edges: edges
			.map(({ from, to, tags }) => ({
				from, to,
				weights: calculateWeights(calculateWeight(
					...[from, to].map(id => vertices.find(v => v.id === id))
				), tags)
			}))
			// Создаем обратные ребра для каждого ребра в графе (т.е. граф неориентированный)
			.flatMap(edge => [
				edge,
				{ from: edge.to, to: edge.from, weights: edge.weights }
			]),
		...floor
	})), [floors]);

	const [
		multifloorVertices,
		multifloorEdges,
		multifloorIdMap
	] = useMemo(() => {
		const vertices = [];
		const edges = [];
		const idMap = [];
		for (const [floorIndex, {
			edges: floorEdges,
			vertices: floorVertices
		}] of floors.entries()) {
			idMap[floorIndex] = {};
			for (const { id } of floorVertices) {
				idMap[floorIndex][id] = vertices.length;
				vertices.push({
					floor: floorIndex,
					floorLocalId: id
				});
			}
			for (const { from, to, ...edge } of floorEdges)
				edges.push({
					from: idMap[floorIndex][from],
					to: idMap[floorIndex][to],
					...edge
				});
		}
		for (const {
			fromFloor, from: localFrom,
			toFloor, to: localTo,
			weight, tags,
			...edge
		} of passages.edges) {
			const weights = calculateWeights(weight, tags);
			for (const [from, to] of [
				[idMap[fromFloor][localFrom], idMap[toFloor][localTo]],
				[idMap[toFloor][localTo], idMap[fromFloor][localFrom]]
			])
				edges.push({ from, to, weights, tags, ...edge });
		}
		return [vertices, edges, idMap];
	}, [floors, passages]);

	const [startFloor, setStartFloor] = useState(0);
	const [endFloor, setEndFloor] = useState(0);
	const [startVertex, setStartVertex] = useState(initialStart);
	const [endVertex, setEndVertex] = useState(initialEnd);
	const [path, setPath] = useState([]);

	const [
		updateStartFloor, updateEndFloor,
		updateStartVertex, updateEndVertex
	] = useMemo(() => [
		setStartFloor, setEndFloor,
		setStartVertex, setEndVertex
	].map(set => value => {
		set(value);
		setPath([]);
	}), []);

	const [dimension, setDimension] = useState('distance');
	const [includeElevators, setIncludeElevators] = useState(true);

	const weightedMultifloorEdges = useMemo(() => multifloorEdges
		.filter(({ tags }) => !tags || (
			includeElevators || !tags.has('elevator')
		))
		.map(({ weights, ...edge }) => ({
			weights,
			weight: weights[dimension],
			...edge
		}))
	, [multifloorEdges, dimension, includeElevators]);

	const findPath = useCallback(() =>
		setPath(dijkstra(
			weightedMultifloorEdges,
			multifloorIdMap[startFloor][startVertex],
			multifloorIdMap[endFloor][endVertex]
		))
	, [
		weightedMultifloorEdges, multifloorIdMap,
		startFloor, startVertex, endFloor, endVertex,
	]);

	const floorPath = useMemo(() => {
		const floorPath = new Array(floors.length).fill().map(() => []);
		if (path.length > 0) {
			const { floor, floorLocalId } = multifloorVertices[path[0].from];
			floorPath[floor].push(floorLocalId);
		}
		for (const { to } of path) {
			const { floor, floorLocalId } = multifloorVertices[to];
			floorPath[floor].push(floorLocalId);
		}
		return floorPath;
	}, [floors, path, multifloorVertices]);

	return (
		<div className="container">
			<div className="wrapper">
				<div className="floors">
					{floors.map((floor, index) =>
						(
							floorPath[index].length > 1
							|| index === startFloor
							|| index === endFloor
						) && <Floor
							key={index}
							startVertex={
								index === startFloor ? startVertex : undefined
							}
							endVertex={
								index === endFloor ? endVertex : undefined
							}
							path={floorPath[index]}
							{...floor}
						/>
					)}
				</div>
				{path.length > 0 && <PathDimensions edges={path} />}
				<VertexForm
					setStartFloor={updateStartFloor}
					setEndFloor={updateEndFloor}
					setStartVertex={updateStartVertex}
					setEndVertex={updateEndVertex}
					{...{
						floors,
						startFloor,
						endFloor,
						startVertex,
						endVertex,
						findPath,
						dimension,
						setDimension,
						includeElevators,
						setIncludeElevators
					}}
				/>
			</div>
		</div>
	);
}