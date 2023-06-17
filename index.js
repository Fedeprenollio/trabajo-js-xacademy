/*
En el archivo tarea2.js podemos encontrar un código de un supermercado que vende productos.
El código contiene 
    - una clase Producto que representa un producto que vende el super
    - una clase Carrito que representa el carrito de compras de un cliente
    - una clase ProductoEnCarrito que representa un producto que se agrego al carrito
    - una función findProductBySku que simula una base de datos y busca un producto por su sku
El código tiene errores y varias cosas para mejorar / agregar
​
Ejercicios
1) Arreglar errores existentes en el código
    a) Al ejecutar agregarProducto 2 veces con los mismos valores debería agregar 1 solo producto con la suma de las cantidades.    
    b) Al ejecutar agregarProducto debería actualizar la lista de categorías solamente si la categoría no estaba en la lista.
    c) Si intento agregar un producto que no existe debería mostrar un mensaje de error.
​
2) Agregar la función eliminarProducto a la clase Carrito
    a) La función eliminarProducto recibe un sku y una cantidad (debe devolver una promesa)
    b) Si la cantidad es menor a la cantidad de ese producto en el carrito, se debe restar esa cantidad al producto
    c) Si la cantidad es mayor o igual a la cantidad de ese producto en el carrito, se debe eliminar el producto del carrito
    d) Si el producto no existe en el carrito, se debe mostrar un mensaje de error
    e) La función debe retornar una promesa
​
3) Utilizar la función eliminarProducto utilizando .then() y .catch()
​
*/

// Cada producto que vende el super es creado con esta clase
class Producto {
  sku; // Identificador único del producto
  nombre; // Su nombre
  categoria; // Categoría a la que pertenece este producto
  precio; // Su precio
  stock; // Cantidad disponible en stock

  constructor(sku, nombre, precio, categoria, stock) {
    this.sku = sku;
    this.nombre = nombre;
    this.categoria = categoria;
    this.precio = precio;

    // Si no me definen stock, pongo 10 por default
    if (stock) {
      this.stock = stock;
    } else {
      this.stock = 10;
    }
  }
}

// Creo todos los productos que vende mi super
const queso = new Producto("KS944RUR", "Queso", 10, "lacteos", 4);
const gaseosa = new Producto("FN312PPE", "Gaseosa", 5, "bebidas");
const cerveza = new Producto("PV332MJ", "Cerveza", 20, "bebidas");
const arroz = new Producto("XX92LKI", "Arroz", 7, "alimentos", 20);
const fideos = new Producto("UI999TY", "Fideos", 5, "alimentos");
const lavandina = new Producto("RT324GD", "Lavandina", 9, "limpieza");
const shampoo = new Producto("OL883YE", "Shampoo", 3, "higiene", 50);
const jabon = new Producto("WE328NJ", "Jabon", 4, "higiene", 3);
const jabonLiquido = new Producto("WE328N2", "JabonLiquido", 4, "higiene", 3);

// Genero un listado de productos. Simulando base de datos
const productosDelSuper = [
  queso,
  gaseosa,
  cerveza,
  arroz,
  fideos,
  lavandina,
  shampoo,
  jabon,
  jabonLiquido,
];

// Cada cliente que venga a mi super va a crear un carrito
class Carrito {
  productos; // Lista de productos agregados
  categorias; // Lista de las diferentes categorías de los productos en el carrito
  precioTotal; // Lo que voy a pagar al finalizar mi compra

  // Al crear un carrito, empieza vació
  constructor() {
    this.precioTotal = 0;
    this.productos = [];
    this.categorias = [];
  }

  /**
   * función que agrega @{cantidad} de productos con @{sku} al carrito
   */
  async agregarProducto(sku, cantidad) {
    console.log(`Agregando ${cantidad} ${sku}`);

    try {
      // Busco el producto en la "base de datos"
      const producto = await findProductBySku(sku);
        // console.log("Producto encontrado", producto);

        const productoExistenteIndex = this.productos.findIndex((producto) => producto.sku === sku);

      if (productoExistenteIndex !== -1) {
        console.log("Producto existente:", this.productos[productoExistenteIndex]);
        this.productos[productoExistenteIndex].cantidad += cantidad;
        console.log("Ahora tiene en total: " ,this.productos[productoExistenteIndex].cantidad )
        // Aquí puedes retornar un objeto o realizar alguna acción adicional si lo deseas
        return { message: "El producto ya existe en el carrito. Se actualizó la cantidad." };
      }
      else {
        // Creo un producto nuevo
        const nuevoProducto = new ProductoEnCarrito(
          sku,
          producto.nombre,
          cantidad,
          producto.precio,
          producto.categoria
        );
        this.productos.push(nuevoProducto);
        const yaEstaEnListaDeCategoria = this.categorias.find(
          (cat) => cat === producto.categoria
        );
        if (!yaEstaEnListaDeCategoria) {
          this.categorias.push(producto.categoria);
        }
      }

      //FEDE: calculo el precio total del carrito
      //   this.precioTotal = this.precioTotal + producto.precio * cantidad;
      this.precioTotal = await this.calcularPrecioTotal();
      console.log("Productos en el carrito luego de agregar:", this.productos.map(prod=>prod.nombre));
      console.log("Precio total luego de agregar:", this.precioTotal);
      console.log("Categorías en el carrito luego de agregar:", this.categorias);
      return { newProduct: producto}
    } catch (error) {
      console.log({ Fede_Error: error });
      return {error: error}
    }
  }

  eliminarProducto(sku, cantidad) {
    return new Promise(async (resolve, reject) => {
      console.log(`Eliminando ${cantidad} ${sku}`);
      try {
        const existeProducto = await findProductBySku(sku);
        if (!existeProducto) {
          reject("No existe el producto en la base de datos");
          return;
        }
  
        const productoExistenteIndex = this.productos.findIndex((prod) => prod.sku === sku);
        if (productoExistenteIndex === -1) {
          reject(`Producto ${sku} no encontrado en el carrito`);
          return;
        }
  
        if (cantidad < this.productos[productoExistenteIndex].cantidad) {
          this.productos[productoExistenteIndex].cantidad -= cantidad;
          console.log(`Nueva cantidad de ${this.productos[productoExistenteIndex].nombre}: ${this.productos[productoExistenteIndex].cantidad}`);
        } else {
          this.productos.splice(productoExistenteIndex, 1);
        }
  
        const listaCategorias = [...new Set(this.productos.map((producto) => producto.categoria))];
        this.categorias = listaCategorias;
  
        // Calcula el precio total después de realizar las modificaciones
        this.calcularPrecioTotal()
          .then((precioTotal) => {
            console.log("Productos en el carrito:", this.productos);
            console.log("Precio total del carrito::", precioTotal);
            console.log("Categorías en el carrito:", this.categorias);
  
            // Resolve con el precio total actualizado
            resolve(precioTotal);
          })
          .catch((error) => {
            reject(error); // Rechaza la promesa con el error de calcularPrecioTotal
          });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
  
  calcularPrecioTotal() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const precioTotal = this.productos.reduce(
          (total, producto) => total + producto.precio * producto.cantidad,
          0
        );
        this.precioTotal = precioTotal;
        resolve(precioTotal);
      }, 1000);
    });
  }
}



// Cada producto que se agrega al carrito es creado con esta clase
class ProductoEnCarrito {
  sku; // Identificador único del producto
  nombre; // Su nombre
  cantidad; // Cantidad de este producto en el carrito

  constructor(sku, nombre, cantidad, precio, categoria) {
    this.sku = sku;
    this.nombre = nombre;
    this.cantidad = cantidad;

    //Fede: precio
    this.precio = precio;
    this.categoria = categoria
  }
}

// Función que busca un producto por su sku en "la base de datos"
function findProductBySku(sku) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const foundProduct = productosDelSuper.find(
        (product) => product.sku === sku
      );
      if (foundProduct) {
        resolve(foundProduct);
      } else {
        reject(`Producto ${sku} no encontrado`);
      }
    }, 1500);
  });
}
const carrito = new Carrito();



const prueba = async()=>{
  try {
    await carrito.agregarProducto("KS944RUR", 2); // Agrega 2 productos con SKU "KS944RUR"
   await  carrito.agregarProducto("KS944RUR", 3); // Agrega 3 productos con SKU "FN312PPE"
   await  carrito.eliminarProducto("KS944RUR", 5);
  await   carrito.eliminarProducto("XX92LKI", 1); // Agrega 1 producto con SKU "XX92LKI"
  // await carrito.agregarProducto("PV332MAAAAAAAAAAAAAAAAAAAAAAAAAaaJ",3)
    
  //  await carrito.eliminarProducto("FN312PPE",32)
  //  await carrito.eliminarProducto("FN312PPE",32)

  
  } catch (error) {
    console.error(error)
  }
}
prueba()
// carrito.eliminarProducto("FN312PPE", 1)
//   .then((precioTotal) => {
//     console.log(`Producto eliminado. Precio total actualizado: ${precioTotal}`);
//   })
//   .catch((error) => {
//     console.log(`Error al eliminar el producto: ${error}`);
//   });


  // carrito.agregarProducto("KS944RURs",4)
  //   .then(res=>console.log(res))
  //   .catch(err=> console.log(err))