import React from 'react';

const HUD = ({ time }) => {
	return (
		<React.Fragment>
			<div className="top-hud absolute w-screen flex items-center justify-center">
				<h1 className="text-8xl">{time}</h1>
			</div>
			<div className="crosshair w-1 h-1 rounded-full bg-black absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
		</React.Fragment>
	);
};

export default HUD;
