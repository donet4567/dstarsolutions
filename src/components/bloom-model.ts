import * as THREE from "three";

export const bloomColours = ["#c3afe8", "#efb8d1", "#f4d4b3", "#b7ddce", "#b8dced", "#d6c5ee", "#f0c2d8", "#f2dbbd"];

export function createPetal() {
  const geometry = new THREE.SphereGeometry(1, 40, 40);
  const position = geometry.attributes.position;
  for (let index = 0; index < position.count; index++) {
    const t = (position.getY(index) + 1) / 2;
    const x = position.getX(index) * (.68 + t * .4);
    const z = position.getZ(index) * .26;
    const twist = t * 1.05;
    position.setXYZ(index,
      x * Math.cos(twist) - z * Math.sin(twist) + t * t * .28,
      t * 2.35 + .08,
      x * Math.sin(twist) + z * Math.cos(twist) + t * t * .65,
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

export type BloomValues = { progress: number; pointerX: number; pointerY: number; rotation: number };

export function updateBloom(root: THREE.Group, petals: (THREE.Group | null)[], input: BloomValues, time: number, delta: number) {
  const p = input.progress;
  root.rotation.x = THREE.MathUtils.damp(root.rotation.x, -.25 + input.pointerY * .12 + p * .35, 4, delta);
  root.rotation.y = THREE.MathUtils.damp(root.rotation.y, -.28 + input.pointerX * .2 + input.rotation + p * .8, 4, delta);
  root.rotation.z = -.16 + time * .055 + p * .4;
  root.position.y = Math.sin(time * .65) * .06;
  root.scale.setScalar(1 - p * .16);
  petals.forEach((petal, index) => {
    if (petal) petal.rotation.x = .1 + p * .38 + Math.sin(time * .6 + index * .7) * .025;
  });
}
