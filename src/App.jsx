import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import SceneInit from './lib/SceneInit';
import StartGame from './lib/StartGame';
import StartScreen from './pages/startScreen';
import PauseScreen from './pages/pauseScreen';
import cloneDeep from 'lodash/cloneDeep';
import HUD from './pages/hud';
import SettingsScreen from './pages/settingsScreen';
import ScoreScreen from './pages/scoreScreen';

const App = () => {
	const [loaded, setLoaded] = useState(false);
	const [currentScreen, setCurrentScreen] = useState('start');
	const [sceneInit, setSceneInit] = useState();
	const [gameInfo, setGameInfo] = useState();
	const [time, setTime] = useState();
	const [controls, setControls] = useState();

	useEffect(() => {
		const init = new SceneInit('threejs');
		init.initialize();
		init.animate();
		setSceneInit(init);

		setGameInfo(initGameInfo());

		const { scene, camera, canvas, clock } = init;

		clock.stop();
		//controls
		const localControls = new PointerLockControls(camera, canvas);
		setControls(localControls);

		canvas.addEventListener('click', () => {
			localControls.lock();
		});

		localControls.addEventListener('lock', () => {});

		localControls.addEventListener('unlock', () => {
			setGameInfo((freshState) => {
				const gameInfoClone = cloneDeep(freshState);
				if (gameInfoClone.started) {
					gameInfoClone.started = false;
					gameInfoClone.lastRecordedElapsedTime +=
						clock.getElapsedTime();
					clock.stop();
					setCurrentScreen('pause');
				}
				return gameInfoClone;
			});
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

	function initGameInfo() {
		const newGameInfo = {
			started: false,
			spawning: true,
			targetsLeft: 0,
			nextSpawn: 0,
			lastRecordedElapsedTime: 0,
			timeLeft: 0,
			score: { hits: 0, misses: 0, whiffs: 0, accuracy: null },
		};
		return newGameInfo;
	}

	const countdown = () => {
		return new Promise((resolve) => {
			let seconds = 3;
			setTime(`Starting in.. ${seconds}`);
			const timer = setInterval(() => {
				seconds--;
				setTime(`Starting in.. ${seconds}`);
				if (seconds === 0) {
					clearInterval(timer);
					resolve('resolved');
				}
			}, 1000);
		});
	};

	const handleStart = async (isContinuing) => {
		setCurrentScreen(null);
		// await countdown();
		if (isContinuing) {
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
		} else
			StartGame(
				sceneInit,
				initGameInfo(),
				setGameInfo,
				setTime,
				setCurrentScreen
			);
	};

	return (
		<div>
			{/* {loaded && <div>loading</div>} */}
			{currentScreen === null && <HUD time={time}></HUD>}
			{currentScreen === 'settings' && (
				<SettingsScreen onLeave={() => setCurrentScreen('start')} />
			)}
			{currentScreen === 'score' && (
				<ScoreScreen
					score={gameInfo.score}
					onInit={() => controls.unlock()}
				/>
			)}
			{currentScreen === 'start' && (
				<StartScreen
					onStart={async () => await handleStart()}
					onSettings={() => setCurrentScreen('settings')}
				/>
			)}
			{currentScreen === 'pause' && (
				<PauseScreen
					onContinue={async () => await handleStart(true)}
					onRestart={async () => await handleStart()}
					onMainMenu={() => setCurrentScreen('start')}
				/>
			)}
			<canvas id="threejs" />
		</div>
	);
};

export default App;
