//import { AdditiveBlending } from "../three.js/build/three";

// Ссылка на элемент веб страницы в котором будет отображаться графика
var container;
// Переменные "камера", "сцена" и "отрисовщик"
var camera, scene, renderer;
// Глобальная переменная для хранения карты высот 
var imagedata;
var N = 255;
var spotlight;
var sphere;

// Функция инициализации камеры, отрисовщика, объектов сцены и т.д.
init();
// Обновление данных по таймеру браузера
animate();

// В этой функции можно добавлять объекты и выполнять их первичную настройку
function init()
{
    // Получение ссылки на элемент html страницы
    container = document.getElementById( 'container' );
    // Создание "сцены"
    scene = new THREE.Scene();
    // Установка параметров камеры
    // 45 - угол обзора
    // window.innerWidth / window.innerHeight - соотношение сторон
    // 1 - 4000 - ближняя и дальняя плоскости отсечения
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000 );
    
    
    // Установка позиции камеры
    camera.position.set(N/1, N/1, N*2);
    // Установка точки, на которую камера будет смотреть
    camera.lookAt(new THREE.Vector3( N/2, 0.0, N/2));
    
    
    // Создание отрисовщика
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );

    // Закрашивание экрана синим цветом, заданным в 16ричной системе
    renderer.setClearColor( 0x001100, 1);
    
    container.appendChild( renderer.domElement );
    // Добавление функции обработки события изменения размеров окна
    window.addEventListener( 'resize', onWindowResize, false );

    var canvas = document.createElement('canvas'); 
    var context = canvas.getContext('2d'); 
    var img = new Image(); 
    
    img.onload = function() 
    {     canvas.width = img.width;     
        canvas.height = img.height;     
        context.drawImage(img, 0, 0 );     
        imagedata = context.getImageData(0, 0, img.width, img.height); 
    
        // Пользовательская функция генерации ландшафта     
        CreateTerrain(); 
    } 
    
    // Загрузка изображения с картой высот 
    img.src = 'plateau.jpg'; 

    spotlight = new THREE.PointLight(0xffffff);
    spotlight.position.set(N, N/1.7, N/2); 
    //добавление источника в сцену 
    scene.add(spotlight); 
    var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );
}

function onWindowResize()
{
    // Изменение соотношения сторон для виртуальной камеры
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // Изменение соотношения сторон рендера
    renderer.setSize( window.innerWidth, window.innerHeight );
}

var a = 0.0;
var b = 0.0;
// В этой функции можно изменять параметры объектов и обрабатывать действия пользователя
function animate()
{
    a += 0.01;
    b += 0.0025;

    // Добавление функции на вызов, при перерисовки браузером страницы
    requestAnimationFrame( animate );
    render();

    spotlight.position.x = N/2+N*Math.cos(a);
    spotlight.position.y = N*Math.sin(a);

    sphere.position.copy(spotlight.position);


    var x = N/2+2*N*Math.cos(b);
    var z = N/2+2*N*Math.sin(b);
        // Установка позиции камеры
        camera.position.set(x, N/1, z);


        // Установка точки, на которую камера будет смотреть
        camera.lookAt(new THREE.Vector3( N/2, 0.0, N/2));
}
function render()
{
    // Рисование кадра
    renderer.render( scene, camera );
}

function CreateTerrain()
{
    
    // Создание структуры для хранения вершин
    var geometry = new THREE.Geometry();
    // Добавление координат вершин в массив вершин
    for (var j = 0; j < N; j++)
    for (var i = 0; i < N; i++)
    {
        var h = getPixel( imagedata, i, j ); 
        geometry.vertices.push(new THREE.Vector3( i, h/5.0, j));
    }
    
        for (var j = 0; j < N-1; j++)
        for (var i = 0; i < N-1; i++)
        {
            var i1 = i + j*N;
            var i2 = (i+1) + j*N;
            var i3 = (i+1) + (j+1)*N;
            var i4 = i + (j+1)*N;

            //Добавление индексов (порядок соединения вершин) в массив индексов
            geometry.faces.push(new THREE.Face3(i1, i2, i3));
            geometry.faces.push(new THREE.Face3(i1, i3, i4));

            geometry.faceVertexUvs[0].push([new THREE.Vector2(i/(N-1), j/(N-1)),      new THREE.Vector2((i+1)/(N-1), j/(N-1)),      new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1))]); 
 
            geometry.faceVertexUvs[0].push([new THREE.Vector2(i/(N-1), j/(N-1)),      new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1)),      new THREE.Vector2(i/(N-1), (j+1)/(N-1))]); 
       
        }
    


    geometry.computeFaceNormals(); 
    geometry.computeVertexNormals(); 

    // Создание загрузчика текстур 
    var loader = new THREE.TextureLoader(); 
    // Загрузка текстуры grasstile.jpg из папки pics 
    var tex = loader.load( 'unnamed.jpg' );

    var mat = new THREE.MeshLambertMaterial
    ({     
        map:tex,     
        wireframe: false,     
        side:THREE.DoubleSide 
    }); 



    // Создание объекта и установка его в определённую позицию
    var triangleMesh = new THREE.Mesh(geometry, mat);
    triangleMesh.position.set(0.0, 0.0, 0.0);
    // Добавление объекта в сцену

    

    scene.add(triangleMesh);


}

function getPixel( imagedata, x, y ) 
{    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;     
    return data[ position ];; 
}