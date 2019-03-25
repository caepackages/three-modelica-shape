module.exports = { ModelicaShapeGeometry: function( THREE ){
  ModelicaShapeGeometry = function ( 
    type,
    length,
    width,
    height,
    extra,
    settings
  ) {

      THREE.BufferGeometry.call( this );

      this.type = 'ModelicaShapeGeometry';

      function createSpring (length, width, height, extra, pointsPerWinding = 10, segments = 5 ) {
          var TWO_PI = Math.PI * 2.0;
          extra = Math.max(1, extra);
          var ANGLE_INCR = Math.PI * 2.0 / pointsPerWinding;
          var coilWidth = height * 0.5;

          var x,z;
          var y = length * 0.5;
          var radius = width * 0.5;
          var n = 0;
          var yIncr = length / (TWO_PI / ANGLE_INCR * extra );
          var helix = [];

          for( var phi=0; phi <= TWO_PI * extra; phi+=ANGLE_INCR ) {
              x = Math.cos(phi) * radius;
              y -= yIncr;
              z = Math.sin(phi) * radius;

              helix.push( new THREE.Vector3(x, y + length * 0.5, z));
                
              n++;
          }

          var curve = new THREE.CatmullRomCurve3( helix );
          return new THREE.TubeGeometry( curve, n, coilWidth, segments, false );
      }  
      
      function getShapeGeometry (type, length, width, height, extra, settings ) {
        
        var segments = settings.segments !== undefined ? settings.segments : 8;
        segments = Math.max(segments, 8);
        var l = 1;
        var w = 1;
        var h = 1;
        
        switch(type) {
          case 'cone':
            // extra = diameter-left-side / diameter-right-side
            // extra = 1: cylinder
            // extra = 0: "real" cone
            var geometry = new THREE.CylinderGeometry(0.5, 0.5 * extra, l, segments, 1, false, 0.0, Math.PI * 2);
            geometry.applyMatrix(new THREE.Matrix4().makeRotationAxis ( new THREE.Vector3(0,0,1), Math.PI/2 ));
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation ( l * 0.5, 0, 0 ));
            //geometry.applyMatrix(new THREE.Matrix4().makeScale ( 1.0, w, h ));
            return geometry;
          case 'cylinder':
            return getShapeGeometry('cone', length, width, height, 1.0, settings);
          case 'pipecylinder':
            var geometry = new THREE.CylinderGeometry(0.5, 0.5, l, segments, 1, true, 0.0, Math.PI * 2);
            geometry.applyMatrix(new THREE.Matrix4().makeRotationAxis ( new THREE.Vector3(0,0,1), Math.PI/2 ));
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation ( l * 0.5, 0, 0 ));
            //geometry.applyMatrix(new THREE.Matrix4().makeScale ( 1.0, width, height ));
            return geometry;
          case 'pipe':
            // extra = outer-diameter / inner-diameter, i.e, 
            // extra = 1: cylinder that is completely hollow
            // extra = 0: cylinder without a hole.        

            var geometry = new THREE.CylinderGeometry(0.5, 0.5, l, segments, 1, true, 0.0, Math.PI * 2);
            var geometryInnerTorus = new THREE.CylinderGeometry(0.5 * extra, 0.5 * extra, l, segments, 1, true, 0.0, -Math.PI * 2);
            geometry.mergeMesh(new THREE.Mesh(geometryInnerTorus));
            
            var geometryRingFront = new THREE.RingGeometry( 0.5 * extra, 0.5, segments, 1, -Math.PI / segments * 0.0 ); // ok
            geometryRingFront.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI * 0.5));
            geometryRingFront.applyMatrix(new THREE.Matrix4().makeTranslation ( 0, l * 0.5, 0.0 ));

            var geometryRingBack = new THREE.RingGeometry( 0.5 * extra, 0.5, segments, 1, Math.PI / segments * 0.0);
            geometryRingBack.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));
            geometryRingBack.applyMatrix(new THREE.Matrix4().makeTranslation ( 0, -l * 0.5, 0.0 ));
            geometry.mergeMesh(new THREE.Mesh(geometryRingBack)); 
            geometry.mergeMesh(new THREE.Mesh(geometryRingFront));
            geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI * 0.5));
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation ( l * 0.5, 0.0, 0.0 ));
            //geometry.applyMatrix(new THREE.Matrix4().makeScale(1.0, w, h));
            return geometry;
          case 'sphere':
            var geometry = new THREE.SphereGeometry(0.5, segments, segments);
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation ( 0.5, 0, 0 ));
            return geometry;
          case 'beam':
            // half cylinder top
            var geometry = new THREE.CylinderGeometry(width * 0.5, width * 0.5, height, segments, 1, false, 0.0, Math.PI );
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation ( length, 0, 0 ));        
            // half cylinder bottom
            geometry.mergeMesh(new THREE.Mesh(new THREE.CylinderGeometry(width * 0.5, width * 0.5, height, segments, 1, false, Math.PI , Math.PI )));
            
            // planes
            for (var i = 0; i < 4; i += 1) {
              var plane = new THREE.PlaneGeometry(1, 1, 1, 1 )
              plane.applyMatrix(new THREE.Matrix4().makeTranslation ( 0.5, 0, 0.5 ));
              plane.applyMatrix(new THREE.Matrix4().makeRotationX(i* Math.PI * 0.5));
              plane.applyMatrix(new THREE.Matrix4().makeScale(length, height, width));
              geometry.mergeMesh(new THREE.Mesh(plane));
            }
                    
            geometry.applyMatrix(new THREE.Matrix4().makeRotationAxis ( new THREE.Vector3(1,0,0), Math.PI/2 ));
            
            return geometry;      
          case 'spring':
            var geometry = createSpring(length, width, height, extra, settings.pointsPerWinding, segments) ;
            geometry.applyMatrix(new THREE.Matrix4().makeRotationAxis ( new THREE.Vector3(0,0,1), -Math.PI/2 ));                 
            return geometry;
          case 'gearwheel':
            var delta = 0.05
            if (extra < 0) {
               return getShapeGeometry('pipe', length, width * (1 + delta), height * (1 + delta), (1 - delta), settings);     
            } else {
               return getShapeGeometry('pipe', length, width * (1 - delta), height * (1 - delta), (1 + delta), settings);     
            }
          case 'box':
            var geometry = new THREE.BoxGeometry(1,1,1);
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation ( 0.5, 0, 0 ))
            return geometry;
          default:
            // THREE geometry
            var geometry = eval('new ' + type) //e.g. type = 'THREE.BoxGeometry(1,2,3)';
            return geometry;        
        }
      }
      
      this.parameters = {
        type: type , 
        length: length , 
        width: width , 
        height: height, 
        extra: extra,
        settings: settings
      };
      
      settings = settings !== undefined ? settings : {segments: 5, pointsPerWinding: 15};

      var geo = getShapeGeometry (type, length, width, height, extra, settings);
      
      this.fromGeometry (geo);
    };

    ModelicaShapeGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
    ModelicaShapeGeometry.constructor = ModelicaShapeGeometry;

    return ModelicaShapeGeometry;
  },
  
  getModelicaShapeScale: function( THREE ){
    getModelicaShapeScale = function (shape, lenght, width, height) {
      var scaledShapeTypes = ['box', 'cylinder', 'pipe', 'cone', 'pipecylinder', 'sphere'];
      
      if (scaledShapeTypes.indexOf(shape) > -1) {
        // aviod warning "can't invert matrix"
        var delta = 0.00000001;
        return new THREE.Vector3( lenght + delta, width + delta, height + delta  );
      } else {
        return new THREE.Vector3( 1, 1, 1 );
      }
    }
    return getModelicaShapeScale;
  },

  getModelicaShapeMaterial: function( THREE ){
    getModelicaShapeMaterial = function (shape, red, green, blue, transparency, specular, extra, wireframe = false) {    
    var side = THREE.FrontSide;
    if (shape == 'pipecylinder') {
      side = THREE.DoubleSide;
    }
    
    var mat = new THREE.MeshPhongMaterial({color: new THREE.Color(red, green, blue), wireframe: wireframe, side: side, shininess: specular * 100.0});

    if ((shape == 'cylinder' || shape == 'pipecylinder') && extra > 0.5) {
      var size = 32;
      var data = new Uint8Array( 3 * size * size);

      var r = Math.max( Math.min(red * 255, 255), 0);
      var g = Math.max( Math.min(green * 255, 255), 0);
      var b = Math.max( Math.min(blue * 255, 255), 0);

      var i = 0;
      for ( var x = 0; x < size; x += 1 ) {
        for ( var y = 0; y < size; y += 1 ) {
            if ( y == 0 ) {
              var stride = i * 3;
              data[ stride ] = 0;
              data[ stride + 1 ] = 0;
              data[ stride + 2 ] = 0;
              } else {    
              var stride = i * 3;
              data[ stride ] = r;
              data[ stride + 1 ] = g;
              data[ stride + 2 ] = b;          
            }
        i++;
      }}

      var texture = new THREE.DataTexture( data, size, size, THREE.RGBFormat );
      texture.needsUpdate = true;
      
      var textureMaterial = new THREE.MeshPhongMaterial({wireframe: wireframe, map: texture, side: side, shininess: specular * 100.0});
      if (shape == 'cylinder') {
        return [textureMaterial, mat, mat];
      } else {
        return textureMaterial;
      }  
    }

    return mat;
    }
    return getModelicaShapeMaterial;
  }
}
