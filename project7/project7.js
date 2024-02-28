// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	const rotX = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];
	const rotY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];
	var mv = MatrixMult(trans, MatrixMult(rotY, rotX));
	return mv;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		this.prog = InitShaderProgram(vsMesh, fsMesh);
		gl.useProgram(this.prog);

		this.mvp = gl.getUniformLocation(this.prog, 'mvp');

		this.mv = gl.getUniformLocation(this.prog, 'mv');

		this.mvn = gl.getUniformLocation(this.prog, 'mvn');

		this.y_up = gl.getUniformLocation(this.prog, 'y_up');
		gl.uniform1i(this.y_up, true);

		this.pos = gl.getAttribLocation(this.prog, 'pos');
		this.posbuffer = gl.createBuffer();

		this.light = gl.getUniformLocation(this.prog, 'light');

		this.norm = gl.getAttribLocation(this.prog, 'norm');
		this.normbuffer = gl.createBuffer();

		this.alpha = gl.getUniformLocation(this.prog, 'alpha');

		// texture
		this.txc = gl.getAttribLocation(this.prog, 'txc');
		this.txcbuffer = gl.createBuffer();

		this.texture = gl.createTexture();
		this.sampler = gl.getUniformLocation(this.prog, 'tex');
		this.checkbox_show = true;
		this.is_texture_exist = false;
		this.show = gl.getUniformLocation(this.prog, 'show');
		gl.uniform1i(this.show, false);
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
		gl.useProgram(this.prog);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.txcbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.prog);
		gl.uniform1i(this.y_up, !swap);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);
		gl.uniformMatrix4fv(this.mvp, false, matrixMVP);
		gl.uniformMatrix4fv(this.mv, false, matrixMV);
		gl.uniformMatrix3fv(this.mvn, false, matrixNormal);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posbuffer);
		gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.pos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		gl.vertexAttribPointer(this.norm, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.norm);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.txcbuffer);
		gl.vertexAttribPointer(this.txc, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.txc);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		gl.generateMipmap(gl.TEXTURE_2D);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
		gl.uniform1i( this.sampler, 0 );
		this.is_texture_exist = true;
		gl.uniform1i( this.show, this.checkbox_show && this.is_texture_exist );
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog);
		this.checkbox_show = show;
		gl.uniform1i( this.show, this.checkbox_show && this.is_texture_exist );
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);
		gl.uniform3f(this.light, x, y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		gl.uniform1f(this.alpha, shininess);
	}
}

const vsMesh = `
	uniform bool y_up;
	attribute vec3 pos, norm;
	attribute vec2 txc;
	uniform mat4 mvp, mv;
	uniform mat3 mvn;
	varying vec3 n, p;
	varying vec2 texCoord;
	void main() {
		if (y_up) {
			gl_Position = mvp * vec4(pos, 1);
			p = vec3(mv * vec4(pos, 1));
			n = normalize(mvn * norm);
		}
		else {
			gl_Position = mvp * mat4(
				1, 0, 0, 0,
				0, 0, -1, 0,
				0, 1, 0, 0,
				0, 0, 0, 1
			) * vec4(pos, 1);
			p = vec3(mv * mat4(
				1, 0, 0, 0,
				0, 0, -1, 0,
				0, 1, 0, 0,
				0, 0, 0, 1
			) * vec4(pos, 1));
			n = normalize(mvn * mat3(
				1, 0, 0,
				0, 0, -1,
				0, 1, 0
			) * norm);
		}
		texCoord = txc;
	}
`;

const fsMesh = `
	precision mediump float;
	uniform sampler2D tex;
	uniform bool show;
	uniform float alpha;
	uniform vec3 light;
	varying vec3 n, p;
	varying vec2 texCoord;
	void main() {
		vec3 omega = normalize(light);
		float intensity = length(light);
		vec3 n_normed = normalize(n);
		vec3 v = -normalize(p);
		vec3 h = normalize(omega + v);
		gl_FragColor = intensity * (max(dot(omega, n_normed), 0.0) + pow(max(dot(h, n_normed), 0.0), alpha))
					* (show ? texture2D(tex, texCoord) : vec4(1, 1, 1, 1));
	}
`;


// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
function SimTimeStep( dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution )
{
	var forces = Array( positions.length ); // The total for per particle

	// [TO-DO] Compute the total force of each particle
	// init
	for (var i = 0; i < positions.length; ++i) {
		forces[i] = gravity.mul(particleMass);
	}
	// update spring force & damping force
	springs.forEach(spring => {
		const i = spring.p0, j = spring.p1, rest = spring.rest;
		const d = positions[i].sub(positions[j]).unit();
		const l = positions[i].sub(positions[j]).len();
		// spring force
		forces[i].inc(d.mul(stiffness * (rest - l)));
		forces[j].inc(d.mul(stiffness * (l - rest)));

		// damping force
		forces[i].inc(d.mul(- damping * velocities[i].sub(velocities[j]).dot(d)));
		forces[j].inc(d.mul(- damping * velocities[j].sub(velocities[i]).dot(d)));
	});
	
	// [TO-DO] Update positions and velocities
	for (var i = 0; i < positions.length; ++i) {
		if (massSpring.selVert == i) continue;
		const a = forces[i].div(particleMass);
		velocities[i] = velocities[i].add(a.mul(dt));
		positions[i] = positions[i].add(velocities[i].mul(dt));
	}
	
	// [TO-DO] Handle collisions
	for (var i = 0; i < positions.length; ++i) {

		if (positions[i].x < -1.0) {
			const h = - 1.0 - positions[i].x;
			positions[i].x = restitution * h - 1;
			velocities[i].x = - velocities[i].x * restitution;
		}
		if (positions[i].x > 1.0) {
			const h = positions[i].x - 1.0;
			positions[i].x = 1.0 - restitution * h;
			velocities[i].x = - velocities[i].x * restitution;
		}

		if (positions[i].y < -1.0) {
			const h = - 1.0 - positions[i].y;
			positions[i].y = restitution * h - 1;
			velocities[i].y = - velocities[i].y * restitution;
		}
		if (positions[i].y > 1.0) {
			const h = positions[i].y - 1.0;
			positions[i].y = 1.0 - restitution * h;
			velocities[i].y = - velocities[i].y * restitution;
		}

		if (positions[i].z < -1.0) {
			const h = - 1.0 - positions[i].z;
			positions[i].z = restitution * h - 1;
			velocities[i].z = - velocities[i].z * restitution;
		}
		if (positions[i].z > 1.0) {
			const h = positions[i].z - 1.0;
			positions[i].z = 1.0 - restitution * h;
			velocities[i].z = - velocities[i].z * restitution;
		}
	}
	
}

