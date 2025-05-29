import React, { useMemo } from "react";
import dimensionValues from "../logic/dimension";

export default function PathDimensions({ edges }) {
	const dimensions = useMemo(() =>
		edges.reduce((dimensions, { weights = {} }) =>
			dimensions.map(([dimension, prevWeight]) => [dimension, prevWeight + (
				weights[dimension] ?? 0
			)])
		, Array.from(dimensionValues).map(dimension => [dimension, 0]))
	, [edges]);

	return <table><tbody>{dimensions.map(([dimension, weight]) =>
		<tr key={dimension}>
			<td>{names[dimension]}</td>
			<td>: {conversions[dimension]?.(weight) ?? weight}</td>
		</tr>
	)}</tbody></table>;
}

const names = {
	distance: 'Расстояние',
	steps: 'Шаги',
	time: 'Время'
};

const conversions = {
    distance: weight => `${Math.round(weight)} м.`,        
    steps: weight => Math.round(weight),                     
    time: weight => `${Math.round(weight)} сек.`             
};