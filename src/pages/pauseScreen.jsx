const PauseScreen = ({ onContinue, onRestart, onMainMenu }) => {
	return (
		<div className="flex flex-col justify-center items-center w-screen h-screen absolute bg-black/75">
			<h1 className="text-8xl mb-24 -mt-24">PAUSED</h1>
			<div className="flex flex-col gap-1 text-4xl">
				<button
					className="bg-transparent p-0 font-semibold hover:opacity-75"
					onClick={onContinue}
				>
					CONTINUE
				</button>
				<button
					className="bg-transparent p-0 font-semibold hover:opacity-75"
					onClick={onRestart}
				>
					RESTART
				</button>
				{/* <button
					className="bg-transparent p-0 font-semibold hover:opacity-75"
					onClick={onSettings}
				>
					SETTINGS
				</button> */}
				<button
					className="bg-transparent p-0 font-semibold hover:opacity-75"
					onClick={onMainMenu}
				>
					MAIN MENU
				</button>
			</div>
		</div>
	);
};

export default PauseScreen;
