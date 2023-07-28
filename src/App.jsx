import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import SceneInit from './lib/SceneInit';
import StartGame from './lib/StartGame';
import StartScreen from './pages/startScreen';
import PauseScreen from './pages/pauseScreen';
import cloneDeep from 'lodash/cloneDeep';
import HUD from './pages/hud';

const App = () => {
	const [loaded, setLoaded] = useState(false);
	const [currentScreen, setCurrentScreen] = useState('start');
	const [sceneInit, setSceneInit] = useState();
	const [gameInfo, setGameInfo] = useState({
		started: true,
		spawning: true,
		targetsLeft: 0,
		nextSpawn: 0,
		lastRecordedElapsedTime: 0,
		timeLeft: 0,
		score: { hits: 0, misses: 0, whiffs: 0, accuracy: null },
	});
	const [time, setTime] = useState();

	let init;

	useEffect(() => {
		init = new SceneInit('threejs');
		init.initialize();
		init.animate();
		setSceneInit(init);

		const { scene, camera, canvas, clock } = init;

		clock.stop();
		//controls
		const controls = new PointerLockControls(camera, canvas);

		canvas.addEventListener('click', () => {
			controls.lock();
		});

		controls.addEventListener('lock', () => {});

		controls.addEventListener('unlock', () => {
			setGameInfo((freshState) => {
				const gameInfoClone = cloneDeep(freshState);
				gameInfoClone.started = false;
				gameInfoClone.lastRecordedElapsedTime = clock.getElapsedTime();
				return gameInfoClone;
			});
			clock.stop();
			setCurrentScreen('pause');
		});

		//textures
		const loadingManager = new THREE.LoadingManager();
		const textureLoader = new THREE.TextureLoader(loadingManager);
		const grid = textureLoader.load('src/assets/grid.png');
		grid.minFilter = THREE.LinearFilter;

		// loadingManager.onLoad = () => setLoaded(true);

		//environment
		const environment = new THREE.Group();
		scene.add(environment);

		const map = new THREE.Mesh(
			new THREE.BoxGeometry(20, 20, 20),
			new THREE.MeshBasicMaterial({
				map: grid,
				side: THREE.DoubleSide,
				// depthTest: false
			})
		);
		map.geometry.computeBoundingBox();
		environment.add(map);

		const floor = new THREE.Mesh(
			new THREE.PlaneGeometry(20, 20),
			new THREE.MeshBasicMaterial({
				map: grid,
				// depthTest: false
			})
		);
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -2;
		environment.add(floor);
	}, []);

	const countdown = () => {
		return new Promise((resolve) => {
			let seconds = 3;
			console.log(seconds);
			const timer = setInterval(() => {
				seconds--;
				console.log(seconds);
				if (seconds === 0) {
					clearInterval(timer);
					resolve('resolved');
				}
			}, 1000);
		});
	};

	return (
		<div>
			{/* {loaded && <div>loading</div>} */}
			{currentScreen === null && <HUD time={time}></HUD>}
			{currentScreen === 'start' && (
				<StartScreen
					onStart={async () => {
						setCurrentScreen(null);
						// await countdown();
						StartGame(
							sceneInit,
							gameInfo,
							setGameInfo,
							setTime,
							setCurrentScreen
						);
					}}
				/>
			)}
			{currentScreen === 'pause' && (
				<PauseScreen
					onContinue={async () => {
						setCurrentScreen(null);
						await countdown();
						const gameInfoClone = cloneDeep(gameInfo);
						gameInfo.started = true;
						setGameInfo(gameInfoClone);
						StartGame(
							sceneInit,
							gameInfo,
							setGameInfo,
							setTime,
							setCurrentScreen
						);
					}}
				/>
			)}
			{/* {currentScreen === 'settings' && <StartScreen />} */}
			<canvas id="threejs" />
		</div>
	);
};

export default App;
