import { useEffect } from 'react';

const ScoreScreen = ({ score, onInit }) => {
	useEffect(() => onInit(), []);
	return (
		<div className="flex flex-col justify-center items-center w-screen h-screen absolute bg-black/75">
			<h1 className="text-8xl mb-24 -mt-24">SCORE</h1>
			<h1 className="text-8xl mb-24 -mt-24">{`${score.accuracy}%`}</h1>
			<h1 className="text-8xl mb-24 -mt-24">ACCURACY</h1>
			<h1 className="text-8xl mb-24 -mt-24">{`${score.hits}X HITS`}</h1>
			<h1 className="text-8xl mb-24 -mt-24">{`${score.misses}X MISSES`}</h1>
			<h1 className="text-8xl mb-24 -mt-24">{`${score.whiffs}X WHIFFS`}</h1>

			<div className="flex flex-col gap-1 text-4xl">
				<button className="bg-transparent p-0 font-semibold hover:opacity-75">
					MAIN MENU
				</button>
			</div>
		</div>
	);
};

export default ScoreScreen;
