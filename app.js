const stripe = Stripe("pk_live_51T4M20FgtNqAHTMVi02lvSbsw64sZJwD0o6ZUfzfDCTLcDjQjsocrxNgbWD1nZq73tCt3WpRupGRQMr7aZAuCzfr00JUZ6QpgK"); // Reemplaza con tu clave pública de prueba de Stripe


const productos = [
  {name:"Dementium - The Ward", price:10, img:"img/dementium1.jpg", tipo:"juego", link:"https://drive.google.com/file/d/1zEZazx-5mylUB4UMO9pKYZZAlpIOmYKC/view?usp=sharing"},
  {name:"Dementium 2", price:10, img:"img/dementium2.jpg", tipo:"juego", link:"https://drive.google.com/file/d/1ITcu8_Z-T9iX1GzfZDlDK64uowEDVoOs/view?usp=sharing"},
  {name:"Pokemon Blanco", price:10, img:"img/pokemon_blanco.jpg", tipo:"juego", link:"https://drive.google.com/file/d/1TcaSWcmRS5oedR_pLCMXbEGST0iyiIel/view?usp=sharing"},
  {name:"Pokemon Negro", price:10, img:"img/pokemon_negro.jpg", tipo:"juego", link:"https://drive.google.com/file/d/1iadwkF1r1GU1ohfgdtZBZY3HRaxrTYpe/view?usp=sharing"},
  {name:"Pokemon Rojo Fuego", price:10, img:"img/pokemon_rojo.png", tipo:"juego", link:"https://drive.google.com/file/d/1m1uRJO4oc1wv-n9tS9deEGU_MELFNsyd/view?usp=sharing"},
  {name:"Pokemon Verde Hoja", price:10, img:"img/pokemon_verde.png", tipo:"juego", link:"https://drive.google.com/file/d/1J6jqqKw1lFJEbvLx2pWxtkDTLrD-n-AJ/view?usp=sharing"},
  {name:"Super Mario 64 DS", price:10, img:"img/mario_ds.jpg", tipo:"juego", link:"https://drive.google.com/file/d/1uMwaDts9-6diNYI1GL-5lG-vIPeOLZEH/view?usp=sharing"},
  {name:"Zelda Phantom Hourglass", price:10, img:"img/zelda_ds.png", tipo:"juego", link:"https://drive.google.com/file/d/1UEdoA6d--c0oRT8KjjryaCdYF076QNBZ/view?usp=sharing"},

  {name:"Game Boy Advance Emulator", price:0, img:"img/My-Boy.jpg", tipo:"emulador", link:"https://drive.google.com/file/d/1Prf-LdkNoyRjcTbuP3jYjMJgOR0P1IIU/view?usp=sharing"},
  {name:"MelonDS Emulator", price:0, img:"img/melonds.png", tipo:"emulador", link:"https://drive.google.com/drive/folders/1966kb06J_MvohCX9l_ISfSThv_nIPCDE?usp=sharing"}
];

let carrito = [];


function render(){
  const juegosCont = document.querySelector("#juegos .catalogo");
  const emuCont = document.querySelector("#emuladores .catalogo");

  juegosCont.innerHTML = '';
  emuCont.innerHTML = '';

  productos.forEach(p => {

    const card = `
      <div class="card ${p.price === 0 ? 'gratis' : ''}">
        <img src="${p.img}">
        <h3>${p.name}</h3>
        <p class="${p.price === 0 ? 'gratis-texto' : 'precio'}">
          ${p.price === 0 ? 'GRATIS' : '$' + p.price + ' MXN'}
        </p>
        <button onclick='add("${p.name}")'>
          ${p.price === 0 ? 'Descargar' : 'Agregar'}
        </button>
      </div>
    `;

    if(p.tipo === "juego"){
      juegosCont.innerHTML += card;
    } else {
      emuCont.innerHTML += card;
    }

  });
}


function add(name){
  const producto = productos.find(p => p.name === name);

  carrito.push(producto);
  actualizar();
}


function actualizar(){
  const ul = document.getElementById('carrito');
  ul.innerHTML = '';

  let total = 0;

  carrito.forEach(i => {
    total += i.price;

    let texto = i.price === 0 
      ? `${i.name} - GRATIS`
      : `${i.name} - $${i.price}`;

    ul.innerHTML += `<li>${texto}</li>`;
  });

  document.getElementById('total').innerText = total;
}


async function pagar(){
  if(carrito.length === 0){
    alert("El carrito está vacío 🛒");
    return;
  }


  localStorage.setItem("compra", JSON.stringify(carrito));

  const res = await fetch('/create-checkout-session',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({items:carrito})
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error en el servidor:", errorText);
    alert("Hubo un error al procesar el pago. Revisa la consola del servidor.");
    return;
  }

  const data = await res.json();
  stripe.redirectToCheckout({sessionId:data.id});
}


render();