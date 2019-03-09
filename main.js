var cubeRotation = 0.0;

main();

//
// Start here
//

var c;
var c1;


function main() {


  canvas = document.querySelector('#glcanvas');
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  
  speed_z = 0.02;
  dist = 0;
  renderlen = 20;
  tracktrk = 0;
  trackside = 0;

  trk = [];
  side = [];
  init();

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  const vsSourceText = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  const fsSourceText = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const shaderProgramText = initShaderProgram(gl, vsSourceText, fsSourceText);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  const programInfoText = {
    program: shaderProgramText,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramText, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgramText, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramText, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramText, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgramText, 'uSampler'),
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
  
      trk[tracktrk] = new track(gl, [0.0, -1.7, -38.0], speed_z);
      side[trackside] = new sidewall(gl, [-3.0, 0.3, -38.0], speed_z);
      
      dist = 0;
    }


    drawScene(gl, programInfoText, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}



function init() {
  player = new player(gl, [0.0, -1.0, -6.0], 0)
  for (let i = 0; i < renderlen; i++) {
    trk[i] = new track(gl, [0.0, -1.7, -2*i], speed_z);
    side[i] = new sidewall(gl, [-3.0, 0.3, -2*i], speed_z);
  }
}


//
// Draw the scene.
//
function drawScene(gl, programInfo, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
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
  var cameraPosition = [
    cameraMatrix[12],
    cameraMatrix[13],
    cameraMatrix[14],
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
      player.speed_x = 0.5;
      // this.move();
  }
  if (key === 'ArrowLeft' || key === 37) {
      console.log("left was hit");
      player.speed_x = -0.5;
      // this.move();
  }
  if (key === 'ArrowUp' || key === 38) {
      console.log("up was hit");
      if (player.pos[1] == -1.0) {
        player.speed_y = 0.2;
      }
  }

});