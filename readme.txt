ESTA BASE DE DATOS SE USARA PARA UNA RED SOCIAL HECHA CON REACT
PARA QUE LA API FUNCIONE USAREMOS MONGODB CON MONGOCOMPASS
LIBRERIAS QUE USAREMOS: BCRYPT - MONGOOSE - EXPRESS - FS - PATH - JWT - MULTER

La estructura es la siguiente
Carpeta controllers: tendra los controladores de cada modelo de datos, y cada controlador tendra direntes metodos/acciones
Carpeta models: contendra todos los modelos de datos que guardaremos y con los que trabajaremos, usuarios, publicaciones, etc
Carpeta routes: contendra las rutas que se encargaran de hacer la peticion a la API pasandole parametros y el controlador con su accion y a veces middlewares
Carpeta middlewares: contendran los middlewares, softwares intermedios que se ejecutan antes de la peticion
Carpeta database: contiene la coneccion con nuestra base de datos 
Carpeta services: contendra servicios y funciones
Carpeta uploads: guarda los avatares de los usuarios 


EL FLUJO QUE SE INTENTA SEGUIR
MODELO: USER => METODO CONTROLADOR: REGISTER => RUTA: /REGISTER CON PARAMETROS OPCIONALES Y METODOS => DEVUELVE RESPUESTA
