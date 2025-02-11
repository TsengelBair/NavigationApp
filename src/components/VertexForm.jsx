import { useMemo, useCallback } from "react";
import dimensionValue from "../logic/dimension";

export default function VertexForm({
	floors,
	startFloor,
	setStartFloor,
	endFloor,
	setEndFloor,
	startVertex,
	setStartVertex,
	endVertex,
	setEndVertex,
	findPath,
	dimension,
	setDimension,
	includeElevators,
	setIncludeElevators
}) {
	const floorOptions = useMemo(() => floors.map((_, index) => (
		<option key={index} value={index}>{index + 1}</option>
	)), [floors]);

	const vertexOptionElement = vertex => (
		<option key={vertex.id} value={vertex.id}>
			{vertex.id}
		</option>
	);
	const startFloorVertexOptions = useMemo(() =>
		vertexOptions(floors[startFloor]).map(vertexOptionElement)
	, [floors, startFloor]);
	const endFloorVertexOptions = useMemo(() =>
		vertexOptions(floors[endFloor]).map(vertexOptionElement)
	, [floors, endFloor]);

	const selectStartFloor = useCallback(event => {
		setStartFloor(parseInt(event.target.value));
		setStartVertex(0);
	}, [setStartFloor, setStartVertex]);
	const selectEndFloor = useCallback(event => {
		setEndFloor(parseInt(event.target.value));
		setEndVertex(0);
	}, [setEndFloor, setEndVertex]);
	const selectDimension = useCallback(event =>
		setDimension(event.target.value)
	, [setDimension]);
	const toggleIncludeElevators = useCallback(() =>
		setIncludeElevators(include => !include)
	, [setIncludeElevators]);

	return (
		<div className="form">
			<h3 className="formLabel">Выберите стартовую и конечную точку</h3>
			<label htmlFor="startVertex" className="label">Стартовая точка:</label>
			<select
				className="input"
				id="startVertex"
				value={startVertex}
				onChange={useCallback(event =>
					setStartVertex(parseInt(event.target.value))
				, [setStartVertex])}
			>{startFloorVertexOptions}</select>
			<label htmlFor="startFloor" className="label">Этаж:</label>
			<select
				className="input"
				id="startFloor"
				value={startFloor}
				onChange={selectStartFloor}
			>{floorOptions}</select>
			<br />
			<label htmlFor="endVertex" className="label">Конечная точка:</label>
			<select
				className="input"
				id="endVertex"
				value={endVertex}
				onChange={useCallback(event =>
					setEndVertex(parseInt(event.target.value))
				, [setEndVertex])}
			>{endFloorVertexOptions}</select>
			<label htmlFor="endFloor" className="label">Этаж:</label>
			<select
				className="input"
				id="endFloor"
				value={endFloor}
				onChange={selectEndFloor}
			>{floorOptions}</select>
			<br />
			<label htmlFor="dimension" className="label">По наименьшему:</label>
			<select
				className="textInput"
				id="dimension"
				value={dimension}
				onChange={selectDimension}
			>
				{Array.from(dimensionValue).map(dimension =>
					<option key={dimension} value={dimension}>
						{selectDimensionNames[dimension]}
					</option>
				)}
			</select>
			<br />
			<input
				type="checkbox"
				id="includeElevators"
				checked={includeElevators}
				onChange={toggleIncludeElevators}
			/>
			<label htmlFor="includeElevators" className="label">
				Использовать лифты
			</label>
			<br />
			<button className="formButton" onClick={findPath}>Найти</button>
		</div>
	);
}

const vertexOptions = ({ vertices, excludedVertexIds }) => vertices
	.filter(vertex => !excludedVertexIds.has(vertex.id));

const selectDimensionNames = {
	distance: 'Расстоянию',
	steps: 'Количеству шагов',
	time: 'Времени'
};