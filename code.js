// JAVASCRIPT RAY TRACING ENGINE
// ALL CODE WRITTEN BY MATT LAMBORNE


// SCENES
var scenes = {
              'Scene 1':{
              'spheres':
              [
              {'position':[400, 200, 700], 'radius':250, 'color':[255, 0, 0], 'diffuse':0.7, 'k':40, 'reflectivity':0.95}, 
              {'position':[0, 10000450, 0], 'radius':10000000, 'color':[200, 175, 125], 'diffuse':0.9, 'k':30, 'reflectivity':0.9}, // the ground is a huge sphere, not a plane.
              {'position':[0, 350, 600], 'radius':100, 'color':[255, 0, 255], 'diffuse':0.7, 'k':40, 'reflectivity':0.95}
              ], 
              'triangles':[]
              }, 
               
              'Marbles':[{'position':[500, -100, 800], 'radius':550, 'color':[200, 200, 200], 'diffuse':0.7, 'k':60, 'reflectivity':1}, 
              {'position':[0, 10000450, 0], 'radius':10000000, 'color':[200, 175, 125], 'diffuse':0.9, 'k':30, 'reflectivity':0.9},
              {'position':[100, 400, 600], 'radius':50, 'color':[255, 0, 255], 'diffuse':0.7, 'k':40, 'reflectivity':0.65},
              {'position':[50, 400, 250], 'radius':50, 'color':[255, 255, 0], 'diffuse':0.7, 'k':40, 'reflectivity':0.95},
              {'position':[300, 400, 200], 'radius':50, 'color':[0, 255, 255], 'diffuse':0.7, 'k':40, 'reflectivity':0.65},
              {'position':[-300, 400, 700], 'radius':50, 'color':[0, 255, 0], 'diffuse':0.7, 'k':40, 'reflectivity':0.95},
              {'position':[-100, 400, 600], 'radius':50, 'color':[255, 0, 0], 'diffuse':0.7, 'k':40, 'reflectivity':0.65},
              {'position':[-50, 400, 900], 'radius':50, 'color':[0, 0, 255], 'diffuse':0.7, 'k':40, 'reflectivity':0.95},
              {'position':[-250, 400, 400], 'radius':50, 'color':[0, 255, 100], 'diffuse':0.7, 'k':40, 'reflectivity':0.65},
              {'position':[-200, 400, 500], 'radius':50, 'color':[100, 255, 0], 'diffuse':0.7, 'k':40, 'reflectivity':0.95}
              ],

              'Random Marbles':[{'position':[500, -100, 800], 'radius':550, 'color':[200, 200, 200], 'diffuse':0.7, 'k':60, 'reflectivity':1}, 
              {'position':[0, 10000450, 0], 'radius':10000000, 'color':[200, 175, 125], 'diffuse':0.9, 'k':30, 'reflectivity':0.9}
              
              ]
              }; //dictionary of premade scenes to choose from 
// each scene is a list of spheres, each sphere is a dictionary containing all the parameters: position, radius, color, diffuse valuse, specular k value, and reflectivity
              
setProperty("Scenes", "options", Object.keys(scenes)); //sets the dropdown to the scenes list
var spheres = scenes[getText("Scenes")];
onEvent("Scenes", "change", function(){ //choose the selected scene
  if (getText('Scenes') == 'Random Marbles'){
    scenes['Random Marbles'] = [{'position':[500, -100, 800], 'radius':550, 'color':[200, 200, 200], 'diffuse':0.7, 'k':60, 'reflectivity':1}, 
    {'position':[0, 10000450, 0], 'radius':10000000, 'color':[200, 175, 125], 'diffuse':0.9, 'k':30, 'reflectivity':0.9}
    ];
    for(var i = 0; i < 40; i++){
      appendItem(scenes['Random Marbles'], {'position':[randomNumber(-800, 800), 400, randomNumber(50, 2000)], 'radius':50, 'color':[randomNumber(0, 255), randomNumber(0, 255), randomNumber(0, 255)], 'diffuse':0.7, 'k':40, 'reflectivity':0.8},)
    }
  }
  spheres = scenes[getText("Scenes")];
});

// GLOBAL CONSTANTS
// 0,0,0 is upper left corner of viewing plane
var max_depth = 3; //reflection function is recursive, this is the max amount of reflections a specific ray can make
var px_size = 1; //default pixel size
var camera_position = [160, 160, -200]; 
var light_position = [-300, -500, -700];
var light_color = [255, 255, 255];
var ambient_mult = 0.1; //multiplier for the level of ambient lighting that illuminates everything, including shadows
var square_color_1 = [125, 86, 0]; //secondary color for checkerboard sphere

// VECTOR OPERATIONS 
function dot_product(v0, v1){ //returns dot product of two vectors
  return(v0[0]*v1[0]+ v0[1]*v1[1]+ v0[2]*v1[2]);
}
function normalize(v){ //returns a vaector with magnitude 1
  var m = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
  return([v[0]/m, v[1]/m, v[2]/m]);
}
function mult_int(v0, i){ //multiplies vector by int
  return([v0[0]*i, v0[1]*i, v0[2]*i]);
}
function add(v0, v1){
  return([v0[0]+v1[0], v0[1]+v1[1], v0[2]+v1[2]]);
}
function subt(v0, v1){
  return([v0[0]-v1[0], v0[1]-v1[1], v0[2]-v1[2]]);
}

// RAY TRACING FUNCTIONS 
function ray_intersection(dest, orig, depth, sph, reflectivity, color){ //recursively calculate the color of a pixel by casting a ray from the camera to the viewing plane
  depth++;
  if (depth > max_depth){ //determine if recursion limit was exceeded
    return(color);
  }
  var sphere_position; //declare out of for loop as they will be used after it
  var sphere_radius;
  var r;
  var r_dir;
  var p = [1000000, 0];
  for(var sphere = 0; sphere < spheres.length; sphere++){ //test the given ray to see if it intersects with each sphere, and if it does, select the closest sphere.
    if(sphere === sph){ //skip the sphere the ray bounced off of
      continue;
    }
  sphere_position = spheres[sphere].position; 
  sphere_radius = spheres[sphere].radius;
  r = subt(dest, orig); //ray going from point of reflection or camera to the destination
  r_dir = normalize(r); //direction of r as normalized vector
  var sph_to_ray = subt(orig, sphere_position);
  var b = 2*dot_product(r_dir, sph_to_ray); 
  var c = dot_product(sph_to_ray, sph_to_ray)-sphere_radius*sphere_radius;
  var disc = b*b - 4*c; //discriminant of the quadratic formula determines if the ray intersects a sphere
  if (disc < 0){ //if it doesn't intersect, go to the next sphere.
      continue;
  }
  var pp = (-1*b-Math.sqrt(disc))/2; //p is the distance that it intersects. we want to display the nearest sphere, so it will update p if the p for the given sphere is smaller than the current min.
    if (pp > 0 && pp < p[0]){ //since the ray goes forward, ignore spheres it intersects with in a negative direction.
      p = [pp, sphere, r_dir, r, sphere_position];
    }
  }
  if(p[0] == 1000000){ //max view distance. if it stays at this number, the ray does not intersect any spheres
    return(color);
  }
  
  sphere = p[1];
  r_dir = p[2];
  r = p[3];
  sphere_position = p[4]; //manipulate p to get the variables of the nearest sphere
  p = p[0];
  var hcolor = [];
  var ipoint = add(orig, mult_int(r_dir, p)); //find the point at which the ray intersects
  
  if (sphere === 1 && (Math.floor(Math.abs(ipoint[0]/150+1000)))%2 === Math.floor(Math.abs(ipoint[2]/150))%2){ // if it is the "ground" sphere, add the checkerboard pattern.
      hcolor = square_color_1;
  }
  else{
   hcolor = spheres[sphere].color;
  }
  if(inShadow(ipoint, sphere)){ //if the point of intersection is in shadow, return the current color plus the ambient lighting of the intersection point
    return(add(color, mult_int(hcolor, ambient_mult)));
  }
  var sphere_diffuse = spheres[sphere].diffuse;
  var sphere_specular_k = spheres[sphere].k;
  if(sph != -1){
    reflectivity *= spheres[sph].reflectivity;  //multiply the total reflectivity so it affects the return color the right amount
    
  }
  
  //calculate necessary vectors. I got the specular and diffuse equations off wikipedia.
  var light_norm = normalize(subt(light_position, ipoint));
  var surface_norm = normalize(mult_int(subt(sphere_position, ipoint), -1));
  //diffuse shading with Lambert model https://en.wikipedia.org/wiki/Lambertian_reflectance
  var diffuse = mult_int(hcolor, sphere_diffuse*Math.max(dot_product(light_norm, surface_norm), 0));
  var diff = add(mult_int(hcolor, ambient_mult), diffuse);
  //specular shading with Blinn-Phong model https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model
  var h = normalize(subt(light_norm, r_dir));
  var s = mult_int(light_color, Math.pow(Math.max(dot_product(surface_norm, h), 0), sphere_specular_k));
  var col = add(mult_int(add(diff, s), Math.pow(reflectivity, depth)), color);
  //recursively calculate reflection color  
  var R = subt(r, mult_int(surface_norm, dot_product(r, surface_norm)*2)); //calculate the angle of reflection
  return(ray_intersection(add(R,ipoint), ipoint, depth, sphere, reflectivity, col)); //now cast a new ray from the point of intersection and add the resultant to the color this ray hit at.
}

function inShadow(ipoint, sph){ //determine if a point is in shadow by seeing if the line from it to the light intersects a sphere
  for(var sphere = 0; sphere < spheres.length; sphere++){
    if (sphere == sph){
      continue; //a sphere cannot cast a shadow on itself.
    }
    var sphere_position = spheres[sphere].position; 
    var sphere_radius = spheres[sphere].radius;
    var r_dir = normalize(subt(light_position, ipoint));
    var sph_to_ray = subt(ipoint, sphere_position);
    var b = 2*dot_product(r_dir, sph_to_ray);
    var c = dot_product(sph_to_ray, sph_to_ray)-sphere_radius*sphere_radius;
    var disc = b*b - 4*c;
    if (disc < 0){ 
      continue;
    }
    if ((-1*b-Math.sqrt(disc))/2 > 0){
      return(true);
    }
  }
  return(false);
}

// RENDER
function render() { //draw onto the canvas by using canvas coordinates as destination vectors for the ray function
  if (getText('Scenes') == 'Random Marbles'){
    scenes['Random Marbles'] = [{'position':[500, -100, 800], 'radius':550, 'color':[200, 200, 200], 'diffuse':0.7, 'k':60, 'reflectivity':1}, 
    {'position':[0, 10000450, 0], 'radius':10000000, 'color':[200, 175, 125], 'diffuse':0.9, 'k':30, 'reflectivity':0.9}
    ];
    for(var i = 0; i < 40; i++){
      appendItem(scenes['Random Marbles'], {'position':[randomNumber(-800, 800), 400, randomNumber(50, 2000)], 'radius':50, 'color':[randomNumber(0, 255), randomNumber(0, 255), randomNumber(0, 255)], 'diffuse':0.7, 'k':40, 'reflectivity':0.8})
    }
  }
  spheres = scenes[getText("Scenes")];
  var start = getTime();
  setActiveCanvas("canvas");
  var imgData = getImageData(0, 0, 320, 320);
  for (var x = 0; x < 320; x+=px_size){
    for (var y = 0; y < 320; y+=px_size){
      var c = ray_intersection([x, y, 0], camera_position, 0, -1, 1, [0,0,0]); //since in whatever EMCAScript version code.org uses there are no default paramerter values, they are all declared here.
      for (var ty = 0; ty < px_size; ty++){ //draw as chunks of px_size
        for (var tx = 0; tx < px_size; tx++){
          setRGB(imgData, x+tx, y+ty, c[0], c[1], c[2]);
        }
      }
    

  }
    putImageData(imgData, 0, 0);
  }      
  
  return(getTime()-start); //display the time taken
}



onEvent("button1", "click", function( ) { //update the pixel size
px_size = getNumber('px');
setText("label1", "Render Time: "+render()/1000+"s");
});

onEvent("button2", "click", function( ) {
setScreen("screen1")});
onEvent("button4", "click", function( ) {
  open("https://studio.code.org/projects/applab/0Y1kM-HrVZ6oJEh0fnkOVrhE65nOvhk8Kr-HUqdFfJA");
  
});