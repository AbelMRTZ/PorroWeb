// src/data/fantasyData.js

export const classification2526 = [
  { id: 1, pos: "1º", nombre: "Sergio", puntos: "3.414", estado: "activo" },
  { id: 2, pos: "2º", nombre: "Abel", puntos: "2.319", estado: "activo" },
  { id: 3, pos: "3º", nombre: "Clara", puntos: "2.131", estado: "activo" },
  { id: 4, pos: "4º", nombre: "Adri", puntos: "2.113", estado: "activo" },
  { id: 5, pos: "5º", nombre: "Cristina", puntos: "1.930", estado: "activo" },
  { id: 6, pos: "6º", nombre: "Raquel", puntos: "1.836", estado: "activo" },
  { id: 7, pos: "7º", nombre: "Paula", puntos: "1.083", estado: "activo" },
];

export const fantasy2425 = [
  { id: 1, pos: "1º", nombre: "Sergio", puntos: 2452, estado: "activo" },
  { id: 2, pos: "2º", nombre: "Clara", puntos: 1667, estado: "activo" },
  { id: 3, pos: "3º", nombre: "Adri", puntos: 1550, estado: "activo" },
  { id: 4, pos: "4º", nombre: "Cristina", puntos: 1520, estado: "activo" },
  { id: 5, pos: "5º", nombre: "Raquel", puntos: 1501, estado: "activo" },
  { id: 6, pos: "-", nombre: "Abel", puntos: "Abandono", estado: "retirado" },
  { id: 7, pos: "-", nombre: "Paula Edurne", puntos: "Abandono", estado: "retirado" },
];


export const macroStats2526 = [
  { id: 1, icon: "📊", title: "Producción Total", val: "14.826 pts", desc: "Repartidos en 38 jornadas (Media global de 390,15 pts/jornada).", color: "bg-blue", full: true },
  { id: 2, icon: "💰", title: "Bote Final", val: "87,40 €", desc: "Recaudación total de la liga.", color: "bg-green", full: false },
  { id: 3, icon: "💯", title: "Club de los 100", val: "9 Veces", desc: "Las 9 veces logrado por Sergio.", color: "bg-gold", full: false },
  { id: 4, icon: "👼", title: "El Cielo (Mejor Jornada)", val: "Jornada 20", desc: "504 pts totales. 4 jugadores superaron cómodamente los 75 pts.", color: "bg-gold", full: true },
  { id: 5, icon: "🔥", title: "El Infierno (Peor Jornada)", val: "Jornada 28", desc: "Solo 269 pts totales. Hubo 3 jornadas con cero puntos simultáneas en esta semana.", color: "bg-red", full: true },
  { id: 6, icon: "💸", title: "Salvación más cara", val: "J20 (63 pts)", desc: "Cantidad de puntos que en esa jornada han hecho falta para no pagar.", color: "bg-purple", full: false },
  { id: 7, icon: "🥱", title: "Salvación más barata", val: "J32 (29 pts)", desc: "Cantidad de puntos que en esa jornada han hecho falta para no pagar.", color: "bg-silver", full: false },
  { id: 8, icon: "🛡️", title: "Media para salvarse", val: "48,5 pts", desc: "Media requerida para quedar 4º y no pagar. Se registraron 19 jornadas con cero puntos en todo el año.", color: "bg-dark", full: true }
];

export const players2526 = [
  {
    id: 1,
    rank: "ph-rank-1",
    name: "🥇 1º Sergio",
    tag: "Dictadura Absoluta",
    stats: [
      { label: "Total puntos", val: "3.414" },
      { label: "Media / jornada", val: "89,84" },
      { label: "Jornadas ganadas", val: "23 (60%)" },
      { label: "Mejor jornada J19", val: "155" },
      { label: "Peor jornada J3", val: "60" },
      { label: "Ceros", val: "0" }
    ],
    bullets: [
      { text: "El Dato Letal: +1.095 puntos de ventaja sobre el segundo clasificado." },
      { text: "Superioridad: Su peor semana (60 pts) supera la media anual del resto de rivales." },
      { text: "Multas (0,20€): Aportó solo el 0,23% del bote (por un empate en la J8)." }
    ],
    finance: { label: "Balance Final", amount: "+12,26 €", type: "fin-cobrar" }
  },
  {
    id: 2,
    rank: "ph-rank-2",
    name: "🥈 2º Abel",
    tag: "Rey de los Mortales",
    stats: [
      { label: "Total puntos", val: "2.319" },
      { label: "Media / jornada", val: "61,03" },
      { label: "Jornadas ganadas", val: "2" },
      { label: "Mejor jornada J23", val: "96" },
      { label: "Peor jornada J35,38", val: "33" },
      { label: "Ceros", val: "1" }
    ],
    bullets: [
      { text: "El Hachazo: Entre las jornadas 18 y 20 se separó definitivamente del pelotón y blindó la plata." },
      { text: "Ganadas: Impuso su ley en las Jornadas 12 y 18." },
      { text: "Multas (6,55€): Jugador muy seguro, solo aportó el 7,49% del bote." }
    ],
    finance: { label: "Balance Final", amount: "+5,94 €", type: "fin-cobrar" }
  },
  {
    id: 3,
    rank: "ph-rank-3",
    name: "🥉 3º Clara",
    tag: "Resiliencia",
    stats: [
      { label: "Total puntos", val: "2.131" },
      { label: "Media / jornada", val: "56,08" },
      { label: "Jornadas ganadas", val: "3" },
      { label: "Mejor jornada J22", val: "99" },
      { label: "Peor jornada J23", val: "29" },
      { label: "Ceros", val: "0" }
    ],
    bullets: [
      { text: "El Sorpasso: En la J33 iba a 20 pts de Adri. En la histórica J34 le superó por 3 puntos (1.888 frente a 1.885)." },
      { text: "Constancia: 0 jornadas con cero puntos. Su asistencia perfecta fue su salvavidas." },
      { text: "Multas (11,40€): Sufragó el 13,04% del bote." },
      { text: "Ganadas: Jornadas 10, 22 (a un punto de los 100) y 35." }
    ],
    finance: { label: "Balance Final", amount: "+1,09 €", type: "fin-cobrar" }
  },
  {
    id: 4,
    rank: "ph-rank-mid",
    name: "🏅 4º Adri",
    tag: "Pérdida de Podio",
    stats: [
      { label: "Total puntos", val: "2.113" },
      { label: "Media / jornada", val: "55,61" },
      { label: "Jornadas ganadas", val: "3" },
      { label: "Mejor jornada J5", val: "92" },
      { label: "Peor jornada J13", val: "30" },
      { label: "Ceros", val: "1" }
    ],
    bullets: [
      { text: "Pionero: Primer líder de la historia ganando la J1 (90 pts). También ganó la J20 y J25." },
      { text: "El Dato Fatal: Perdió el bronce ante Clara en la J34 y fue incapaz de remontar los 18 pts de diferencia del último mes." },
      { text: "Multas (9,20€): Aportó un 10,53%. Pese a quedar 4º, gana dinero por su buena gestión." }
    ],
    finance: { label: "Balance Final", amount: "+3,29 €", type: "fin-cobrar" }
  },
  {
    id: 5,
    rank: "ph-rank-mid",
    name: "🏃‍♀️ 5º Cristina",
    tag: "Montaña Rusa",
    stats: [
      { label: "Total puntos", val: "1.930" },
      { label: "Media / jornada", val: "50,79" },
      { label: "Jornadas ganadas", val: "1" },
      { label: "Mejor jornada J3", val: "97" },
      { label: "Peor jornada J25", val: "31" },
      { label: "Ceros", val: "4" }
    ],
    bullets: [
      { text: "Lo que pudo ser: En la J4 iba 2ª en la general, pisándole los talones a Sergio a escasos 31 pts." },
      { text: "El Lastre: Sus abandonos (J14, 23, 24 y 32) hundieron su media y opciones de medalla." },
      { text: "Multas (13,55€): Aportó el 15,50% del bote final." }
    ],
    finance: { label: "Balance Final", amount: "-1,06 €", type: "fin-pagar" }
  },
  {
    id: 6,
    rank: "ph-rank-mid",
    name: "🧗‍♀️ 6º Raquel",
    tag: "Supervivencia",
    stats: [
      { label: "Total puntos", val: "1.836" },
      { label: "Media / jornada", val: "48,32" },
      { label: "Jornadas ganadas", val: "2" },
      { label: "Mejor jornada J30", val: "86" },
      { label: "Peor jornada J34", val: "22" },
      { label: "Ceros", val: "0" }
    ],
    bullets: [
      { text: "Despertar Tardío: Ganar la J30 y la J37 en el último tramo de liga fue su billete a la salvación." },
      { text: "Perseverancia: Junto a Sergio y Clara, jamás dejó una jornada a 0 puntos." },
      { text: "Multas (16,00€): Vivió en la cuerda floja, aportando el 18,31% de la liga." }
    ],
    finance: { label: "Balance Final", amount: "-3,51 €", type: "fin-pagar" }
  },
  {
    id: 7,
    rank: "ph-rank-last",
    name: "📉 7º Paula",
    tag: "La Mecenas",
    stats: [
      { label: "Total puntos", val: "1.083" },
      { label: "Media / jornada", val: "28,50" },
      { label: "Jornadas ganadas", val: "1" },
      { label: "Mejor jornada J2", val: "79" },
      { label: "Peor jornada J32", val: "16" },
      { label: "Ceros", val: "13" }
    ],
    bullets: [
      { text: "La Desconexión: 13 jornadas con cero puntos (1/3 de la temporada) concentradas en la segunda vuelta." },
      { text: "Espejismo Inicial: En la J2 ganó la semana y se colocó 3ª en la general." },
      { text: "Financiadora: Con 30,50€, ha sufragado el 34,90% de todo el bote ella sola." }
    ],
    finance: { label: "Deuda Total", amount: "-17,98 €", type: "fin-pagar" }
  }
];