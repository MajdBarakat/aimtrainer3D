import React from 'react';

const HUD = ({ time, countdown }) => {
	const formatDeltaTime = (deltaTimeInSeconds) => {
		const minutes = Math.floor(deltaTimeInSeconds / 60);
		const seconds = Math.floor(deltaTimeInSeconds % 60);

		const formattedMinutes = String(minutes).padStart(1, '0');
		const formattedSeconds = String(seconds % 60).padStart(2, '0');

		return `${formattedMinutes}:${formattedSeconds}`;
	};

	return (
		<React.Fragment>
			<div className="top-hud absolute w-screen flex items-center justify-center mt-4">
				<h1 className="text-7xl font-semibold text-center inline-block">
					{countdown && !time ? '0:00' : formatDeltaTime(time)}
				</h1>
			</div>
			{countdown ? (
				<div className="countdown w-64 h-64 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
					<div className="countdown w-44 h-44 rounded-full flex items-center justify-center">
						<h1 className="text-5xl font-semibold">{countdown}</h1>
					</div>
				</div>
			) : (
				<div className="crosshair">
					<div className="horizontal absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
					<div className="vertical absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
				</div>
			)}
		</React.Fragment>
	);
};

export default HUD;
