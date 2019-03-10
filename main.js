var cubeRotation = 0.0;

main();

//
// Start here
//

var c;
var c1;


timeoutJump = -1;
timeoutFly = -1;
timeoutDeath = -1;



flash = false;
flashtrack = 0;
grey = false;
highjump = false;
height = 0;

score = 0;

function main() {
  
  boffset = -1.0;

  canvas = document.querySelector('#glcanvas');
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  
  speed_z = 0.08;
  dist = 0;
  renderlen = 40;
  coinlen = 100;
  coinprob = 0.06;
  obslen = 20;
  obsprob = 0.004;
  powerlen = 5;
  powerprob = 0.001;

  tracktrk = 0;
  trackside = 0;
  trackstattrain = 0;
  tracktrain = 0;
  trackfence = 0;
  trackcoins = 0;
  trackjump = 0;
  trackjet = 0;

  

  strn_fin = false;
  trn_fin = false;
  fence_fin = false;
  coin_fin = false;
  jump_fin = false;
  jet_fin = false;

  trk = [];
  side = [];
  coins = []
  
  stattrain = [];
  strain = [];
  fence = [];
  boots = [];
  jets = [];

  init();

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  // const vsSource = `
  //   attribute vec4 aVertexPosition;
  //   attribute vec4 aVertexColor;

  //   uniform mat4 uModelViewMatrix;
  //   uniform mat4 uProjectionMatrix;

  //   varying lowp vec4 vColor;

  //   void main(void) {
  //     gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  //     vColor = aVertexColor;
  //   }
  // `;

  const vsSourceAlt = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      // Apply lighting effect

      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(-0.85, -0.8, 0.75));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;

  const vsSourceText = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      // Apply lighting effect

      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.85, -0.8, 0.75));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;

  // Fragment shader program

  // const fsSource = `
  //   varying lowp vec4 vColor;

  //   void main(void) {
  //     gl_FragColor = vColor;
  //   }
  // `;

 
  const fsSourceText = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
  `;

  const fsSourceTextGS = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
      precision highp float;
      
      highp vec4 color = texture2D(uSampler, vTextureCoord);
      float grey = dot(color.rgb, vec3(0.4, 0.1, 0.3));
      gl_FragColor = vec4(vec3(grey), 1.0);
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  // const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const shaderProgramText = initShaderProgram(gl, vsSourceText, fsSourceText);
  const shaderProgramAlt = initShaderProgram(gl, vsSourceAlt, fsSourceText);
  const shaderProgramGS = initShaderProgram(gl, vsSourceText, fsSourceTextGS);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.

  
  const programInfoAlt = {
    program: shaderProgramAlt,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramAlt, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgramAlt, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgramAlt, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramAlt, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramAlt, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgramAlt, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgramAlt, 'uSampler'),
    },
  };


  const programInfoText = {
    program: shaderProgramText,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramText, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgramText, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgramText, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramText, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramText, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgramText, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgramText, 'uSampler'),
    },
  };

  const programInfoGS = {
    program: shaderProgramGS,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramGS, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgramGS, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgramGS, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramGS, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramGS, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgramGS, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgramGS, 'uSampler'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  //const buffers

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    dist += speed_z;




    timeoutFly -= 1;
    timeoutJump -= 1;
    timeoutDeath -= 1;

    if (timeoutFly === 0) {
      ajetpack();
    }
    if (timeoutJump === 0) {
      highjump = false;
    }
    if (timeoutDeath == 0) {
      grey = false;
    }






    // console.log(dist);
    if (dist >= 2) {
      // Create floor
      // btrk = new track(gl, [0.0, -1.0, dist], speed_z);
      trackside += 1;
      if (trackside >= renderlen) {
        trackside = 0;
      }
      tracktrk += 1;
      if (tracktrk >= renderlen) {
        tracktrk = 0;
      }
  
      trk[tracktrk] = new track(gl, [0.0, -1.7+boffset+height, -(renderlen-1)*2], speed_z);
      side[trackside] = new sidewall(gl, [-3.0, 0.3+boffset+height, -(renderlen-1)*2], speed_z);
      
      dist = 0;
    }


    // Create stationary trains
    if (Math.random() < obsprob) {

      // Stationary train
      pos = 0.0;
      if (Math.random() < 0.33) {
        pos = 1.7;
      }
      else if (Math.random() < 0.66) {
        pos = -1.7;
      }

      stattrain[trackstattrain] = new trainstat(gl, [pos, -1.7+height, -(renderlen-1)*2], speed_z);
      trackstattrain += 1;
      if (trackstattrain >= obslen) {
        trackstattrain = 0;
        strn_fin = true;
      }
    }

    // Create moving trains
    if (Math.random() < obsprob) {

      // Moving train
      pos = 0.0;
      if (Math.random() < 0.33) {
        pos = 1.7;
      }
      else if (Math.random() < 0.66) {
        pos = -1.7;
      }

      strain[tracktrain] = new train(gl, [pos, -1.7+height, -(renderlen-1)*2], 4*speed_z);
      tracktrain += 1;
      if (tracktrain >= obslen) {
        tracktrain = 0;
        trn_fin = true;
      }
    }

    // Create moving trains
    if (Math.random() < obsprob) {

      // Moving train
      pos = 0.0;
      if (Math.random() < 0.33) {
        pos = 1.7;
      }
      else if (Math.random() < 0.66) {
        pos = -1.7;
      }


      fence[trackfence] = new fences(gl, [pos, -2.2+height, -(renderlen-1)*2], speed_z);
      trackfence += 1;
      if (trackfence >= obslen) {
        trackfence = 0;
        fence_fin = true;
      }
    }
    
    // Create coins 
    if (Math.random() < coinprob) {

      // Moving train
      pos = 0.0;
      if (Math.random() < 0.33) {
        pos = 1.7;
      }
      else if (Math.random() < 0.66) {
        pos = -1.7;
      }


      coins[trackcoins] = new coin(gl, [pos, -2+height, -(renderlen-1)*2], speed_z);
      trackcoins += 1;
      if (trackcoins >= coinlen) {
        trackcoins = 0;
        coin_fin = true;
      }
    }

    // Create boots 
    if (Math.random() < powerprob) {

      // Moving train
      pos = 0.0;
      if (Math.random() < 0.33) {
        pos = 1.7;
      }
      else if (Math.random() < 0.66) {
        pos = -1.7;
      }


      boots[trackjump] = new boot(gl, [pos, -2+height, -(renderlen-1)*2], speed_z);
      trackjump += 1;
      if (trackjump >= powerlen) {
        trackjump = 0;
        jump_fin = true;
      }
    }

    // Create jets 
    if (Math.random() < powerprob) {

      // Moving train
      pos = 0.0;
      if (Math.random() < 0.33) {
        pos = 1.7;
      }
      else if (Math.random() < 0.66) {
        pos = -1.7;
      }


      jets[trackjet] = new jetpack(gl, [pos, -2+height, -(renderlen-1)*2], speed_z);
      trackjet += 1;
      if (trackjet >= powerlen) {
        trackjet = 0;
        jet_fin = true;
      }
    }

    checkcollision();

    
    


    // temp = programInfoText;
    // console.log(flash);
    // if (flash == true) {
    //   drawScene(gl, programInfoAlt, deltaTime);
    // }
    // else {
    //   drawScene(gl, programInfoText, deltaTime);
    // }

    temp = programInfoText;
    // console.log(grey);
    if (flash === true) {
      if (flashtrack % 20 >= 0 && flashtrack % 20 < 10) {
        temp = programInfoAlt;
      }
      else {
        temp = programInfoText;
      }
      flashtrack += 1;
    }
    else if (grey === true) {
      temp = programInfoGS;
    }
    drawScene(gl, temp, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}



function init() {
  player = new player(gl, [0.0, -1.0+boffset, -8.0], 0)
  for (let i = 0; i < renderlen; i++) {
    trk[i] = new track(gl, [0.0, -1.7+boffset, -2*i], speed_z);
    side[i] = new sidewall(gl, [-3.0, 0.3+boffset, -2*i], speed_z);
  }
  stattrain = new trainstat(gl, [0.0, -0.7+boffset, -20.0], speed_z);
}


//
// Draw the scene.
//
function drawScene(gl, programInfo, deltaTime) {
  gl.clearColor(56.0/256.0, 80.0/256.0, 116.0/256.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  var cameraMatrix = mat4.create();
  // mat4.translate(cameraMatrix, cameraMatrix, [2, 5, 0]);
  var cameraPosition = [ 0.0, 4.0, 0.0,
    // cameraMatrix[12],
    // cameraMatrix[13],
    // cameraMatrix[14],
  ];

  var up = [0, 1, 0];

  mat4.lookAt(cameraMatrix, cameraPosition, [0, 0, 0], up);

  var viewMatrix = cameraMatrix;//mat4.create();

  //mat4.invert(viewMatrix, cameraMatrix);

  var viewProjectionMatrix = mat4.create();

  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  // c.drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
  // c1.drawCube(gl, projectionMatrix, programInfo, deltaTime);
  // c2.drawCube(gl, projectionMatrix, programInfo, deltaTime);

  // tc.drawCube(gl, projectionMatrix, programInfo, deltaTime);
  // btrk.drawCube(gl, projectionMatrix, programInfo, deltaTime);
  // side.drawCube(gl, projectionMatrix, programInfo, deltaTime);

  player.drawCube(gl, projectionMatrix, programInfo, deltaTime);
  for (let i = 0; i < renderlen; i++) {
    trk[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    side[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
  }
  stattrain.drawCube(gl, projectionMatrix, programInfo, deltaTime);

  if (!strn_fin) {
    for (let i = 0; i < trackstattrain; i++) {
      stattrain[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    }
  }
  else {
    for (let i = 0; i < obslen; i++) {
      stattrain[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    }
  }

  if (!trn_fin) {
    for (let i = 0; i < tracktrain; i++) {
      strain[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    }
  }
  else {
    for (let i = 0; i < obslen; i++) {
      strain[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    }
  }

  if (!fence_fin) {
    for (let i = 0; i < trackfence; i++) {
      fence[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    }
  }
  else {
    for (let i = 0; i < obslen; i++) {
      fence[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    }
  }

  if (!coin_fin) {
    for (let i = 0; i < trackcoins; i++) {
      coins[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    }
  }
  else {
    for (let i = 0; i < obslen; i++) {
      coins[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    }
  }

  
  if (!jump_fin) {
    for (let i = 0; i < trackjump; i++) {
      boots[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    }
  }
  else {
    for (let i = 0; i < powerlen; i++) {
      boots[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    }
  }

  
  if (!jet_fin) {
    for (let i = 0; i < trackjet; i++) {
      jets[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    }
  }
  else {
    for (let i = 0; i < powerlen; i++) {
      jets[i].drawCube(gl, projectionMatrix, programInfo, deltaTime);
    }
  }

  

  

}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
document.addEventListener('keyup', function (event) {
  if (event.defaultPrevented) {
      return;
  }

  var key = event.key || event.keyCode;

  if (key === 'ArrowRight' || key === 39) {
      console.log("right was hit");
      player.speed_x = 0.125;
      // this.move();
  }
  if (key === 'ArrowLeft' || key === 37) {
      console.log("left was hit");
      player.speed_x = -0.125;
      // this.move();
  }
  if (key === 'ArrowUp' || key === 38) {
      console.log("up was hit");
      // player.speed_x = -0.5;
      if (highjump) {
        highjump = false;
      }
      else {
        highjump = true;
      }
      // this.move();
  }
  if ((key === 'Space' || key === ' ' || key === 32) && speed_z != 1) {
      console.log("space was hit");
      if (player.pos[1] == -2.0) {
        if (highjump) {
          player.speed_y = 0.3;
        }
        else {
          player.speed_y = 0.22;
        }
      }
  }
  if (key === 'KeyA' || key === 'a' || key === 65 || key === 97) {
      console.log("*****\n******\n*******\n*******\nA was hit\n*****\n******\n*******\n*******");
      // if (player.pos[1] == -2.0) {
      //   player.speed_y = 0.2;
      // }
      flash = true;
  }
  if (key === 'KeyB' || key === 'b' || key === 66 || key === 98) {
      console.log("B was hit");
      // if (player.pos[1] == -2.0) {
      //   player.speed_y = 0.2;
      // }
      flash = false;
  }
  if (key === 'KeyC' || key === 'c' || key === 67 || key === 99) {
      console.log("*****\n******\n*******\n*******\nC was hit\n*****\n******\n*******\n*******");
      // if (player.pos[1] == -2.0) {
      //   player.speed_y = 0.2;
      // }
      grey = true;
  }
  if (key === 'KeyD' || key === 'd' || key === 68 || key === 100) {
    console.log("D was hit");
    // if (player.pos[1] == -2.0) {
    //   player.speed_y = 0.2;
    // }
    grey = false;
  }
  if (key === 'KeyE' || key === 'e' || key === 69 || key === 101) {
    console.log("D was hit");
    // if (player.pos[1] == -2.0) {
    //   player.speed_y = 0.2;
    // }
    // grey = false;
    ajetpack();
  }
  if (key === 'KeyF' || key === 'f' || key === 70 || key === 102) {
    console.log("D was hit");
    // if (player.pos[1] == -2.0) {
    //   player.speed_y = 0.2;
    // }
    // grey = false;
    // rjetpack();
  }


});


function detect_collision(a, b) {
	return (Math.abs(a.pos[0] - b.pos[0]) < (a.width + b.width)) &&
           (Math.abs(a.pos[1] - b.pos[1]) < (a.height + b.height)) &&
           (Math.abs(a.pos[2] - b.pos[2]) < (a.length + b.length));
}




function ajetpack() {

  if (speed_z == 1) {
    speed_z = 0.08;
    height += 4;



    for (let i = 0; i < renderlen; i++) {
      trk[i].pos[1]+= 4;
      trk[i].speed_z = speed_z;
      
      side[i].pos[1]+= 4;
      side[i].speed_z = speed_z;
    }
    stattrain.pos[1]+= 4;

    if (!strn_fin) {
      for (let i = 0; i < trackstattrain; i++) {
        stattrain[i].pos[1]+= 4;
        stattrain[i].speed_z = speed_z;
      }
    }
    else {
      for (let i = 0; i < obslen; i++) {
        stattrain[i].pos[1]+= 4;
        stattrain[i].speed_z = speed_z;
      }
    }

    if (!trn_fin) {
      for (let i = 0; i < tracktrain; i++) {
        strain[i].pos[1]+= 4;
        strain[i].speed_z = speed_z;
      }
    }
    else {
      for (let i = 0; i < obslen; i++) {
        strain[i].pos[1]+= 4;
        strain[i].speed_z = speed_z;
      }
    }

    if (!fence_fin) {
      for (let i = 0; i < trackfence; i++) {
        fence[i].pos[1]+= 4;
        fence[i].speed_z = speed_z;
      }
    }
    else {
      for (let i = 0; i < obslen; i++) {
        fence[i].pos[1]+= 4;
        fence[i].speed_z = speed_z;
      }
    }

    if (!coin_fin) {
      for (let i = 0; i < trackcoins; i++) {
        coins[i].pos[1]+= 4;
        coins[i].speed_z = speed_z;
      }
    }
    else {
      for (let i = 0; i < obslen; i++) {
        coins[i].pos[1]+= 4;
        coins[i].speed_z = speed_z;
      }
    }

    
    if (!jump_fin) {
      for (let i = 0; i < trackjump; i++) {
        boots[i].pos[1]+= 4;
        boots[i].speed_z = speed_z;
      }
    }
    else {
      for (let i = 0; i < powerlen; i++) {
        boots[i].pos[1]+= 4;
        boots[i].speed_z = speed_z;
      }
    }

  
    if (!jet_fin) {
      for (let i = 0; i < trackjet; i++) {
        jets[i].pos[1] += 4;
        jets[i].speed_z = speed_z;
      }
    }
    else {
      for (let i = 0; i < powerlen; i++) {
        jets[i].pos[1] += 4;
        jets[i].speed_z = speed_z;
      }
    }



  }
  else {
    speed_z = 1;

    height -= 4;

    for (let i = 0; i < renderlen; i++) {
      trk[i].pos[1]-= 4;
      trk[i].speed_z = speed_z;
      
      side[i].pos[1]-= 4;
      side[i].speed_z = speed_z;
    }
    stattrain.pos[1]-= 4;

    if (!strn_fin) {
      for (let i = 0; i < trackstattrain; i++) {
        stattrain[i].pos[1]-= 4;
        stattrain[i].speed_z = speed_z;
      }
    }
    else {
      for (let i = 0; i < obslen; i++) {
        stattrain[i].pos[1]-= 4;
        stattrain[i].speed_z = speed_z;
      }
    }

    if (!trn_fin) {
      for (let i = 0; i < tracktrain; i++) {
        strain[i].pos[1]-= 4;
        strain[i].speed_z = speed_z;
      }
    }
    else {
      for (let i = 0; i < obslen; i++) {
        strain[i].pos[1]-= 4;
        strain[i].speed_z = speed_z;
      }
    }

    if (!fence_fin) {
      for (let i = 0; i < trackfence; i++) {
        fence[i].pos[1]-= 4;
        fence[i].speed_z = speed_z;
      }
    }
    else {
      for (let i = 0; i < obslen; i++) {
        fence[i].pos[1]-= 4;
        fence[i].speed_z = speed_z;
      }
    }

    if (!coin_fin) {
      for (let i = 0; i < trackcoins; i++) {
        coins[i].pos[1]-= 4;
        coins[i].speed_z = speed_z;
      }
    }
    else {
      for (let i = 0; i < obslen; i++) {
        coins[i].pos[1]-= 4;
        coins[i].speed_z = speed_z;
      }
    }

    
    if (!jump_fin) {
      for (let i = 0; i < trackjump; i++) {
        boots[i].pos[1]-= 4;
        boots[i].speed_z = speed_z;
      }
    }
    else {
      for (let i = 0; i < powerlen; i++) {
        boots[i].pos[1]-= 4;
        boots[i].speed_z = speed_z;
      }
    }
  
    if (!jet_fin) {
      for (let i = 0; i < trackjet; i++) {
        jets[i].pos[1] -= 4;
        jets[i].speed_z = speed_z;
      }
    }
    else {
      for (let i = 0; i < powerlen; i++) {
        jets[i].pos[1] -= 4;
        jets[i].speed_z = speed_z;
      }
    }
  }
}

function checkcollision() {
  // player and coin
  a = coinlen;
  if (!coin_fin) {
    a = trackcoins;
  }
  for (let i = 0; i < a; i+= 1) {
    if (detect_collision(coins[i], player)) {
      console.log("Collided coin");
      coins[i].pos = [1000, 1000, 1000];
      score += 1;
    }
  }


  // Player and boot
  a = powerlen
  if (!jump_fin) {
    a = trackjump;
  }
  for (let i= 0; i < a; i+= 1) {
    if (detect_collision(boots[i], player)) {
      timeoutJump = 500;
      console.log("Collided boot");
      boots[i].pos = [1000, 1000, 1000];
      highjump = true;
    }
  }

  // Player and jetpack
  a = powerlen
  if (!jet_fin) {
    a = trackjet;
  }
  for (let i= 0; i < a; i+= 1) {
    if (detect_collision(jets[i], player)) {
      timeoutFly = 200;
      console.log("Collided jet");
      jets[i].pos = [1000, 1000, 1000];
      ajetpack();
    }
    // highjump = true;
  }

  
  // Player and trainstat
  a = obslen
  if (!strn_fin) {
    a = trackstattrain;
  }
  for (let i = 0; i < a; i+=1) {
    if (detect_collision(stattrain[i], player)) {
      if (player.pos[1] > stattrain[i].pos[1]+stattrain[1].height) {
        console.log("top of train");
      }
      else {
        window.alert("dead");
      }
      console.log("Static train collision");
    }
  }

  // Player and train
  a = obslen
  if (!trn_fin) {
    a = tracktrain;
  }
  for (let i = 0; i < a; i+=1) {
    if (detect_collision(strain[i], player)) {
      if (player.pos[1] > strain[i].pos[1]+strain[1].height) {
        console.log("top of train");
      }
      else {
        window.alert("dead");
      }
      console.log("train collision");
    }
  }

  // Player and fence
  a = obslen
  if (!fence_fin) {
    a = trackfence;
  }
  for (let i = 0; i < a; i++) {
    if (detect_collision(fence[i], player)) {
      fence[i].pos = [1000, 1000, 1000];
      if (timeoutDeath > 0) {
        console.log("dead");
      }
      else {
        timeoutDeath = 100;
        grey = true;
      }
      console.log("Fence collision");
    }
  }


}

// }

// function rjetpack() {
//   speed_z = 0.08;

//   height += 4;

//   for (let i = 0; i < renderlen; i++) {
//     trk[i].speed_y = 0.01;
//     trk[i].speed_z = 0.08;
//     side[i].speed_y = 0.01;
//     side[i].speed_z = 0.08;
//   }
//   stattrain.speed_y = 0.1;

//   if (!strn_fin) {
//     for (let i = 0; i < trackstattrain; i++) {
//       stattrain[i].speed_y = 0.1;
//     }
//   }
//   else {
//     for (let i = 0; i < obslen; i++) {
//       stattrain[i].speed_y = 0.1;
//     }
//   }

//   if (!trn_fin) {
//     for (let i = 0; i < tracktrain; i++) {
//       strain[i].speed_y = 0.1;
//     }
//   }
//   else {
//     for (let i = 0; i < obslen; i++) {
//       strain[i].speed_y = 0.1;
//     }
//   }

//   if (!fence_fin) {
//     for (let i = 0; i < trackfence; i++) {
//       fence[i].speed_y = 0.1;
//     }
//   }
//   else {
//     for (let i = 0; i < obslen; i++) {
//       fence[i].speed_y = 0.1;
//     }
//   }

//   if (!coin_fin) {
//     for (let i = 0; i < trackcoins; i++) {
//       coins[i].speed_y = 0.1;
//     }
//   }
//   else {
//     for (let i = 0; i < obslen; i++) {
//       coins[i].speed_y = 0.1;
//     }
//   }

  
//   if (!jump_fin) {
//     for (let i = 0; i < trackjump; i++) {
//       boots[i].speed_y = 0.1;
//     }
//   }
//   else {
//     for (let i = 0; i < powerlen; i++) {
//       boots[i].speed_y = 0.1;
//     }
//   }


// }