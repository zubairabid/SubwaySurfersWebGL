/// <reference path="webgl.d.ts" />

let police = class {
    constructor(gl, pos, speed_z) {
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        this.width = 1;
        this.height = 0.2;
        this.length = 0.2;

        this.positions = [
             // Front face
            -this.width, -this.height, this.length,
            this.width, -this.height, this.length,
            this.width, this.height, this.length,
            -this.width, this.height, this.length,
            //Back Face
            -this.width, -this.height, -this.length,
            this.width, -this.height, -this.length,
            this.width, this.height, -this.length,
            -this.width, this.height, -this.length,
            //Top Face
            -this.width, this.height, -this.length,
            this.width, this.height, -this.length,
            this.width, this.height, this.length,
            -this.width, this.height, this.length,
            //Bottom Face
            -this.width, -this.height, -this.length,
            this.width, -this.height, -this.length,
            this.width, -this.height, this.length,
            -this.width, -this.height, this.length,
            //Left Face
            -this.width, -this.height, -this.length,
            -this.width, this.height, -this.length,
            -this.width, this.height, this.length,
            -this.width, -this.height, this.length,
            //Right Face
            this.width, -this.height, -this.length,
            this.width, this.height, -this.length,
            this.width, this.height, this.length,
            this.width, -this.height, this.length,
        ];

        this.rotation = 0;
        this.speed_x = 0;
        this.speed_y = 0;

        this.pos = pos;
        this.speed_z = speed_z;

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

        

        // The code for textures is similar to colours, but replacing
        this.texture = loadTexture(gl, 'lucioano.jpg');
        // console.log("Got texture loaded:", this.texture);

        const textureCoordinates = [
             // Front
             0.0,  1.0,
             1.0,  1.0,
             1.0,  0.0,
             0.0,  0.0,
             // Back
             0.0,  1.0,
             1.0,  1.0,
             1.0,  0.0,
             0.0,  0.0,
             // Top
             0.0,  1.0,
             1.0,  1.0,
             1.0,  0.0,
             0.0,  0.0,
             // Bottom
             0.0,  1.0,
             1.0,  1.0,
             1.0,  0.0,
             0.0,  0.0,
             // Right
             0.0,  1.0,
             1.0,  1.0,
             1.0,  0.0,
             0.0,  0.0,
             // Left
             0.0,  1.0,
             1.0,  1.0,
             1.0,  0.0,
             0.0,  0.0,
        ];


        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                        gl.STATIC_DRAW);



        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        
        const vertexNormals = [
            // Front
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
        
            // Back
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
        
            // Top
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
        
            // Bottom
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
        
            // Right
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
        
            // Left
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0
        ];
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
        gl.STATIC_DRAW);



        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.

        const indices = [
            0, 1, 2,    0, 2, 3, // front
            4, 5, 6,    4, 6, 7,
            8, 9, 10,   8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23, 
        ];

        // Now send the element array to GL

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);

        this.buffer = {
            position: this.positionBuffer,
            normal: normalBuffer,
            textureCoord: textureCoordBuffer,
            indices: indexBuffer,
        }

        
        // document.addEventListener('keyup', function (event) {
        //     if (event.defaultPrevented) {
        //         return;
        //     }
        
        //     var key = event.key || event.keyCode;
        
        //     if (key === 'ArrowRight' || key === 39) {
        //         console.log("right was hit");
        //         this.speed_x = 0.1;
        //         // this.move();
        //     }
        //     if (key === 'ArrowLeft' || key === 37) {
        //         console.log("left was hit");
        //         this.speed_x = -0.1;
        //         // this.move();
        //     }
        //     if (key === 'ArrowUp' || key === 38) {
        //         console.log("up was hit");
        //     }

        // });
    }

    move() {
        // console.log(this.speed_x);
        this.pos[2] += this.speed_z;

        if (this.speed_x != 0) {
            // console.log("Should move");
            this.pos[0] += this.speed_x;

            if (this.pos[0] > 2.1 || this.pos[0] < -2.1) {
                this.pos[0] -= this.speed_x;
            }
            // console.log(this.pos[0]);

            if (this.pos[0] == 0 || this.pos[0] == -2.1 || this.pos[0] == 2.1) {
                this.speed_x = 0;
            }
        }

        // if (this.speed_y >= 0 && this.pos[1] != -1.0) {
        //     this.pos[1] += this.speed_y;
        //     this.speed_y += 0.1;
        // }
        // else if (this.speed_y < 0) {
        //     this.pos[1] += this.speed_y;
        //     this.speed_y += 0.1;
        // }

        if (this.speed_y != 0) {
            this.pos[1] += this.speed_y;
            // console.log("In loop: ", this.pos[1]);
            this.speed_y -= 0.01;
            if (this.pos[1] <= -2.0) {
                this.speed_y = 0;
                this.pos[1] = -2.0;
            }
        }

    }

    drawCube(gl, projectionMatrix, programInfo, deltaTime) {
        this.move();
        const modelViewMatrix = mat4.create();
        mat4.translate(
            modelViewMatrix,
            modelViewMatrix,
            this.pos
        );
        
        //this.rotation += Math.PI / (((Math.random()) % 100) + 50);

        mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            this.rotation,
            [1, 1, 1]);

        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);


        // Tell WebGL how to pull out the normals from
        // the normal buffer into the vertexNormal attribute.
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.normal);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexNormal,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexNormal);
        }
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }

        // tell webgl how to pull out the texture coordinates from buffer
        {
            const num = 2; // every coordinate composed of 2 values
            const type = gl.FLOAT; // the data in the buffer is 32 bit float
            const normalize = false; // don't normalize
            const stride = 0; // how many bytes to get from one set to the next
            const offset = 0; // how many bytes inside the buffer to start from
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.textureCoord);
            gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 
                                    num, 
                                    type, 
                                    normalize, 
                                    stride, 
                                    offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
        }

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.indices);

        // Tell WebGL to use our program when drawing

        gl.useProgram(programInfo.program);

        // Set the shader uniforms

        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.normalMatrix,
            false,
            normalMatrix);

        
        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);

        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);


        {
            const vertexCount = 36;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }

    }
    
};

