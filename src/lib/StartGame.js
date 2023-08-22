import * as THREE from 'three';
import cloneDeep from 'lodash/cloneDeep';
import config from '../config/config.json';

const getValue = (name) => {
	const setting = window.localStorage.getItem(name);
	return setting ? JSON.parse(setting).value : setting;
};

//game variables
let currentIntersect = null;
let elapsedTime = 0;
let objects = [];
let despawnStack = [];
let intersects = [];
let grid;
let lastCell = {};

const StartGame = (
	init,
	gameInfo,
	setGameInfo,
	setTime,
	setCurrentScreen,
	test = false
) => {
	const initParams = () => {
		const params = {};
		config.settingsFormat.forEach(
			(setting) =>
				(params[setting.id] =
					getValue(setting.id) ||
					config.settingsDefaultValues[setting.id])
		);
		return params;
	};

	const params = initParams();

	const spawnInterval =
		params.gameDuration /
		Math.floor(params.gameDuration * params.spawnRate);

	const { scene, camera, canvas, clock } = init;

	const updateObjects = () => {
		objects = [];
		scene.children.forEach((obj) => {
			if (obj.name === 'target') objects.push(obj);
		});
	};

	gameInfo.started = true;

	const spawnBall = () => {
		const object = new THREE.Mesh(
			new THREE.SphereGeometry(params.targetRadius, 16, 16),
			new THREE.MeshBasicMaterial({ color: '#ff0000' })
		);

		if (params.gameMode === 'gridShot') {
			let cellFound = false;
			let posX;
			let posY;
			while (!cellFound) {
				const randomX = Math.floor(Math.random() * params.gridX);
				const randomY = Math.floor(Math.random() * params.gridY);
				const cell = grid[randomX][randomY];
				if (
					!cell.targetId &&
					randomX !== lastCell.x &&
					randomY !== lastCell.y
				) {
					cell.targetId = object.id;
					cellFound = true;
					posX = cell.x;
					posY = cell.y;
				}
			}
			object.position.x = posX;
			object.position.y = posY;
			object.position.z = 2 - params.gridOffsetZ;
		} else {
			object.position.x = (Math.random() - 0.5) * params.spreadX;

			object.position.y = Math.random() * (params.spreadY / 2);
			object.position.z = 2 - Math.random() * (params.spreadZ / 2);
		}

		object.name = 'target';

		scene.add(object);
		updateObjects();
		setDespawnTime(object);
		gameInfo.targetsLeft--;
	};

	const setDespawnTime = (object) => {
		const despawnTime = gameInfo.timeLeft - 1 / params.despawnRate;
		const despawnObj = {
			uuid: object.uuid,
			despawnTime,
		};
		despawnStack.push(despawnObj);
	};

	const despawnBall = () => {
		const { uuid } = despawnStack[0];
		const index = scene.children.findIndex((obj) => obj.uuid == uuid);
		if (index > -1) {
			scene.remove(scene.children[index]);
			updateObjects();
			gameInfo.score.misses++;
		}
		despawnStack.shift();
	};

	const resetGame = () => {
		scene.children = scene.children.filter((obj) => obj.name != 'target');
		despawnStack = [];
		grid = null;
		lastCell = {};
		camera.lookAt(0, 0, 0);
		updateObjects();
	};

	const getScore = () => {
		gameInfo.score.accuracy = Math.floor(
			(gameInfo.score.hits /
				(gameInfo.score.hits +
					gameInfo.score.whiffs +
					gameInfo.score.misses)) *
				100
		);
		setGameInfo(gameInfo);
		setCurrentScreen('score');
	};

	const endGame = () => {
		clock.stop();
		resetGame();
		gameInfo.started = false;
		getScore();
	};

	const speedTestGame = () => {
		if (
			clock.running &&
			gameInfo.spawning &&
			gameInfo.timeLeft < gameInfo.nextSpawn
		) {
			spawnBall();
			gameInfo.nextSpawn = parseFloat(
				gameInfo.timeLeft - spawnInterval.toFixed(2)
			);
		}

		if (
			despawnStack.length &&
			gameInfo.timeLeft <= despawnStack[0].despawnTime
		)
			despawnBall();

		if (
			gameInfo.score.accuracy === null &&
			((gameInfo.targetsLeft === 0 && gameInfo.timeLeft <= 0) ||
				gameInfo.timeLeft <= 0 - 1 / params.despawnRate)
		)
			endGame();

		if (gameInfo.targetsLeft === 0 && gameInfo.started) {
			gameInfo.spawning = false;
		}
	};

	const initGrid = () => {
		grid = [];
		const radiusAndPaddingMultiplier =
			params.targetRadius * 2 + params.gridPadding;
		const midPointX = (params.gridX - 1) / 2;
		for (let x = 0; x < params.gridX; x++) {
			grid[x] = [];
			for (let y = 0; y < params.gridY; y++) {
				grid[x][y] = {
					x: (x - midPointX) * radiusAndPaddingMultiplier,
					y: y * radiusAndPaddingMultiplier,
					targetId: '',
				};
			}
		}
	};

	const gridShotGame = () => {
		if (!grid) initGrid();

		if (
			parseFloat(gameInfo.timeLeft) > 0 &&
			objects.length < params.targetCount
		)
			// add custom value for how many balls allowed at a time
			spawnBall();

		if (gameInfo.score.accuracy === null && gameInfo.timeLeft <= 0)
			endGame();
	};

	//raycaster
	const raycaster = new THREE.Raycaster();

	//shooting mechanic
	canvas.addEventListener('click', (e) => {
		if (gameInfo.started && currentIntersect) {
			scene.remove(currentIntersect.object);
			if (params.gameMode === 'gridShot') {
				for (let x = 0; x < grid.length; x++) {
					for (let y = 0; y < grid[x].length; y++) {
						if (
							grid[x][y].targetId === currentIntersect.object.id
						) {
							grid[x][y].targetId = '';
							lastCell.x = x;
							lastCell.y = y;
						}
					}
				}
			}
			updateObjects();
			gameInfo.score.hits++;
		} else if (gameInfo.started && !currentIntersect)
			gameInfo.score.whiffs++;
	});

	gameInfo.targetsLeft =
		gameInfo.targetsLeft ||
		Math.floor(params.gameDuration * params.spawnRate);

	gameInfo.nextSpawn = gameInfo.nextSpawn || params.gameDuration;

	const objectDetection = () => {
		const cameraDirection = new THREE.Vector3();
		const cameraPosition = new THREE.Vector3();
		camera.getWorldDirection(cameraDirection);
		camera.getWorldPosition(cameraPosition);

		raycaster.set(cameraPosition, cameraDirection);

		intersects = raycaster.intersectObjects(objects);

		if (intersects.length) {
			if (!currentIntersect) {
				// console.log('entered')
			}
			currentIntersect = intersects[0];
		} else {
			if (currentIntersect) {
				// console.log('exited')
				currentIntersect = null;
			}
		}
	};

	clock.start();

	//game
	const tick = () => {
		elapsedTime = clock.getElapsedTime() + gameInfo.lastRecordedElapsedTime;

		if (elapsedTime === 0) updateObjects();

		gameInfo.timeLeft = parseFloat(
			(params.gameDuration - elapsedTime).toFixed(2)
		);

		//speedTest Game Mode
		if (params.gameMode === 'speedTest') speedTestGame();
		//gridShot Game Mode
		else if (params.gameMode === 'gridShot') gridShotGame();

		//object detection
		objectDetection();

		//set hover color
		objects.forEach((obj) => obj.material.color.set(0xff0000));
		intersects.forEach((obj) => obj.object.material.color.set(0x00ff00));

		//update data
		setTime(gameInfo.timeLeft > 0 ? parseFloat(gameInfo.timeLeft) : 0);

		// Call tick again on the next frame
		if (clock.running) {
			setGameInfo(gameInfo);
			window.requestAnimationFrame(tick);
		}
	};

	tick();
};

export default StartGame;
