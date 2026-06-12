// src/pages/AdminPorra.jsx

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { partidosFaseGrupos } from '../data/partidosMundial'
import './Porra.css' // Reutilizamos los estilos de las tarjetas

export default function AdminPorra() {
  const [resultadosReales, setResultadosReales] = useState({})
  const [loading, setLoading] = useState(false)

  // Cargar resultados reales que ya se hayan introducido previamente
  useEffect(() => {
    async function cargarResultados() {
      const { data } = await supabase.from('porra_resultados').select('*')
      if (data) {
        const resGuardados = {}
        data.forEach(r => {
          resGuardados[r.partido_id] = { local: r.goles_local, visitante: r.goles_visitante }
        })
        setResultadosReales(resGuardados)
      }
    }
    cargarResultados()
  }, [])

  const handleAdminScoreChange = (partidoId, tipo, valor) => {
    setResultadosReales(prev => ({
      ...prev,
      [partidoId]: {
        ...prev[partidoId],
        [tipo]: valor === '' ? '' : Number(valor)
      }
    }))
  }

  const handleGuardarResultadoReal = async (partidoId) => {
    const marcador = resultadosReales[partidoId]
    if (marcador?.local === '' || marcador?.visitante === '' || marcador?.local === undefined) {
      alert("Introduce ambos marcadores antes de guardar.")
      return
    }

    setLoading(false)
    const { error } = await supabase
      .from('porra_resultados')
      .upsert({
        partido_id: partidoId,
        goles_local: marcador.local,
        goles_visitante: marcador.visitante,
        jugado: true
      })

    if (!error) {
      alert("¡Resultado oficial guardado correctamente!")
    } else {
      alert("Error al guardar: " + error.message)
    }
  }

  return (
    <div className="page">
      <div className="porra-container">
        <header className="porra-header">
          <h1>⚙️ Panel Admin - Resultados Reales</h1>
          <p>Introduce los marcadores oficiales de los partidos del Mundial</p>
        </header>

        <div className="partidos-list">
          {partidosFaseGrupos.map(partido => (
            <div key={partido.id} className="partido-card" style={{ borderLeft: '4px solid var(--gold)' }}>
              <div className="partido-info">
                <span className="partido-fecha">Partido #{partido.id} • Grupo {partido.grupo}</span>
                <div className="equipos-wrap">
                  <span>{partido.banderaLocal} {partido.equipoLocal}</span>
                  <span style={{ color: 'var(--text-dim)' }}>vs</span>
                  <span>{partido.banderaVisitante} {partido.equipoVisitante}</span>
                </div>
              </div>

              <div className="marcador-inputs" style={{ gap: '15px' }}>
                <input 
                  type="number" min="0"
                  value={resultadosReales[partido.id]?.local ?? ''}
                  onChange={(e) => handleAdminScoreChange(partido.id, 'local', e.target.value)}
                  placeholder="Rec"
                />
                <span>-</span>
                <input 
                  type="number" min="0"
                  value={resultadosReales[partido.id]?.visitante ?? ''}
                  onChange={(e) => handleAdminScoreChange(partido.id, 'visitante', e.target.value)}
                  placeholder="Rec"
                />
                <button 
                  onClick={() => handleGuardarResultadoReal(partido.id)}
                  style={{ padding: '10px 15px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Ok
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}