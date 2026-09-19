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
  public sceneryItems: THREE.Group[] = [];
  public particles!: THREE.Points;

  private particlePositions!: Float32Array;
  private particleVelocities!: Float32Array;
  private particleLifespans!: Float32Array;
  private maxParticles = 200;

  // Shared Materials
  private roadMaterial: THREE.MeshStandardMaterial;
  private curbMaterial: THREE.MeshStandardMaterial;
  private stripeMaterial: THREE.MeshBasicMaterial;
  private goldMaterial: THREE.MeshStandardMaterial;
  private hurdleMaterial: THREE.MeshStandardMaterial;
  private tallBlockMaterial: THREE.MeshStandardMaterial;
  private stripeTexture: THREE.CanvasTexture;

  private trackWidth = 8.4;
  private plateLength = 60;
  private totalPlates = 4;
  private lastObstacleZ = 20;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Create striped canvas texture for obstacles
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

    this.roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x22262c,
      roughness: 0.85,
    });

    this.curbMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.5,
    });

    this.stripeMaterial = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
    });

    this.goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0xb45309,
      emissiveIntensity: 0.25,
    });

    this.hurdleMaterial = new THREE.MeshStandardMaterial({
      map: this.stripeTexture,
      roughness: 0.4,
    });

    this.tallBlockMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.7,
    });

    this.initTrack();
    this.initParticles();
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

    // Main road surface
    const roadGeo = new THREE.PlaneGeometry(this.trackWidth, this.plateLength);
    roadGeo.rotateX(-Math.PI / 2);
    const road = new THREE.Mesh(roadGeo, this.roadMaterial);
    road.receiveShadow = true;
    group.add(road);

    // Side curbs (glow borders)
    const curbGeo = new THREE.BoxGeometry(0.3, 0.4, this.plateLength);
    const leftCurb = new THREE.Mesh(curbGeo, this.curbMaterial);
    leftCurb.position.set(-this.trackWidth / 2 - 0.15, 0.2, 0);
    leftCurb.receiveShadow = true;

    const rightCurb = new THREE.Mesh(curbGeo, this.curbMaterial);
    rightCurb.position.set(this.trackWidth / 2 + 0.15, 0.2, 0);
    rightCurb.receiveShadow = true;
    group.add(leftCurb, rightCurb);

    // Road dash lines
    const stripeCount = 8;
    const stripeSpacing = this.plateLength / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      const stripeZ = -this.plateLength / 2 + i * stripeSpacing + stripeSpacing / 2;
      const stripeGeo = new THREE.PlaneGeometry(0.2, 3);
      stripeGeo.rotateX(-Math.PI / 2);

      // Left divider
      const stripeLeft = new THREE.Mesh(stripeGeo, this.stripeMaterial);
      stripeLeft.position.set(-this.trackWidth / 6, 0.01, stripeZ);
      // Right divider
      const stripeRight = new THREE.Mesh(stripeGeo, this.stripeMaterial);
      stripeRight.position.set(this.trackWidth / 6, 0.01, stripeZ);

      group.add(stripeLeft, stripeRight);
    }

    // Side lampposts / pillars
    for (let i = 0; i < 2; i++) {
      const poleZ = -this.plateLength / 4 + (i * this.plateLength) / 2;
      const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 6, 8);
      const lampGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const lampMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });

      const leftPole = new THREE.Mesh(poleGeo, this.tallBlockMaterial);
      leftPole.position.set(-this.trackWidth / 2 - 1.5, 3, poleZ);
      const leftLamp = new THREE.Mesh(lampGeo, lampMat);
      leftLamp.position.set(-this.trackWidth / 2 - 1.2, 5.8, poleZ);

      const rightPole = new THREE.Mesh(poleGeo, this.tallBlockMaterial);
      rightPole.position.set(this.trackWidth / 2 + 1.5, 3, poleZ);
      const rightLamp = new THREE.Mesh(lampGeo, lampMat);
      rightLamp.position.set(this.trackWidth / 2 + 1.2, 5.8, poleZ);

      group.add(leftPole, leftLamp, rightPole, rightLamp);
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
      size: 0.35,
      transparent: true,
      opacity: 0.9,
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
    this.trackPlates.forEach((plate) => {
      if (plate.position.z < playerZ - this.plateLength) {
        plate.position.z += this.totalPlates * this.plateLength;
      }
    });
  }

  public spawnWorldObjects(playerZ: number, difficulty: DifficultyLevel) {
    const config = DIFFICULTY_CONFIGS[difficulty];
    const spawnDistance = 140;

    while (this.lastObstacleZ < playerZ + spawnDistance) {
      const dist = config.minObstacleDistance + Math.random() * (config.maxObstacleDistance - config.minObstacleDistance);
      this.lastObstacleZ += dist;
      const targetZ = this.lastObstacleZ;

      this.spawnPatternByDifficulty(difficulty, targetZ);
    }
  }

  private spawnPatternByDifficulty(difficulty: DifficultyLevel, z: number) {
    const lanes = [-2.6, 0, 2.6];

    if (difficulty === 1) {
      // 1단계: 쉬움 (Easy)
      // 확실히 쉽게: 단일 장애물만 배치하고, 최소 2차선은 완전히 뚫려있음!
      // 또한 허들이 주로 나와서 점프로도 쉽게 통과 가능
      const isHurdle = Math.random() < 0.65;
      const targetLane = lanes[Math.floor(Math.random() * lanes.length)];

      if (isHurdle) {
        this.createHurdle(targetLane, z, 2.4);
        // Place gold over the hurdle to encourage jumping!
        this.createGold(targetLane, z, 1.8);
      } else {
        // Tall block on one lane only
        this.createTallBlock(targetLane, z, 2.2);
        // Guide trail with coins on the other safe lanes
        const safeLane = targetLane === 0 ? 2.6 : 0;
        for (let i = -2; i <= 2; i++) {
          this.createGold(safeLane, z + i * 2, 0.8);
        }
      }
    } else if (difficulty === 2) {
      // 2단계: 보통 (Normal)
      // 2개 차선 차단 또는 중앙 허들 + 사이드 장애물
      const patternType = Math.random();

      if (patternType < 0.4) {
        // Double hurdle (e.g. left and center, right is open)
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
        // One tall block + one hurdle
        const blockLane = lanes[Math.floor(Math.random() * 2) === 0 ? 0 : 2];
        const hurdleLane = 0;
        this.createTallBlock(blockLane, z, 2.4);
        this.createHurdle(hurdleLane, z, 2.4);
        this.createGold(hurdleLane, z, 1.9);
      } else {
        // Traffic cones barrier
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        this.createCones(lane, z);
      }
    } else {
      // 3단계: 어려움 (Hard)
      // 좀 어렵게: 지그재그 장애물, 좁은 통로, 즉각적인 반응 요구
      const patternType = Math.random();

      if (patternType < 0.35) {
        // High walls blocking 2 lanes, leaving only 1 narrow slit!
        const openLane = lanes[Math.floor(Math.random() * lanes.length)];
        lanes.forEach((l) => {
          if (l !== openLane) {
            this.createTallBlock(l, z, 2.5);
          }
        });
        // Right after (7m ahead), an unavoidable hurdle that MUST be jumped!
        this.createHurdle(openLane, z + 7, 2.5);
        this.createGold(openLane, z + 7, 2.0);
      } else if (patternType < 0.7) {
        // Full width road hurdle with high gold rewards
        lanes.forEach((l) => {
          this.createHurdle(l, z, 2.6);
          this.createGold(l, z, 2.0);
        });
      } else {
        // Staggered slalom barriers
        this.createTallBlock(-2.4, z, 3.2);
        this.createTallBlock(2.4, z + 6, 3.2);
        this.createHurdle(0, z + 12, 2.6);
      }
    }
  }

  private createHurdle(x: number, z: number, width: number = 2.4) {
    const group = new THREE.Group();
    const height = 1.05;
    const barGeo = new THREE.BoxGeometry(width, 0.2, 0.2);
    const bar = new THREE.Mesh(barGeo, this.hurdleMaterial);
    bar.position.y = height;
    bar.castShadow = true;

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, height, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
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

    // Warning stripe banner across top
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
      jumpable: false, // Too tall to jump over!
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
      roughness: 0.3,
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
    // Elegant gold bar ingot
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
    // 1. Animate gold bars (rotate and gentle bob)
    const time = Date.now() * 0.003;
    for (let i = this.goldItems.length - 1; i >= 0; i--) {
      const item = this.goldItems[i];
      if (item.collected || item.z < playerZ - 10) {
        this.scene.remove(item.mesh);
        this.goldItems.splice(i, 1);
        continue;
      }
      item.mesh.rotation.y += delta * 3.5;
      item.mesh.rotation.x = Math.sin(time + item.z) * 0.2;
    }

    // 2. Remove outdated obstacles behind player
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (obs.z < playerZ - 15) {
        this.scene.remove(obs.group);
        this.obstacles.splice(i, 1);
      }
    }

    // 3. Update particle system
    let hasActiveParticles = false;
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.particleLifespans[i] > 0) {
        hasActiveParticles = true;
        this.particleLifespans[i] -= delta;

        this.particlePositions[i * 3] += this.particleVelocities[i * 3] * delta;
        this.particlePositions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * delta;
        this.particlePositions[i * 3 + 2] += this.particleVelocities[i * 3 + 2] * delta;

        this.particleVelocities[i * 3 + 1] -= 9.8 * delta; // gravity
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

    // Reset particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.particleLifespans[i] = 0;
      this.particlePositions[i * 3 + 1] = -999;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
}
