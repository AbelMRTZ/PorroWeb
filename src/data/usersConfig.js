export const USERS = [
  { id: "adri",         nombre: "Adri",         color: "linear-gradient(135deg, #9a6800 0%, #ffd700 45%, #c88e00 100%)"  }, // Oro
  { id: "jose",         nombre: "Jose",          color: "linear-gradient(135deg, #a02030 0%, #ff7080 45%, #c83848 100%)"  }, // Rojo Claro
  { id: "sergio",       nombre: "Sergio",        color: "linear-gradient(135deg, #1a2e80 0%, #4878e8 45%, #2a44b8 100%)"  }, // Cobalto
  { id: "alba-s",       nombre: "Alba S",        color: "linear-gradient(135deg, #8a3048 0%, #d880a0 45%, #a85068 100%)"  }, // Oro Rosa
  { id: "andrea",       nombre: "Andrea",        color: "linear-gradient(135deg, #105828 0%, #36d068 45%, #1a7840 100%)"  }, // Esmeralda
  { id: "clara",        nombre: "Clara",         color: "linear-gradient(135deg, #5808a0 0%, #b840f0 45%, #7818c8 100%)"  }, // Violeta
  { id: "cristina",     nombre: "Cristina",      color: "linear-gradient(135deg, #4a0008 0%, #980018 45%, #6e0010 100%)"  }, // Rojo Oscuro
  { id: "laura-b",      nombre: "Laura B",       color: "linear-gradient(135deg, #085860 0%, #18c8d8 45%, #0c8090 100%)"  }, // Teal
  { id: "raquel-g",     nombre: "Raquel G",      color: "linear-gradient(135deg, #584010 0%, #c89020 45%, #806010 100%)"  }, // Bronce
  { id: "isabel",       nombre: "Isabel",        color: "linear-gradient(135deg, #606060 0%, #c8c8c8 45%, #909090 100%)"  }, // Platino
  { id: "jorge",        nombre: "Jorge",         color: "linear-gradient(135deg, #4a2800 0%, #a06010 45%, #6e3c00 100%)"  }, // Bronce Oscuro
  { id: "juanfran",     nombre: "Juanfran",      color: "linear-gradient(135deg, #100850 0%, #4028c0 45%, #201080 100%)"  }, // Índigo
  { id: "abel",         nombre: "Abel",          color: "linear-gradient(135deg, #416100 0%, #a0d010 45%, #5a8000 100%)"  }, // Dorado Verdoso
  { id: "laura-l",      nombre: "Laura L",       color: "linear-gradient(135deg, #480868 0%, #a838d0 45%, #6810a0 100%)"  }, // Amatista
  { id: "mariaju",      nombre: "Mariaju",       color: "linear-gradient(135deg, #882808 0%, #e85018 45%, #b03808 100%)"  }, // Coral
  { id: "paula-m",      nombre: "Paula M",       color: "linear-gradient(135deg, #083060 0%, #1870c8 45%, #0c4890 100%)"  }, // Océano
  { id: "paula-edurne", nombre: "Paula Edurne",  color: "linear-gradient(135deg, #800840 0%, #e03098 45%, #a01060 100%)"  }, // Magenta
  { id: "silvia",       nombre: "Silvia",        color: "linear-gradient(135deg, #085840 0%, #18c890 45%, #0a8060 100%)"  }, // Jade
]

export async function hashPassword(password) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
}

export async function verifyPassword(password, hash) {
  return (await hashPassword(password)) === hash
}
