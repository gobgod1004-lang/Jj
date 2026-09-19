import * as THREE from 'three';

export class CharacterModel {
  public group: THREE.Group;
  public bodyGroup: THREE.Group;
  public leftLeg: THREE.Mesh;
  public rightLeg: THREE.Mesh;
  public leftArm: THREE.Mesh;
  public rightArm: THREE.Mesh;
  public tail: THREE.Mesh;
  public headGroup: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.bodyGroup = new THREE.Group();

    // Stylized materials
    const catFurMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5a623, // Warm golden-orange Tom color
      roughness: 0.4,
      metalness: 0.1,
    });

    const whiteBellyMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff3e0,
      roughness: 0.5,
    });

    const vestMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, // Blue runner jersey
      roughness: 0.3,
    });

    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.1,
    });

    const innerEarMaterial = new THREE.MeshStandardMaterial({
      color: 0xf472b6, // Pink inner ear
      roughness: 0.5,
    });

    const goldNecklaceMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2,
    });

    // 1. Torso / Body
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.45, 0.9, 16);
    const torso = new THREE.Mesh(torsoGeo, vestMaterial);
    torso.position.y = 0.9;
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Belly patch
    const bellyGeo = new THREE.CylinderGeometry(0.39, 0.43, 0.7, 16, 1, false, -Math.PI / 3, (2 * Math.PI) / 3);
    const belly = new THREE.Mesh(bellyGeo, whiteBellyMaterial);
    belly.position.y = 0.9;
    belly.position.z = 0.02;
    this.bodyGroup.add(belly);

    // Gold runner medallion
    const medalGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
    medalGeo.rotateX(Math.PI / 2);
    const medal = new THREE.Mesh(medalGeo, goldNecklaceMaterial);
    medal.position.set(0, 1.15, 0.4);
    this.bodyGroup.add(medal);

    // 2. Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.65, 0);

    // Head base sphere
    const headGeo = new THREE.SphereGeometry(0.48, 20, 20);
    const head = new THREE.Mesh(headGeo, catFurMaterial);
    head.castShadow = true;
    this.headGroup.add(head);

    // Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const leftCheek = new THREE.Mesh(cheekGeo, whiteBellyMaterial);
    leftCheek.position.set(-0.2, -0.15, 0.35);
    const rightCheek = new THREE.Mesh(cheekGeo, whiteBellyMaterial);
    rightCheek.position.set(0.2, -0.15, 0.35);
    this.headGroup.add(leftCheek, rightCheek);

    // Snout / Nose
    const noseGeo = new THREE.ConeGeometry(0.06, 0.06, 8);
    noseGeo.rotateX(-Math.PI / 2);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, -0.06, 0.52);
    this.headGroup.add(nose);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    leftEye.position.set(-0.16, 0.08, 0.44);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    rightEye.position.set(0.16, 0.08, 0.44);
    this.headGroup.add(leftEye, rightEye);

    // Cat Ears
    const earGeo = new THREE.ConeGeometry(0.18, 0.35, 4);
    const leftEar = new THREE.Mesh(earGeo, catFurMaterial);
    leftEar.position.set(-0.28, 0.5, -0.05);
    leftEar.rotation.set(0, 0, 0.3);
    const rightEar = new THREE.Mesh(earGeo, catFurMaterial);
    rightEar.position.set(0.28, 0.5, -0.05);
    rightEar.rotation.set(0, 0, -0.3);

    const innerEarGeo = new THREE.ConeGeometry(0.11, 0.25, 4);
    const leftInnerEar = new THREE.Mesh(innerEarGeo, innerEarMaterial);
    leftInnerEar.position.set(-0.27, 0.49, 0.02);
    leftInnerEar.rotation.set(0, 0, 0.3);
    const rightInnerEar = new THREE.Mesh(innerEarGeo, innerEarMaterial);
    rightInnerEar.position.set(0.27, 0.49, 0.02);
    rightInnerEar.rotation.set(0, 0, -0.3);

    this.headGroup.add(leftEar, rightEar, leftInnerEar, rightInnerEar);
    this.bodyGroup.add(this.headGroup);

    // 3. Legs
    const legGeo = new THREE.CapsuleGeometry(0.14, 0.5, 8, 8);
    this.leftLeg = new THREE.Mesh(legGeo, catFurMaterial);
    this.leftLeg.position.set(-0.22, 0.35, 0);
    this.leftLeg.castShadow = true;

    this.rightLeg = new THREE.Mesh(legGeo, catFurMaterial);
    this.rightLeg.position.set(0.22, 0.35, 0);
    this.rightLeg.castShadow = true;

    this.bodyGroup.add(this.leftLeg, this.rightLeg);

    // 4. Arms
    const armGeo = new THREE.CapsuleGeometry(0.11, 0.45, 8, 8);
    this.leftArm = new THREE.Mesh(armGeo, catFurMaterial);
    this.leftArm.position.set(-0.48, 0.9, 0);
    this.leftArm.castShadow = true;

    this.rightArm = new THREE.Mesh(armGeo, catFurMaterial);
    this.rightArm.position.set(0.48, 0.9, 0);
    this.rightArm.castShadow = true;

    this.bodyGroup.add(this.leftArm, this.rightArm);

    // 5. Tail
    const tailGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.6, 8);
    tailGeo.rotateX(Math.PI / 4);
    this.tail = new THREE.Mesh(tailGeo, catFurMaterial);
    this.tail.position.set(0, 0.6, -0.4);
    this.bodyGroup.add(this.tail);

    this.group.add(this.bodyGroup);

    // Scale character slightly to fit world
    this.group.scale.set(1.1, 1.1, 1.1);
  }

  public animate(delta: number, speed: number, isJumping: boolean) {
    const runCycle = (Date.now() / 1000) * (speed * 0.5);

    if (isJumping) {
      // In mid-air: arms spread out for balance, legs bent slightly
      this.leftLeg.rotation.x = -0.5;
      this.rightLeg.rotation.x = -0.5;
      this.leftArm.rotation.z = 0.6;
      this.rightArm.rotation.z = -0.6;
      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
      this.bodyGroup.position.y = 0.1;
      this.headGroup.rotation.x = -0.15;
    } else {
      // Normal running cycle
      const legAngle = Math.sin(runCycle) * 0.75;
      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      const armAngle = Math.sin(runCycle) * 0.65;
      this.leftArm.rotation.x = -armAngle;
      this.rightArm.rotation.x = armAngle;
      this.leftArm.rotation.z = 0.15;
      this.rightArm.rotation.z = -0.15;

      // Subtle body bobbing
      this.bodyGroup.position.y = Math.abs(Math.sin(runCycle * 2)) * 0.1;
      this.headGroup.rotation.x = Math.sin(runCycle * 2) * 0.05;
      this.tail.rotation.y = Math.sin(runCycle) * 0.3;
    }
  }
}
