import { cloneDeep } from 'lodash';
import { useEffect } from 'react';

const StartScreen = ({ sceneInit, onStart, onSettings, onHelp }) => {
	useEffect(() => {
		if (sceneInit) {
			sceneInit.camera.lookAt(0, 0, 0);
			if (sceneInit.scene.children.length > 2) {
				sceneInit.scene.children = sceneInit.scene.children.filter(
					(obj) => obj.name != 'target'
				);
			}
		}
	}, []);

	return (
		<div className="flex flex-col justify-center items-center w-screen h-screen absolute bg-black/75">
			<h1 className="text-6xl mb-24 -mt-24">
				AIMTRAINER<span className="text-[5rem] font-bold">3D</span>
			</h1>
			<div className="flex flex-col gap-1 text-4xl">
				<button
					className="bg-transparent p-0 font-semibold hover:opacity-75"
					onClick={onStart}
				>
					START
				</button>
				<button
					className="bg-transparent p-0 font-semibold hover:opacity-75"
					onClick={onSettings}
				>
					SETTINGS
				</button>
				<button
					className="bg-transparent p-0 font-semibold hover:opacity-75"
					onClick={onHelp}
				>
					HELP
				</button>
			</div>
		</div>
	);
};

export default StartScreen;
