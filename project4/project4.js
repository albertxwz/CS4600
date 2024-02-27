// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var mvp = MatrixMult( projectionMatrix, trans );
	var rot = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];
	mvp = MatrixMult( mvp, rot );
	rot = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];
	mvp = MatrixMult( mvp, rot );
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		this.prog = InitShaderProgram( meshVS, meshFS );
		this.pos = gl.getAttribLocation( this.prog, 'pos' );
		this.txc = gl.getAttribLocation( this.prog, 'txc' );
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );
		this.show = gl.getUniformLocation( this.prog, 'show' );
		this.swap = gl.getUniformLocation( this.prog, 'swap' );
		this.checkbox_show = true;
		this.is_texture_exist = false;
		gl.useProgram( this.prog );
		gl.uniform1i( this.show, false );
		gl.uniform1i( this.swap, false );

		this.texture = gl.createTexture();
		this.sampler = gl.getUniformLocation( this.prog, 'tex' );

		this.tribuffer = gl.createBuffer();
		this.txcbuffer = gl.createBuffer();
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
		gl.useProgram( this.prog );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.tribuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.txcbuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW );
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram( this.prog );
		gl.uniform1i( this.swap, swap );
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram( this.prog );

		gl.uniformMatrix4fv( this.mvp, false, trans );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.tribuffer );
		gl.vertexAttribPointer( this.pos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.pos );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.txcbuffer );
		gl.vertexAttribPointer( this.txc, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.txc );

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		gl.useProgram( this.prog );
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture( gl.TEXTURE_2D, this.texture );

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		gl.generateMipmap( gl.TEXTURE_2D );

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
		this.checkbox_show = show;
		gl.useProgram( this.prog );
		gl.uniform1i( this.show, this.checkbox_show && this.is_texture_exist );
	}
	
}

var meshVS = `
	uniform bool swap;
	uniform mat4 mvp;
	attribute vec3 pos;
	attribute vec2 txc;
	varying vec2 texCoord;
	void main() {
		if ( !swap )
			gl_Position = mvp * vec4(pos, 1);
		else {
			gl_Position = mvp * mat4(
				1.0, 0.0, 0.0, 0.0,
				0.0, 0.0, -1.0, 0.0,
				0.0, 1.0, 0.0, 0.0,
				0.0, 0.0, 0.0, 1.0
			) * vec4(pos, 1);
		}
		texCoord = txc;
	}
`;


var meshFS = `
	precision mediump float;
	uniform bool show;
	uniform sampler2D tex;
	varying vec2 texCoord;
	void main() {
		if ( show )
			gl_FragColor = texture2D( tex, texCoord );
		else
			gl_FragColor = vec4(1, 0, 0, 1);
	}
`;
