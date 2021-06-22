function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  const fragmentShader = `
  #include <common>

  uniform vec3 iResolution;
  uniform float iTime;
  uniform sampler2D iChannel0;

  //shadertoy code
  #define uWavyness 0.1
  #define uScale vec2(3.0, 3.0)
  #define uOffset vec2(iTime, 0.0)
  #define uLayers 4
  #define uBaseFrequency vec2(0.5, 0.5)
  #define uFrequencyStep vec2(0.25, 0.25)

  void pR(inout vec2 p, float a)
  {
      float sa = sin(a);
      float ca = cos(a);
      p *= mat2(ca, sa, -sa, ca);
  }

  float scratch(vec2 uv, vec2 seed)
  {
      seed.x = floor(sin(seed.x * 51024.0) * 3104.0);
      seed.y = floor(sin(seed.y * 1324.0) * 554.0);
  
      uv = uv * 2.0 - 1.0;
      pR(uv, seed.x + seed.y);
      uv += sin(seed.x - seed.y);
      uv = clamp(uv * 0.5 + 0.5, 0.0, 1.0);
      
      float s1 = sin(seed.x + uv.y * 3.1415) * uWavyness;
      float s2 = sin(seed.y + uv.y * 3.1415) * uWavyness;
      
      float x = sign(0.01 - abs(uv.x - 0.5 + s2 + s1));
      return clamp(((1.0 - pow(uv.y, 2.0)) * uv.y) * 2.5 * x, 0.0, 1.0);
  }

  float layer(vec2 uv, vec2 frequency, vec2 offset, float angle)
  {
      pR(uv, angle);
      uv = uv * frequency + offset;
      return scratch(fract(uv), floor(uv));
  }

  float scratches(vec2 uv)
  {
      uv *= uScale;
      uv += uOffset;
      vec2 frequency = uBaseFrequency;
      float scratches = 0.0;
      for(int i = 0; i < uLayers; ++i)
      {
          float fi = float(i);
        scratches = max(scratches, layer(uv, frequency, vec2(fi, fi), fi * 3145.0)); // Nicer blending, thanks Shane!
          frequency += uFrequencyStep;
      }
      return clamp(scratches, 0.0, 1.0); // Saturate for AA to work better
  }

  void mainImage(out vec4 fragColor, in vec2 fragCoord)
  {
    vec2 uv = (2.0 * fragCoord.xy - iResolution.xy) / iResolution.y;
      
      // using AA by Shane:
      // https://www.shadertoy.com/view/4d3SWf
      const float AA = 4.; // Antialias level. Set to 1 for a standard, aliased scene.
      const int AA2 = int(AA*AA);
      float col = 0.0;
      vec2 pix = 2.0/iResolution.yy/AA; // or iResolution.xy
      for (int i=0; i<AA2; i++){ 

          float k = float(i);
          vec2 uvOffs = uv + vec2(floor(k/AA), mod(k, AA)) * pix;
          col += scratches(uvOffs);
      }
      col /= (AA*AA);
    
    fragColor = vec4(col);
  }

  //end shadertoy codeZ
  varying vec2 vUv;

  void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
  }
  `;
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `;

  const loader = new THREE.TextureLoader();
  const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/bayer.png');
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  const uniforms = {
    iTime: { value: 0 },
    iResolution:  { value: new THREE.Vector3(1, 1, 1) },
    iChannel0: { value: texture },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  });
  function makeInstance(geometry, x) {
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
  }

  const cubes = [
    makeInstance(geometry,  0),
    makeInstance(geometry, -2),
    makeInstance(geometry,  2),
  ];

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;  // convert to seconds

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });

    uniforms.iTime.value = time;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
