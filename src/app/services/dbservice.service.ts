import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Rol } from './User/rol';
import { Pregunta } from './User/pregunta';
import { Usuario } from './User/usuario';
import { Region } from './Direction/region';
import { Comuna } from './Direction/comuna';
import { Direccion } from './Direction/direccion';
import { Categoria } from './Product/categoria';
import { Producto } from './Product/producto';
import { Detalle } from './Purchase/detalle';
import { Compra } from './Purchase/compra';

@Injectable({
  providedIn: 'root'
})
export class DbserviceService {
  // variable para guardar la conexión a la DB
  public database!: SQLiteObject;

  tablaRol: string = "CREATE TABLE IF NOT EXISTS rol (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(120) NOT NULL;)";
  tablaPregunta: string = "CREATE TABLE IF NOT EXISTS pregunta (id INTEGER PRIMARY KEY AUTOINCREMENT, pregunta VARCHAR(120) NOT NULL;)";
  tablaUsuario: string = "CREATE TABLE IF NOT EXISTS usuario (id INTEGER PRIMARY KEY AUTOINCREMENT, rut VARCHAR(9) NOT NULL, dvrut VARCHAR(1) NOT NULL, nombre VARCHAR(60) NOT NULL, apellido_pa  VARCHAR(60) NOT NULL, apellido_ma  VARCHAR(60) NOT NULL, telefono VARCHAR(9) NOT NULL, correo VARCHAR(40) NOT NULL, clave VARCHAR(30) NOT NULL, respuesta VARCHAR(30) NOT NULL, rol INTEGER, pregunta INTEGER, FOREIGN KEY (rol) REFERENCES Rol(id), FOREIGN KEY (pregunta) REFERENCES Pregunta(id);)";

  tablaRegion: string = "CREATE TABLE IF NOT EXISTS region (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(60) NOT NULL;)";
  tablaComuna: string = "CREATE TABLE IF NOT EXISTS comuna (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(60) NOT NULL, cost_envio INTEGER NOT NULL, region INTEGER, FOREIGN KEY (region) REFERENCES Region(id);)";
  tablaDireccion: string = "CREATE TABLE IF NOT EXISTS direccion (id INTEGER PRIMARY KEY AUTOINCREMENT, calle VARCHAR(40) NOT NULL, numero INTEGER NOT NULL, cod_postal INTEGER NOT NULL, comuna INTEGER, usuario INTEGER, FOREIGN KEY (comuna) REFERENCES Comuna(id), FOREIGN KEY (usuario) REFERENCES Usuario(id);)";

  tablaCategoria: string = "CREATE TABLE IF NOT EXISTS categoria (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(60) NOT NULL;)";
  tablaProducto: string = "CREATE TABLE IF NOT EXISTS producto (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(120) NOT NULL, descripcion VARCHAR(600) NOT NULL, precio INTEGER NOT NULL, stock INTEGER NOT NULL, foto TEXT NOT NULL, categoria INTEGER, FOREIGN KEY (categoria) REFERENCES Categoria(id);)";

  tablaDetalle: string = "CREATE TABLE IF NOT EXISTS detalle (id INTEGER PRIMARY KEY AUTOINCREMENT, cantidad INTEGER NOT NULL, subtotal INTEGER NOT NULL, producto INTEGER,FOREIGN KEY (producto) REFERENCES Detalle(id);)";
  tablaCompra: string = "CREATE TABLE IF NOT EXISTS compra (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(60) NOT NULL, fech_compra DATE NOT NULL, fech_despacho DATE NOT NULL, fech_entrega DATE NOT NULL, costo_desp INTEGER NOT NULL, total INTEGER NOT NULL, carrito BOOLEAN NOT NULL, estado VARCHAR(30) NOT NULL, detalle INTEGER, FOREIGN KEY (detalle) REFERENCES Detalle(id);)";

  //variables para guardar los observables
  actualizarDB = new BehaviorSubject([]);

  //observable para manipular el estado de la DB
  private isdDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqlite: SQLite,
    private platform: Platform,
    private alertController: AlertController) {
    this.crearDB();
  }


  //-------------------------------------- ---//
  /* FUNCIONES PARA TRBAJAR CON LA TABLA ROL */
  //-----------------------------------------//

  buscarRol() {
    return this.database.executeSql('SELECT * FROM rol', []).then(res => {
      //variable para almacenar los registros
      let items: Rol[] = [];

      //validamos la cantidad de registros
      if (res.rows.length > 0) {
        //recorrer el arreglo items
        for (var i = 0; i < res.rows.length; i++) {
          //Guardar dentro de la variable
          items.push({
            id: res.rows.item(i).id,
            nombre: res.rows.item(i).nombre
          })
        }
      }
      //Actualizamos el observable
      this.actualizarDB.next(items as any);
    }).catch(e => {
      this.presentAlert("Error de buscar en Base de datos (Tabla Rol): " + e);
    })
  }

  //----------------------------------------------//
  /* FUNCIONES PARA TRBAJAR CON LA TABLA PREGUNTA */
  //----------------------------------------------//

  buscarPregunta() {
    return this.database.executeSql('SELECT * FROM pregunta', []).then(res => {
      //variable para almacenar los registros
      let items: Pregunta[] = [];

      //validamos la cantidad de registros
      if (res.rows.length > 0) {
        //recorrer el arreglo items
        for (var i = 0; i < res.rows.length; i++) {
          //Guardar dentro de la variable
          items.push({
            id: res.rows.item(i).id,
            pregunta: res.rows.item(i).pregunta
          })
        }
      }
      //Actualizamos el observable
      this.actualizarDB.next(items as any);
    }).catch(e => {
      this.presentAlert("Error de buscar en Base de datos (Tabla Pregunta): " + e);
    })
  }

  //------------------------------------------//
  /* FUNCIONES PARA TRABAJAR LA TABLA USUARIO */
  //------------------------------------------//

  buscarUsuario() {
    return this.database.executeSql('SELECT * FROM usuario', []).then(res => {
      //variable para almacenar los registros
      let items: Usuario[] = [];

      //validamos la cantidad de registros
      if (res.rows.length > 0) {
        //recorrer el arreglo items
        for (var i = 0; i < res.rows.length; i++) {
          //Guardar dentro de la variable
          items.push({
            id: res.rows.item(i).id,
            rut: res.rows.item(i).rut,
            dvrut: res.rows.item(i).dvrut,
            nombre: res.rows.item(i).nombre,
            apellido_pa: res.rows.item(i).apellido_pa,
            apellido_ma: res.rows.item(i).apellido_ma,
            telefono: res.rows.item(i).telefono,
            correo: res.rows.item(i).correo,
            clave: res.rows.item(i).clave,
            respuesta: res.rows.item(i).respuesta,

            //Datos Foraneos
            rol: res.rows.item(i).rol,
            pregunta: res.rows.item(i).pregunta,
          })
        }
      }
      //Actualizamos el observable
      this.actualizarDB.next(items as any);
    }).catch(e => {
      this.presentAlert("Error de buscar en Base de datos (Tabla Usuario): " + e);
    })
  }

  agregarUsuario(rut: any, dvrut: any, nombre: any, apellido_pa: any, apellido_ma: any, telefono: any, correo: any, clave: any, respuesta: any, rol: any, pregunta: any) {
    return this.database.executeSql('INSERT INTO usuario (titulo,texto) VALUES (?,?,?,?,?,?,?,?,?,?,?);', [rut, dvrut, nombre, apellido_pa, apellido_ma, telefono, correo, clave, respuesta, rol, pregunta]).then(res => {
      this.buscarUsuario();
    }).catch(e => {
      this.presentAlert("Error de agregar nuevos datos Base de datos (Tabla Usuario): " + e);
    })
  }

  actualizarUsuario(id: any, rut: any, dvrut: any, nombre: any, apellido_pa: any, apellido_ma: any, telefono: any, correo: any, clave: any, respuesta: any, rol: any, pregunta: any) {
    return this.database.executeSql('UPDATE usuario SET rut=?, dvrut=?, nombre=?, apellido_pa=?, apellido_ma=?, telefono=?, correo=?, clave=?, respuesta=?, rol=?, pregunta=?  WHERE id=?;', [rut, dvrut, nombre, apellido_pa, apellido_ma, telefono, correo, clave, respuesta, rol, pregunta, id]).then(res => {
      this.buscarUsuario();
    }).catch(e => {
      this.presentAlert("Error al actualizar datos en la base de datos (Tabla Usuario): " + e);
    })
  }

  borrarUsuario(id: any) {
    return this.database.executeSql('DELETE FROM usuario WHERE id=?;', [id]).then(res => {
      this.buscarUsuario();
    }).catch(e => {
      this.presentAlert("Error al borrar datos en la base de datos (Tabla Usuario): " + e);
    })
  }

  //--------------------------------------------//
  /* FUNCIONES PARA TRBAJAR CON LA TABLA REGION */
  //--------------------------------------------//

  buscarRegion() {
    return this.database.executeSql('SELECT * FROM region', []).then(res => {
      //variable para almacenar los registros
      let items: Region[] = [];

      //validamos la cantidad de registros
      if (res.rows.length > 0) {
        //recorrer el arreglo items
        for (var i = 0; i < res.rows.length; i++) {
          //Guardar dentro de la variable
          items.push({
            id: res.rows.item(i).id,
            nombre: res.rows.item(i).nombre
          })
        }
      }
      //Actualizamos el observable
      this.actualizarDB.next(items as any);
    }).catch(e => {
      this.presentAlert("Error de buscar en Base de datos (Tabla Region): " + e);
    })
  }

  //--------------------------------------------//
  /* FUNCIONES PARA TRBAJAR CON LA TABLA COMUNA */
  //--------------------------------------------//

  buscarComuna() {
    return this.database.executeSql('SELECT * FROM comuna', []).then(res => {
      //variable para almacenar los registros
      let items: Comuna[] = [];

      //validamos la cantidad de registros
      if (res.rows.length > 0) {
        //recorrer el arreglo items
        for (var i = 0; i < res.rows.length; i++) {
          //Guardar dentro de la variable
          items.push({
            id: res.rows.item(i).id,
            nombre: res.rows.item(i).nombre,
            cost_envio: res.rows.item(i).cost_envio,

            //Foranea
            region: res.rows.item(i).region
          })
        }
      }
      //Actualizamos el observable
      this.actualizarDB.next(items as any);
    }).catch(e => {
      this.presentAlert("Error de buscar en Base de datos (Tabla Comuna): " + e);
    })
    /* “Porque ninguna cosa es imposible para Dios.” (Lucas 1:37) */
  }

  //-----------------------------------------------//
  /* FUNCIONES PARA TRABAJAR CON LA TABLA DIRECCION*/
  //-----------------------------------------------//

  buscarDireccion() {
    return this.database.executeSql('SELECT * FROM direccion', []).then(res => {
      //variable para almacenar los registros
      let items: Direccion[] = [];

      //validamos la cantidad de registros
      if (res.rows.length > 0) {
        //recorrer el arreglo items
        for (var i = 0; i < res.rows.length; i++) {
          //Guardar dentro de la variable
          items.push({
            id: res.rows.item(i).id,
            calle: res.rows.item(i).calle,
            numero: res.rows.item(i).numero,
            cod_postal: res.rows.item(i).cost_envio,

            //Foranea
            comuna: res.rows.item(i).comuna,
            usuario: res.rows.item(i).usuario
          })
        }
      }
      //Actualizamos el observable
      this.actualizarDB.next(items as any);
    }).catch(e => {
      this.presentAlert("Error de buscar en Base de datos (Tabla Direccion): " + e);
    })
  }

  agregarDireccion(calle: any, numero: any, cod_postal: any, comuna: any, usuario: any) {
    return this.database.executeSql('INSERT INTO direccion (calle,numero,cod_postal,comuna,usuario) VALUES (?,?,?,?,?);', [calle, numero, cod_postal, comuna, usuario]).then(res => {
      this.buscarDireccion();
    }).catch(e => {
      this.presentAlert("Error de agregar nuevos datos Base de datos (Tabla Direccion): " + e);
    })
  }

  actualizarDireccion(id: any, calle: any, numero: any, cod_postal: any, comuna: any, usuario: any) {
    return this.database.executeSql('UPDATE usuario SET calle=?, numero=?, cod_postal=?, comuna=?, usuario=? WHERE id=?;', [calle, numero, cod_postal, comuna, usuario, id]).then(res => {
      this.buscarDireccion();
    }).catch(e => {
      this.presentAlert("Error al actualizar datos en la base de datos (Tabla Direccion): " + e);
    })
  }

  /* FUNCIONES VARIAS */
  /* TENGO EL CEREBRO FRITO */

  dbState() {
    return this.isdDBReady.asObservable();
  }

  // USER
  fetchRol(): Observable<Rol[]> {
    return this.actualizarDB.asObservable();
  }

  fetchPregunta(): Observable<Pregunta[]> {
    return this.actualizarDB.asObservable();
  }

  fetchUsuario(): Observable<Usuario[]> {
    return this.actualizarDB.asObservable();
  }

  // DIRECTION
  fetchRegion(): Observable<Region[]> {
    return this.actualizarDB.asObservable();
  }

  fetchComuna(): Observable<Comuna[]> {
    return this.actualizarDB.asObservable();
  }

  fetchDireccion(): Observable<Direccion[]> {
    return this.actualizarDB.asObservable();
  }

  // PRODUCT
  fetchCategoria(): Observable<Categoria[]> {
    return this.actualizarDB.asObservable();
  }

  fetchProducto(): Observable<Producto[]> {
    return this.actualizarDB.asObservable();
  }

  // PURCHASE
  fetchDetalle(): Observable<Detalle[]> {
    return this.actualizarDB.asObservable();
  }

  fetchCompra(): Observable<Compra[]> {
    return this.actualizarDB.asObservable();
  }

  // Funciones para generar db
  crearDB() {
    //verificar plataforma
    this.platform.ready().then(() => {
      //creamos la DB
      this.sqlite.create({
        name: 'DBApplication.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        //guardar conexion a DB
        this.database = db;
        //llamar a la función para que cree las tablas
        this.crearTablas();
      }).catch(e => {
        this.presentAlert("Error al crear Base de datos: " + e);
      })

    })
  }

  async crearTablas() {
    try {
      //ejecutar los create table
      await this.database.executeSql(this.tablaRol, []);
      await this.database.executeSql(this.tablaPregunta, []);
      await this.database.executeSql(this.tablaUsuario, []);

      await this.database.executeSql(this.tablaRegion, []);
      await this.database.executeSql(this.tablaComuna, []);
      await this.database.executeSql(this.tablaDireccion, []);

      await this.database.executeSql(this.tablaCategoria, []);
      await this.database.executeSql(this.tablaProducto, []);

      await this.database.executeSql(this.tablaDetalle, []);
      await this.database.executeSql(this.tablaCompra, []);

      //actualizamos el observable de la DB
      this.isdDBReady.next(true);
    } catch (e) {
      this.presentAlert("Error al crear Base de datos: " + e);
    }
  }

  /* 
  “La actitud de ustedes debe ser como la de Cristo Jesús, quien,
  siendo por naturaleza Dios,no consideró el ser igual a Dios como
  algo a qué aferrarse. Por el contrario, se rebajó voluntariamente,
  tomando la naturaleza de siervo y haciéndose semejante a los seres
  humanos. Y, al manifestarse como hombre, se humilló a sí mismo y
  se hizo obediente hasta la muerte, ¡y muerte de cruz!” ~ Filipenses 2:5 – 8
  */


  async presentAlert(msj: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'Important message',
      message: 'This is an alert!',
      buttons: ['OK'],
    });

    await alert.present();
  }
}
