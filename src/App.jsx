import './App.css';
import MapView from './components/MapView';
import floor0 from './data/0.js';
import floor0Image from './data/0.svg';
import floor1 from './data/1.js';
import floor1Image from './data/1.svg';
import floor2 from './data/2.js';
import floor2Image from './data/2.svg';
import floor3 from './data/3.js';
import floor3Image from './data/3.svg';
import passages from './data/passages.js';

export default function App() {
	return (
		<div className="App">
			<MapView
				floors={[
					{mapImage: floor0Image, ...floor0},
					{mapImage: floor1Image, ...floor1},
					{mapImage: floor2Image, ...floor2},
					{mapImage: floor3Image, ...floor3},
				]}
				passages={passages}
				initialStart={113}
				initialEnd={177}
			/>
		</div>
	);
}