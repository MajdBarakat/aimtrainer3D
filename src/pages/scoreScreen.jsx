import { useEffect } from 'react';

const ScoreScreen = ({ score, onInit }) => {
	score = {
		accuracy: 92,
		hits: 12,
		misses: 10,
		whiffs: 1,
	};
	useEffect(() => onInit(), []);
	return (
		<div className="flex flex-col justify-center items-center w-screen h-screen absolute bg-black/75">
			<div className="w-5/6">
				<h1 className="text-7xl -mt-24 font-light">SCORE</h1>
			</div>
			<div className=" flex flex-col text-4xl w-7/12 items-center">
				<h1 className="text-xxl font-semibold line-height-low">{`${score.accuracy}%`}</h1>
				<h1 className="text-6xl mb-10 font-semibold">ACCURACY</h1>
				<h1 className="text-6xl font-semibold">
					{score.hits}X<span className="font-normal"> HITS</span>
				</h1>
				<h1 className="text-6xl font-semibold">
					{score.misses}X<span className="font-normal"> MISSES</span>
				</h1>
				<h1 className="text-6xl font-semibold">
					{score.whiffs}X<span className="font-normal"> WHIFFS</span>
				</h1>
			</div>
			<button className="bg-transparent mt-8 p-0 font-semibold hover:opacity-75">
				MAIN MENU
			</button>
		</div>
	);
};

export default ScoreScreen;
