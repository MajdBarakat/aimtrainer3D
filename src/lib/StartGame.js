import * as THREE from 'three';

const params = {
	// start: startGame,
	gameDuration: 5,
	spawnRate: 2,
	despawnRate: 0.5,
	rangeX: 10,
	rangeY: 10,
	rangeZ: 10,
};

let started = true;
let currentIntersect = null;
let objects = [];
let despawnStack = [];

let hits = 0;
let misses = 0;
let whiffs = 0;
let accuracy = null;

let targetsLeft = Math.floor(params.gameDuration * params.spawnRate);
let spawnInterval = params.gameDuration / targetsLeft;
let nextSpawn = params.gameDuration;

let lastRecordedElapsedTime = 0;
let elapsedTime = 0;

let isGameRunning = true;

const StartGame = (init, pausedGameInfo) => {
	const { scene, camera, canvas, clock } = init;

	lastRecordedElapsedTime = pausedGameInfo?.lastElapsedTime || 0;
	console.log(lastRecordedElapsedTime);

	clock.start();
	//game;

	//raycaster
	const raycaster = new THREE.Raycaster();

	//shooting mechanic
	canvas.addEventListener('click', (e) => {
		if (currentIntersect) {
			scene.remove(currentIntersect.object);
			objects.splice(
				objects.findIndex(
					(obj) => obj.uuid == currentIntersect.object.uuid
				),
				1
			);
			hits++;
		} else if (started && !currentIntersect) whiffs++;
	});

	//animate
	const tick = () => {
		elapsedTime = clock.getElapsedTime() + lastRecordedElapsedTime;
		const timeLeft = (params.gameDuration - elapsedTime).toFixed(2);

		const cameraPosition = new THREE.Vector3();
		const cameraDirection = new THREE.Vector3();
		camera.getWorldPosition(cameraPosition);
		camera.getWorldDirection(cameraDirection);

		raycaster.set(cameraPosition, cameraDirection);

		// timer.innerHTML = `${timeLeft}`;

		console.log(
			timeLeft,
			nextSpawn.toFixed(2),
			started,
			spawnInterval,
			targetsLeft,
			despawnStack[0]?.despawnTime
		);

		//spawn ball
		if (started && timeLeft <= nextSpawn.toFixed(2)) {
			nextSpawn = timeLeft - spawnInterval;
			const object = new THREE.Mesh(
				new THREE.SphereGeometry(0.5, 16, 16),
				new THREE.MeshBasicMaterial({ color: '#ff0000' })
			);

			object.position.x = (Math.random() - 0.5) * params.rangeX;
			object.position.y = Math.random() * (params.rangeY / 2);
			object.position.z = -Math.random() * (params.rangeZ / 2);

			scene.add(object);
			objects.push(object);

			const despawnTime = timeLeft - 1 / params.despawnRate;
			const despawnObj = {
				uuid: object.uuid,
				despawnTime,
			};
			despawnStack.push(despawnObj);

			targetsLeft--;
		}

		// despawn ball
		if (despawnStack.length && timeLeft <= despawnStack[0].despawnTime) {
			const { uuid } = despawnStack[0];
			const index = objects.findIndex((obj) => obj.uuid == uuid);
			if (index > -1) {
				scene.remove(objects[index]);
				objects.splice(index, 1);
				misses++;
			}
			despawnStack.shift();
		}

		//end of game
		if (accuracy === null && timeLeft <= 0 - 1 / params.despawnRate) {
			// if (timeLeft <= 0) timer.innerHTML = '0.00';
			clock.stop();
			accuracy = (hits / (hits + whiffs + misses)) * 100;
			objects?.forEach((obj) => scene.remove(obj));
			console.log('game over!');
			console.log(`You've hit ${hits} Targets!`);
			console.log(`You've missed ${misses} Targets!`);
			console.log(`You've whiffed ${whiffs} Times!`);
			console.log(`WOW you have an accuracy of ${accuracy}%!`);
			return hits, misses, whiffs;
		}

		if (targetsLeft === 0 && started) started = false;

		const intersects = raycaster.intersectObjects(objects);

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

		objects.forEach((obj) => obj.material.color.set(0xff0000));
		intersects.forEach((obj) => obj.object.material.color.set(0x00ff00));

		// Call tick again on the next frame
		window.requestAnimationFrame(tick);
	};

	if (isGameRunning) tick();
};

const GetGameInfo = () => {
	const lastElapsedTime = elapsedTime;
	isGameRunning = false;
	return {
		objects,
		despawnStack,
		hits,
		misses,
		whiffs,
		accuracy,
		targetsLeft,
		spawnInterval,
		nextSpawn,
		lastElapsedTime,
	};
};

export { StartGame, GetGameInfo };
