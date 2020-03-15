# three-modelica-shape

## NPM

```
npm i three-modelica-shape
```

## Example

```javascript
// index.js
var THREE = require('three')
var ModelicaShapeGeometry = require('three-modelica-shape').ModelicaShapeGeometry(THREE)
var getModelicaShapeMaterial = require('three-modelica-shape').getModelicaShapeMaterial(THREE)
var getModelicaShapeScale = require('three-modelica-shape').getModelicaShapeScale(THREE)

var shape = 'box';
var red = 1.0;
var green = 0.0;
var blue = 0.0;
var transparency = 0.0;
var specular = 1.0;
var extra = 0.5;
var length = 1.5;
var width = 1;
var height = 1;

var material = getModelicaShapeMaterial(shape, red, green, blue, transparency, specular, extra, true);    
var box = new THREE.Mesh( new ModelicaShapeGeometry( shape, length , width , height , extra ) , material);
var scale = getModelicaShapeScale(shape, length , width , height );
box.scale.set(scale.x, scale.y, scale.z);
```

## License
```
(c) Copyright 2020 Frank Rettig, all rights reserved.
```
