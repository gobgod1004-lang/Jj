import * as THREE from 'three';
import { DifficultyLevel } from '../types';
import { DIFFICULTY_CONFIGS } from '../data/difficulties';

export type ObstacleKind = 'hurdle' | 'tall_block' | 'traffic_cones';

export interface ObstacleInstance {
  group: THREE.Group;
  kind: ObstacleKind;
  jumpable: boolean;
  box: THREE.Box3;
  width: number;
  height: number;
  depth: number;
  z: number;
  x: number;
  cleared?: boolean;
}

export interface GoldInstance {
  mesh: THREE.Mesh;
  box: THREE.Box3;
  z: number;
  collected: boolean;
  isHigh: boolean;
}

export class WorldManager {
  public scene: THREE.Scene;
  public obstacles: ObstacleInstance[] = [];
  public goldItems: GoldInstance[] = [];
  public trackPlates: THREE.Group[] = [];
  public roadsideItems: THREE.Group[] = [];
  public particles!: THREE.Points;

  // Distant Background Panorama Scenery (Mountains, Windmills, Hills, Balloons, Clouds)
  public mountainGroups: THREE.Group[] = [];
  public windmillRotors: THREE.Mesh[] = [];
  public hotAirBalloons: THREE.Group[] = [];
  public skyClouds: THREE.Group[] = [];

  private particlePositions!: Float32Array;
  private particleVelocities!: Float32Array;
  private particleLifespans!: Float32Array;
  private maxParticles = 250;

  // Materials with vibrant, cheerful, high-visibility colors
  private roadMaterial: THREE.MeshStandardMaterial;
  private grassMaterial: THREE.MeshStandardMaterial;
  private outerTerrainMaterial: THREE.MeshStandardMaterial;
  private mountainMaterial1: THREE.MeshStandardMaterial;
  private mountainMaterial2: THREE.MeshStandardMaterial;
  private snowCapMaterial: THREE.MeshStandardMaterial;
  private curbMaterial: THREE.MeshStandardMaterial;
  private stripeMaterial: THREE.MeshBasicMaterial;
  private goldMaterial: THREE.MeshStandardMaterial;
  private hurdleMaterial: THREE.MeshStandardMaterial;
  private tallBlockMaterial: THREE.MeshStandardMaterial;
  private cloudMaterial: THREE.MeshStandardMaterial;
  private treeTrunkMaterial: THREE.MeshStandardMaterial;
  private treeLeavesMaterial1: THREE.MeshStandardMaterial;
  private treeLeavesMaterial2: THREE.MeshStandardMaterial;
  private windmillPoleMaterial: THREE.MeshStandardMaterial;
  private windmillBladeMaterial: THREE.MeshStandardMaterial;
  private flowerMat1: THREE.MeshStandardMaterial;
  private flowerMat2: THREE.MeshStandardMaterial;
  private flowerMat3: THREE.MeshStandardMaterial;
  private stripeTexture: THREE.CanvasTexture;

  private trackWidth = 8.4;
  private plateLength = 80;
  private totalPlates = 4;
  private lastObstacleZ = 20;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Create striped canvas texture for obstacles (bright candy stripe)
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    for (let i = -128; i < 256; i += 32) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 32, 128);
      ctx.lineTo(i + 16, 128);
      ctx.lineTo(i - 16, 0);
      ctx.fill();
    }
    this.stripeTexture = new THREE.CanvasTexture(canvas);
    this.stripeTexture.wrapS = THREE.RepeatWrapping;
    this.stripeTexture.wrapT = THREE.RepeatWrapping;

    // Materials
    this.roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155, // Clean slate road
      roughness: 0.55,
    });

    this.grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x4ade80, // Lush bright vibrant grass
      roughness: 0.75,
    });

    this.outerTerrainMaterial = new THREE.MeshStandardMaterial({
      color: 0x86efac, // Rolling green meadow hill
      roughness: 0.9,
    });

    // Beautiful majestic mountains in background
    this.mountainMaterial1 = new THREE.MeshStandardMaterial({
      color: 0x60a5fa, // Distant bright cerulean mountain
      roughness: 0.85,
    });

    this.mountainMaterial2 = new THREE.MeshStandardMaterial({
      color: 0x818cf8, // Indigo-blue mountain range
      roughness: 0.85,
    });

    this.snowCapMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
    });

    this.curbMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Sky cyan glowing curb
      roughness: 0.3,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
    });

    this.stripeMaterial = new THREE.MeshBasicMaterial({
      color: 0xfef08a, // Soft bright yellow
    });

    this.goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.4,
    });

    this.hurdleMaterial = new THREE.MeshStandardMaterial({
      map: this.stripeTexture,
      roughness: 0.3,
    });

    this.tallBlockMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, // Vibrant purple obstacle
      roughness: 0.5,
    });

    this.cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      transparent: true,
      opacity: 0.92,
    });

    this.treeTrunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.7,
    });

    this.treeLeavesMaterial1 = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.4,
    });

    this.treeLeavesMaterial2 = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.4,
    });

    this.windmillPoleMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
    });

    this.windmillBladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
    });

    this.flowerMat1 = new THREE.MeshStandardMaterial({ color: 0xf43f5e });
    this.flowerMat2 = new THREE.MeshStandardMaterial({ color: 0xeab308 });
    this.flowerMat3 = new THREE.MeshStandardMaterial({ color: 0xec4899 });

    this.initTrack();
    this.initDistantScenery();
    this.initClouds();
    this.initParticles();
  }

  // Beautiful distant mountain ridges and windmills on left & right
  private initDistantScenery() {
    const mountainZSteps = [-100, -20, 60, 140, 220, 300, 380];

    mountainZSteps.forEach((z, i) => {
      // Left Mountain Range
      const mLeft = this.createMountain(i % 2 === 0 ? 32 : 45, i % 2 === 0 ? 24 : 32, i % 2 === 0);
      mLeft.position.set(-65 - (i % 3) * 15, 0, z);
      this.scene.add(mLeft);
      this.mountainGroups.push(mLeft);

      // Right Mountain Range
      const mRight = this.createMountain(i % 2 === 1 ? 36 : 48, i % 2 === 1 ? 26 : 35, i % 2 === 1);
      mRight.position.set(65 + (i % 3) * 15, 0, z + 30);
      this.scene.add(mRight);
      this.mountainGroups.push(mRight);

      // Cute Dutch-style Windmills on the grassy hills
      if (i % 2 === 0) {
        const wmLeft = this.createWindmill();
        wmLeft.group.position.set(-26 - Math.random() * 8, 0, z + 15);
        this.scene.add(wmLeft.group);
        this.windmillRotors.push(wmLeft.rotor);

        const wmRight = this.createWindmill();
        wmRight.group.position.set(26 + Math.random() * 8, 0, z - 20);
        this.scene.add(wmRight.group);
        this.windmillRotors.push(wmRight.rotor);
      }
    });

    // Whimsical Hot Air Balloons floating peacefully in the sky
    const balloonPositions = [
      { x: -35, y: 32, z: 80, color: 0xf43f5e },
      { x: 42, y: 38, z: 160, color: 0x0ea5e9 },
      { x: -48, y: 35, z: 240, color: 0xf59e0b },
      { x: 38, y: 42, z: 320, color: 0x8b5cf6 },
    ];

    balloonPositions.forEach((bp) => {
      const balloon = this.createHotAirBalloon(bp.color);
      balloon.position.set(bp.x, bp.y, bp.z);
      this.scene.add(balloon);
      this.hotAirBalloons.push(balloon);
    });
  }

  private createMountain(radius: number, height: number, snow: boolean): THREE.Group {
    const group = new THREE.Group();
    const coneGeo = new THREE.ConeGeometry(radius, height, 7);
    const mMesh = new THREE.Mesh(coneGeo, snow ? this.mountainMaterial1 : this.mountainMaterial2);
    mMesh.position.y = height / 2;
    group.add(mMesh);

    if (snow) {
      const snowGeo = new THREE.ConeGeometry(radius * 0.35, height * 0.35, 7);
      const snowMesh = new THREE.Mesh(snowGeo, this.snowCapMaterial);
      snowMesh.position.y = height - (height * 0.35) / 2;
      group.add(snowMesh);
    }
    return group;
  }

  private createWindmill(): { group: THREE.Group; rotor: THREE.Mesh } {
    const group = new THREE.Group();

    // Tower Body
    const towerGeo = new THREE.CylinderGeometry(1.2, 2.2, 9, 8);
    const tower = new THREE.Mesh(towerGeo, this.windmillPoleMaterial);
    tower.position.y = 4.5;
    group.add(tower);

    // Conical Roof
    const roofGeo = new THREE.ConeGeometry(1.8, 2.2, 8);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 10;
    group.add(roof);

    // Rotor Blades (4 cross blades)
    const rotorGroup = new THREE.Group();
    rotorGroup.position.set(0, 8.8, 1.4);

    const bladeGeo = new THREE.BoxGeometry(0.5, 7.5, 0.08);
    const rotorMesh = new THREE.Mesh(bladeGeo, this.windmillBladeMaterial);

    const bladeGeo2 = new THREE.BoxGeometry(7.5, 0.5, 0.08);
    const rotorMesh2 = new THREE.Mesh(bladeGeo2, this.windmillBladeMaterial);

    rotorGroup.add(rotorMesh, rotorMesh2);
    group.add(rotorGroup);

    return { group, rotor: rotorMesh };
  }

  private createHotAirBalloon(colorHex: number): THREE.Group {
    const group = new THREE.Group();

    // Balloon envelope
    const sphereGeo = new THREE.SphereGeometry(3.5, 12, 12);
    const balloonMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3 });
    const balloon = new THREE.Mesh(sphereGeo, balloonMat);
    balloon.scale.set(1, 1.3, 1);
    balloon.position.y = 5;
    group.add(balloon);

    // Basket
    const basketGeo = new THREE.BoxGeometry(1.2, 1.0, 1.2);
    const basketMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const basket = new THREE.Mesh(basketGeo, basketMat);
    basket.position.y = 0.5;
    group.add(basket);

    // Suspension cords
    const cordGeo = new THREE.CylinderGeometry(0.04, 0.04, 3, 4);
    const cordMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    const cord1 = new THREE.Mesh(cordGeo, cordMat);
    cord1.position.set(-0.5, 2.2, 0);
    const cord2 = new THREE.Mesh(cordGeo, cordMat);
    cord2.position.set(0.5, 2.2, 0);
    group.add(cord1, cord2);

    return group;
  }

  private initClouds() {
    for (let i = 0; i < 22; i++) {
      const cloud = this.createFluffyCloud();
      cloud.position.set(
        (Math.random() - 0.5) * 140,
        22 + Math.random() * 18,
        i * 25 - 60
      );
      this.scene.add(cloud);
      this.skyClouds.push(cloud);
    }
  }

  private createFluffyCloud(): THREE.Group {
    const cloud = new THREE.Group();
    const partGeo = new THREE.SphereGeometry(1.5, 8, 8);
    const count = 5 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(partGeo, this.cloudMaterial);
      const scale = 1.6 + Math.random() * 2.2;
      p.scale.set(scale * 1.5, scale * 0.9, scale * 1.3);
      p.position.set((i - count / 2) * 2.2, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 1.2);
      cloud.add(p);
    }
    return cloud;
  }

  private createTree(x: number, z: number): THREE.Group {
    const group = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.35, 2.2, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.treeTrunkMaterial);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    group.add(trunk);

    // Foliage cones (low poly lush stylized pine/fir)
    const cone1 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.4, 8), this.treeLeavesMaterial1);
    cone1.position.y = 2.8;
    cone1.castShadow = true;

    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.0, 8), this.treeLeavesMaterial2);
    cone2.position.y = 3.9;
    cone2.castShadow = true;

    const cone3 = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.5, 8), this.treeLeavesMaterial1);
    cone3.position.y = 4.8;
    cone3.castShadow = true;

    group.add(cone1, cone2, cone3);
    group.position.set(x, 0, z);
    return group;
  }

  private initTrack() {
    for (let i = 0; i < this.totalPlates; i++) {
      const plate = this.createTrackPlate();
      plate.position.z = i * this.plateLength - 10;
      this.scene.add(plate);
      this.trackPlates.push(plate);
    }
  }

  private createTrackPlate(): THREE.Group {
    const group = new THREE.Group();

    // 1. Lush Green Track Ground
    const sideGroundWidth = 35;
    const groundGeo = new THREE.PlaneGeometry(sideGroundWidth, this.plateLength);
    groundGeo.rotateX(-Math.PI / 2);

    const leftGrass = new THREE.Mesh(groundGeo, this.grassMaterial);
    leftGrass.position.set(-this.trackWidth / 2 - sideGroundWidth / 2, -0.05, 0);
    leftGrass.receiveShadow = true;

    const rightGrass = new THREE.Mesh(groundGeo, this.grassMaterial);
    rightGrass.position.set(this.trackWidth / 2 + sideGroundWidth / 2, -0.05, 0);
    rightGrass.receiveShadow = true;

    // Outer rolling hillside ground on far left & right
    const outerGroundWidth = 70;
    const outerGeo = new THREE.PlaneGeometry(outerGroundWidth, this.plateLength);
    outerGeo.rotateX(-Math.PI / 2);

    const farLeftGrass = new THREE.Mesh(outerGeo, this.outerTerrainMaterial);
    farLeftGrass.position.set(-this.trackWidth / 2 - sideGroundWidth - outerGroundWidth / 2, -0.1, 0);

    const farRightGrass = new THREE.Mesh(outerGeo, this.outerTerrainMaterial);
    farRightGrass.position.set(this.trackWidth / 2 + sideGroundWidth + outerGroundWidth / 2, -0.1, 0);

    group.add(leftGrass, rightGrass, farLeftGrass, farRightGrass);

    // 2. Main road surface
    const roadGeo = new THREE.PlaneGeometry(this.trackWidth, this.plateLength);
    roadGeo.rotateX(-Math.PI / 2);
    const road = new THREE.Mesh(roadGeo, this.roadMaterial);
    road.receiveShadow = true;
    group.add(road);

    // 3. Side curbs (glow borders)
    const curbGeo = new THREE.BoxGeometry(0.35, 0.4, this.plateLength);
    const leftCurb = new THREE.Mesh(curbGeo, this.curbMaterial);
    leftCurb.position.set(-this.trackWidth / 2 - 0.175, 0.2, 0);
    leftCurb.receiveShadow = true;

    const rightCurb = new THREE.Mesh(curbGeo, this.curbMaterial);
    rightCurb.position.set(this.trackWidth / 2 + 0.175, 0.2, 0);
    rightCurb.receiveShadow = true;
    group.add(leftCurb, rightCurb);

    // 4. Road dash lines
    const stripeCount = 10;
    const stripeSpacing = this.plateLength / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      const stripeZ = -this.plateLength / 2 + i * stripeSpacing + stripeSpacing / 2;
      const stripeGeo = new THREE.PlaneGeometry(0.25, 3.5);
      stripeGeo.rotateX(-Math.PI / 2);

      const stripeLeft = new THREE.Mesh(stripeGeo, this.stripeMaterial);
      stripeLeft.position.set(-this.trackWidth / 6, 0.015, stripeZ);

      const stripeRight = new THREE.Mesh(stripeGeo, this.stripeMaterial);
      stripeRight.position.set(this.trackWidth / 6, 0.015, stripeZ);

      group.add(stripeLeft, stripeRight);
    }

    // 5. Roadside scenery: Pretty Trees, Flower clumps & street lamps
    const treeOffsets = [-32, -22, -12, 0, 12, 22, 32];
    for (const offsetZ of treeOffsets) {
      const treeL1 = this.createTree(-this.trackWidth / 2 - 2.8 - Math.random() * 2, offsetZ);
      const treeL2 = this.createTree(-this.trackWidth / 2 - 8.0 - Math.random() * 5, offsetZ + 4);
      const treeR1 = this.createTree(this.trackWidth / 2 + 2.8 + Math.random() * 2, offsetZ);
      const treeR2 = this.createTree(this.trackWidth / 2 + 8.0 + Math.random() * 5, offsetZ - 4);
      group.add(treeL1, treeL2, treeR1, treeR2);

      // Colorful flowers
      const flowerGeo = new THREE.SphereGeometry(0.22, 6, 6);
      const f1 = new THREE.Mesh(flowerGeo, this.flowerMat1);
      f1.position.set(-this.trackWidth / 2 - 1.2, 0.18, offsetZ + 2);

      const f2 = new THREE.Mesh(flowerGeo, this.flowerMat2);
      f2.position.set(this.trackWidth / 2 + 1.2, 0.18, offsetZ - 2);

      const f3 = new THREE.Mesh(flowerGeo, this.flowerMat3);
      f3.position.set(-this.trackWidth / 2 - 1.5, 0.18, offsetZ - 3);

      group.add(f1, f2, f3);
    }

    // 6. Pretty roadside banners & festive arches
    for (let i = 0; i < 2; i++) {
      const poleZ = -this.plateLength / 4 + (i * this.plateLength) / 2;
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 5.5, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
      const flagGeo = new THREE.BoxGeometry(0.05, 1.4, 2.0);

      const leftPole = new THREE.Mesh(poleGeo, poleMat);
      leftPole.position.set(-this.trackWidth / 2 - 1.6, 2.75, poleZ);
      const leftFlag = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      leftFlag.position.set(-this.trackWidth / 2 - 1.6, 4.5, poleZ + 1.0);

      const rightPole = new THREE.Mesh(poleGeo, poleMat);
      rightPole.position.set(this.trackWidth / 2 + 1.6, 2.75, poleZ);
      const rightFlag = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
      rightFlag.position.set(this.trackWidth / 2 + 1.6, 4.5, poleZ + 1.0);

      group.add(leftPole, leftFlag, rightPole, rightFlag);
    }

    return group;
  }

  private initParticles() {
    const geo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.maxParticles * 3);
    this.particleVelocities = new Float32Array(this.maxParticles * 3);
    this.particleLifespans = new Float32Array(this.maxParticles);

    geo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.5,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  public burstParticles(x: number, y: number, z: number, count: number = 25) {
    let spawned = 0;
    for (let i = 0; i < this.maxParticles && spawned < count; i++) {
      if (this.particleLifespans[i] <= 0) {
        this.particlePositions[i * 3] = x;
        this.particlePositions[i * 3 + 1] = y;
        this.particlePositions[i * 3 + 2] = z;

        this.particleVelocities[i * 3] = (Math.random() - 0.5) * 8;
        this.particleVelocities[i * 3 + 1] = Math.random() * 6 + 2;
        this.particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 8;

        this.particleLifespans[i] = 0.6 + Math.random() * 0.4;
        spawned++;
      }
    }
  }

  public updateTrack(playerZ: number) {
    // 1. Loop track plates seamlessly
    this.trackPlates.forEach((plate) => {
      if (plate.position.z < playerZ - this.plateLength) {
        plate.position.z += this.totalPlates * this.plateLength;
      }
    });

    // 2. Loop distant mountain scenery forward so the horizon is always packed with gorgeous hills
    this.mountainGroups.forEach((mount) => {
      if (mount.position.z < playerZ - 120) {
        mount.position.z += 480;
      }
    });

    // 3. Loop sky clouds
    this.skyClouds.forEach((cloud) => {
      if (cloud.position.z < playerZ - 60) {
        cloud.position.z += 300;
        cloud.position.x = (Math.random() - 0.5) * 140;
      }
    });

    // 4. Hot air balloons
    this.hotAirBalloons.forEach((b) => {
      if (b.position.z < playerZ - 60) {
        b.position.z += 360;
      }
    });
  }

  public spawnWorldObjects(playerZ: number, difficulty: DifficultyLevel) {
    const config = DIFFICULTY_CONFIGS[difficulty];
    const spawnDistance = 140;

    while (this.lastObstacleZ < playerZ + spawnDistance) {
      const dist =
        config.minObstacleDistance +
        Math.random() * (config.maxObstacleDistance - config.minObstacleDistance);
      this.lastObstacleZ += dist;
      const targetZ = this.lastObstacleZ;

      this.spawnPatternByDifficulty(difficulty, targetZ);
    }
  }

  private spawnPatternByDifficulty(difficulty: DifficultyLevel, z: number) {
    const lanes = [-2.6, 0, 2.6];

    if (difficulty === 1) {
      // 1단계: 쉬움 (Easy)
      const isHurdle = Math.random() < 0.65;
      const targetLane = lanes[Math.floor(Math.random() * lanes.length)];

      if (isHurdle) {
        this.createHurdle(targetLane, z, 2.4);
        this.createGold(targetLane, z, 1.8);
      } else {
        this.createTallBlock(targetLane, z, 2.2);
        const safeLane = targetLane === 0 ? 2.6 : 0;
        for (let i = -2; i <= 2; i++) {
          this.createGold(safeLane, z + i * 2, 0.8);
        }
      }
    } else if (difficulty === 2) {
      // 2단계: 보통 (Normal)
      const patternType = Math.random();

      if (patternType < 0.4) {
        const openLane = lanes[Math.floor(Math.random() * lanes.length)];
        lanes.forEach((l) => {
          if (l !== openLane) {
            this.createHurdle(l, z, 2.4);
            this.createGold(l, z, 1.9);
          } else {
            this.createGold(l, z, 0.8);
          }
        });
      } else if (patternType < 0.75) {
        const blockLane = lanes[Math.floor(Math.random() * 2) === 0 ? 0 : 2];
        const hurdleLane = 0;
        this.createTallBlock(blockLane, z, 2.4);
        this.createHurdle(hurdleLane, z, 2.4);
        this.createGold(hurdleLane, z, 1.9);
      } else {
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        this.createCones(lane, z);
      }
    } else {
      // 3단계: 어려움 (Hard)
      const patternType = Math.random();

      if (patternType < 0.35) {
        const openLane = lanes[Math.floor(Math.random() * lanes.length)];
        lanes.forEach((l) => {
          if (l !== openLane) {
            this.createTallBlock(l, z, 2.5);
          }
        });
        this.createHurdle(openLane, z + 7, 2.5);
        this.createGold(openLane, z + 7, 2.0);
      } else if (patternType < 0.7) {
        lanes.forEach((l) => {
          this.createHurdle(l, z, 2.6);
          this.createGold(l, z, 2.0);
        });
      } else {
        this.createTallBlock(-2.4, z, 3.2);
        this.createTallBlock(2.4, z + 6, 3.2);
        this.createHurdle(0, z + 12, 2.6);
      }
    }
  }

  private createHurdle(x: number, z: number, width: number = 2.4) {
    const group = new THREE.Group();
    const height = 1.05;
    const barGeo = new THREE.BoxGeometry(width, 0.22, 0.22);
    const bar = new THREE.Mesh(barGeo, this.hurdleMaterial);
    bar.position.y = height;
    bar.castShadow = true;

    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, height, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-width / 2 + 0.1, height / 2, 0);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(width / 2 - 0.1, height / 2, 0);

    group.add(bar, leftLeg, rightLeg);
    group.position.set(x, 0, z);

    this.scene.add(group);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(
      new THREE.Vector3(x, height / 2, z),
      new THREE.Vector3(width * 0.9, height, 0.6)
    );

    this.obstacles.push({
      group,
      kind: 'hurdle',
      jumpable: true,
      box,
      width,
      height,
      depth: 0.6,
      z,
      x,
    });
  }

  private createTallBlock(x: number, z: number, width: number = 2.4) {
    const group = new THREE.Group();
    const height = 2.8;
    const blockGeo = new THREE.BoxGeometry(width, height, 0.8);
    const block = new THREE.Mesh(blockGeo, this.tallBlockMaterial);
    block.position.y = height / 2;
    block.castShadow = true;
    block.receiveShadow = true;

    const bannerGeo = new THREE.BoxGeometry(width + 0.05, 0.5, 0.85);
    const banner = new THREE.Mesh(bannerGeo, this.hurdleMaterial);
    banner.position.y = height - 0.4;

    group.add(block, banner);
    group.position.set(x, 0, z);

    this.scene.add(group);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(
      new THREE.Vector3(x, height / 2, z),
      new THREE.Vector3(width * 0.95, height, 0.8)
    );

    this.obstacles.push({
      group,
      kind: 'tall_block',
      jumpable: false,
      box,
      width,
      height,
      depth: 0.8,
      z,
      x,
    });
  }

  private createCones(x: number, z: number) {
    const group = new THREE.Group();
    const height = 0.9;
    const coneGeo = new THREE.ConeGeometry(0.3, height, 12);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.2,
    });

    [-0.5, 0.5].forEach((offsetX) => {
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(offsetX, height / 2, 0);
      cone.castShadow = true;
      group.add(cone);
    });

    group.position.set(x, 0, z);
    this.scene.add(group);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(
      new THREE.Vector3(x, height / 2, z),
      new THREE.Vector3(1.4, height, 0.6)
    );

    this.obstacles.push({
      group,
      kind: 'traffic_cones',
      jumpable: true,
      box,
      width: 1.4,
      height,
      depth: 0.6,
      z,
      x,
    });
  }

  public createGold(x: number, z: number, y: number = 0.8) {
    const barGeo = new THREE.BoxGeometry(0.7, 0.28, 0.38);
    const mesh = new THREE.Mesh(barGeo, this.goldMaterial);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;

    this.scene.add(mesh);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(0.9, 0.9, 0.9)
    );

    this.goldItems.push({
      mesh,
      box,
      z,
      collected: false,
      isHigh: y > 1.2,
    });
  }

  public update(delta: number, playerZ: number) {
    // Animate windmill rotors
    const rotorSpeed = delta * 2.5;
    this.windmillRotors.forEach((rotor) => {
      rotor.rotation.z += rotorSpeed;
    });

    // Gentle bobbing of hot air balloons
    const time = Date.now() * 0.0015;
    this.hotAirBalloons.forEach((b, idx) => {
      b.position.y += Math.sin(time + idx * 1.5) * delta * 0.8;
      b.rotation.y += delta * 0.1;
    });

    // Gold animation
    for (let i = this.goldItems.length - 1; i >= 0; i--) {
      const item = this.goldItems[i];
      if (item.collected || item.z < playerZ - 10) {
        this.scene.remove(item.mesh);
        this.goldItems.splice(i, 1);
        continue;
      }
      item.mesh.rotation.y += delta * 3.5;
      item.mesh.rotation.x = Math.sin(time * 2 + item.z) * 0.2;
    }

    // Remove passed obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (obs.z < playerZ - 15) {
        this.scene.remove(obs.group);
        this.obstacles.splice(i, 1);
      }
    }

    // Update particles
    let hasActiveParticles = false;
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.particleLifespans[i] > 0) {
        hasActiveParticles = true;
        this.particleLifespans[i] -= delta;

        this.particlePositions[i * 3] += this.particleVelocities[i * 3] * delta;
        this.particlePositions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * delta;
        this.particlePositions[i * 3 + 2] += this.particleVelocities[i * 3 + 2] * delta;

        this.particleVelocities[i * 3 + 1] -= 9.8 * delta;
      } else {
        this.particlePositions[i * 3 + 1] = -999;
      }
    }
    if (hasActiveParticles) {
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }

  public reset(startZ: number = 0) {
    this.obstacles.forEach((obs) => this.scene.remove(obs.group));
    this.goldItems.forEach((gold) => this.scene.remove(gold.mesh));
    this.obstacles = [];
    this.goldItems = [];
    this.lastObstacleZ = startZ + 25;

    for (let i = 0; i < this.maxParticles; i++) {
      this.particleLifespans[i] = 0;
      this.particlePositions[i * 3 + 1] = -999;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
}
