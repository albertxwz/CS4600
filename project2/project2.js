// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	var transform = new Array( 1, 0, 0, 0, 1, 0, 0, 0, 1 );
	const rad = rotation * Math.PI / 180;
	transform[0] = scale * Math.cos( rad );
	transform[1] = - Math.sin( rad );
	transform[2] = positionX;
	transform[3] = Math.sin( rad );
	transform[4] = scale * Math.cos( rad );
	transform[5] = positionY;
	return Array( 1, 0, 0, 0, 1, 0, 0, 0, 1 );
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	var transform = new Array( 0, 0, 0, 0, 0, 0, 0, 0, 0 );
	for ( var i = 0; i < 3; ++i )
		for ( var j = 0; j < 3; ++j )
			for ( var k = 0; k < 3; ++k )
				transform[i * 3 + j] += trans1[i * 3 + k] * trans2[k * 3 + j];
	return transform;
}
