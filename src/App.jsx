import './App.css';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import SceneInit from './lib/SceneInit';
import { StartGame, GetGameInfo } from './lib/StartGame';
import StartScreen from './pages/startScreen';
import PauseScreen from './pages/pauseScreen';

const App = () => {
	const [loaded, setLoaded] = useState(false);
	const [currentScreen, setCurrentScreen] = useState('start');
	const [sceneInit, setSceneInit] = useState();
	const [gameInfo, setGameInfo] = useState();

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
			setCurrentScreen('pause');
			console.log(GetGameInfo());
			clock.stop();
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

	return (
		<div>
			{/* {loaded && <div>loading</div>} */}
			{currentScreen === 'start' && (
				<StartScreen
					onStart={() => {
						setCurrentScreen(null);
						StartGame(sceneInit);
					}}
				/>
			)}
			{currentScreen === 'pause' && (
				<PauseScreen
					onContinue={() => {
						setCurrentScreen(null);
						StartGame(sceneInit);
					}}
				/>
			)}
			{/* {currentScreen === 'settings' && <StartScreen />} */}
			<canvas id="threejs" />
		</div>
	);
};

export default App;
