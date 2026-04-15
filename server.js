require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const app = express();

app.use(express.json());
app.use(express.static('.'));

const links = {
  "Dementium - The Ward": "https://drive.google.com/file/d/1zEZazx-5mylUB4UMO9pKYZZAlpIOmYKC/view?usp=sharing",
  "Dementium 2": "https://drive.google.com/file/d/1ITcu8_Z-T9iX1GzfZDlDK64uowEDVoOs/view?usp=sharing",
  "Pokemon Blanco": "https://drive.google.com/file/d/1TcaSWcmRS5oedR_pLCMXbEGST0iyiIel/view?usp=sharing",
  "Pokemon Negro": "https://drive.google.com/file/d/1iadwkF1r1GU1ohfgdtZBZY3HRaxrTYpe/view?usp=sharing",
  "Pokemon Rojo Fuego": "https://drive.google.com/file/d/1m1uRJO4oc1wv-n9tS9deEGU_MELFNsyd/view?usp=sharing",
  "Pokemon Verde Hoja": "https://drive.google.com/file/d/1J6jqqKw1lFJEbvLx2pWxtkDTLrD-n-AJ/view?usp=sharing",
  "Super Mario 64 DS": "https://drive.google.com/file/d/1uMwaDts9-6diNYI1GL-5lG-vIPeOLZEH/view?usp=sharing",
  "Zelda Phantom Hourglass": "https://drive.google.com/file/d/1UEdoA6d--c0oRT8KjjryaCdYF076QNBZ/view?usp=sharing",
  "Game Boy Advance Emulator": "https://drive.google.com/file/d/1Prf-LdkNoyRjcTbuP3jYjMJgOR0P1IIU/view?usp=sharing",
  "MelonDS Emulator": "https://drive.google.com/drive/folders/1966kb06J_MvohCX9l_ISfSThv_nIPCDE?usp=sharing"
};

const validSessions = {};

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'mxn',
          product_data: { name: item.name },
          unit_amount: item.price * 100
        },
        quantity: 1
      })),
      mode: 'payment',
      success_url: `http://localhost:3000/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://mygames-github-io.onrender.com`
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error al crear sesión de Stripe:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/verify-session/:id', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.params.id);

  if (session.payment_status !== 'paid') {
    return res.json({ success: false });
  }

  const token = crypto.randomBytes(32).toString('hex');

  validSessions[token] = {
    expires: Date.now() + (10 * 60 * 1000)
  };

  res.json({ success: true, token });
});

app.get('/download/:gameId', (req, res) => {
  const token = req.query.token;
  const game = decodeURIComponent(req.params.gameId);

  if (!token || !validSessions[token]) {
    return res.status(403).send('Acceso denegado');
  }

  if (Date.now() > validSessions[token].expires) {
    delete validSessions[token];
    return res.status(403).send('Token expirado');
  }

  delete validSessions[token];

  const link = links[game];

  if (!link) {
    return res.status(404).send('Juego no encontrado');
  }


  res.redirect(link);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});