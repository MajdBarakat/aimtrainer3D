import './App.css';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import SceneInit from './lib/SceneInit';
import StartGame from './lib/StartGame';
import StartScreen from './pages/startScreen';

const App = () => {
	const [loaded, setLoaded] = useState(false);
	const [currentScreen, setCurrentScreen] = useState('start');

	let init;

	useEffect(() => {
		init = new SceneInit('threejs');
		init.initialize();
		init.animate();

		const { scene, camera, canvas, clock } = init;

		clock.stop();
		//controls
		const controls = new PointerLockControls(camera, canvas);

		canvas.addEventListener('click', function () {
			controls.lock();
			// console.log('locked');
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
						StartGame(init);
					}}
				/>
			)}
			{/* {currentScreen === 'settings' && <StartScreen />} */}
			<canvas id="threejs" />
		</div>
	);
};

export default App;
