import React from 'react';

const HUD = ({ time }) => {
	const formatDeltaTime = (deltaTimeInSeconds) => {
		const totalMilliseconds = deltaTimeInSeconds * 1000;
		const seconds = Math.floor(totalMilliseconds / 1000);
		const milliseconds = totalMilliseconds % 1000;

		const formattedSeconds = String(seconds % 60).padStart(2, '0');
		const formattedMilliseconds = String(milliseconds)
			.padStart(3, '0')
			.substring(0, 2);

		return `${formattedSeconds}:${formattedMilliseconds}`;
	};

	return (
		<React.Fragment>
			<div className="top-hud absolute w-screen flex items-center justify-center mt-4">
				{typeof time === 'string' ? (
					<h1 className="text-7xl text-center">{time}</h1>
				) : (
					<h1 className="text-7xl font-semibold text-center inline-block w-24 -ml-24">
						{formatDeltaTime(time)}
					</h1>
				)}
			</div>
			<div className="crosshair w-1 h-1 rounded-full bg-black absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
		</React.Fragment>
	);
};

export default HUD;
