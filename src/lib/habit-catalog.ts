export interface CatalogHabit {
  name: string
  category: string
  difficulty: 'easy' | 'normal' | 'hard' | 'beast'
  pts: number
}

export const HABIT_CATALOG: CatalogHabit[] = [
  // FITNESS & EJERCICIO
  { name: 'Gym 1h', category: 'Fitness', difficulty: 'hard', pts: 50 },
  { name: 'Correr 5K', category: 'Fitness', difficulty: 'hard', pts: 50 },
  { name: 'Correr 10K', category: 'Fitness', difficulty: 'beast', pts: 80 },
  { name: 'Caminar 10.000 pasos', category: 'Fitness', difficulty: 'hard', pts: 50 },
  { name: 'Caminar 30 minutos', category: 'Fitness', difficulty: 'normal', pts: 30 },
  { name: 'Estiramientos 15min', category: 'Fitness', difficulty: 'easy', pts: 15 },
  { name: 'Yoga 30min', category: 'Fitness', difficulty: 'normal', pts: 30 },
  { name: 'Yoga 1h', category: 'Fitness', difficulty: 'hard', pts: 50 },
  { name: 'Pilates', category: 'Fitness', difficulty: 'normal', pts: 30 },
  { name: 'Natación', category: 'Fitness', difficulty: 'hard', pts: 50 },
  { name: 'Ciclismo', category: 'Fitness', difficulty: 'hard', pts: 50 },
  { name: 'Calistenia', category: 'Fitness', difficulty: 'hard', pts: 50 },
  { name: 'CrossFit', category: 'Fitness', difficulty: 'beast', pts: 80 },
  { name: 'Doble sesión gym', category: 'Fitness', difficulty: 'beast', pts: 80 },
  { name: 'Sparring / boxeo', category: 'Fitness', difficulty: 'beast', pts: 80 },
  { name: 'Artes marciales', category: 'Fitness', difficulty: 'hard', pts: 50 },
  { name: 'Saltar a la comba 15min', category: 'Fitness', difficulty: 'normal', pts: 30 },
  { name: 'Abdominales 100', category: 'Fitness', difficulty: 'normal', pts: 30 },
  { name: 'Flexiones 50', category: 'Fitness', difficulty: 'normal', pts: 30 },
  { name: 'Sentadillas 100', category: 'Fitness', difficulty: 'normal', pts: 30 },
  { name: 'Plancha 5 minutos', category: 'Fitness', difficulty: 'hard', pts: 50 },
  { name: 'Escalada', category: 'Fitness', difficulty: 'hard', pts: 50 },
  { name: 'Padel / Tenis', category: 'Fitness', difficulty: 'hard', pts: 50 },
  { name: 'Fútbol', category: 'Fitness', difficulty: 'hard', pts: 50 },
  { name: 'Basket', category: 'Fitness', difficulty: 'hard', pts: 50 },

  // NUTRICIÓN & DIETA
  { name: 'Cocinar en casa', category: 'Nutrición', difficulty: 'normal', pts: 30 },
  { name: 'Meal prep semanal', category: 'Nutrición', difficulty: 'hard', pts: 50 },
  { name: 'Beber 2L agua', category: 'Nutrición', difficulty: 'easy', pts: 15 },
  { name: 'Beber 3L agua', category: 'Nutrición', difficulty: 'normal', pts: 30 },
  { name: 'Sin azúcar añadido', category: 'Nutrición', difficulty: 'hard', pts: 50 },
  { name: 'Sin ultraprocesados', category: 'Nutrición', difficulty: 'hard', pts: 50 },
  { name: 'Comer fruta 3 piezas', category: 'Nutrición', difficulty: 'easy', pts: 15 },
  { name: 'Comer verdura en cada comida', category: 'Nutrición', difficulty: 'normal', pts: 30 },
  { name: 'Proteína en cada comida', category: 'Nutrición', difficulty: 'normal', pts: 30 },
  { name: 'Tomar vitaminas', category: 'Nutrición', difficulty: 'easy', pts: 15 },
  { name: 'Tomar creatina', category: 'Nutrición', difficulty: 'easy', pts: 15 },
  { name: 'Sin refrescos', category: 'Nutrición', difficulty: 'normal', pts: 30 },
  { name: 'Desayuno saludable', category: 'Nutrición', difficulty: 'normal', pts: 30 },
  { name: 'No picar entre horas', category: 'Nutrición', difficulty: 'hard', pts: 50 },
  { name: 'Contar calorías', category: 'Nutrición', difficulty: 'normal', pts: 30 },
  { name: 'Contar macros', category: 'Nutrición', difficulty: 'hard', pts: 50 },
  { name: 'Ayuno 16h', category: 'Nutrición', difficulty: 'beast', pts: 80 },
  { name: 'Ayuno 20h', category: 'Nutrición', difficulty: 'beast', pts: 80 },
  { name: 'Dieta sin gluten', category: 'Nutrición', difficulty: 'hard', pts: 50 },
  { name: 'Dieta sin lácteos', category: 'Nutrición', difficulty: 'hard', pts: 50 },

  // MENTAL & MINDFULNESS
  { name: 'Meditar 10min', category: 'Mental', difficulty: 'normal', pts: 30 },
  { name: 'Meditar 20min', category: 'Mental', difficulty: 'hard', pts: 50 },
  { name: 'Meditar 1h', category: 'Mental', difficulty: 'beast', pts: 80 },
  { name: 'Journaling', category: 'Mental', difficulty: 'normal', pts: 30 },
  { name: 'Escribir 3 gratitudes', category: 'Mental', difficulty: 'easy', pts: 15 },
  { name: 'Respiración consciente 5min', category: 'Mental', difficulty: 'easy', pts: 15 },
  { name: 'Visualización 10min', category: 'Mental', difficulty: 'normal', pts: 30 },
  { name: 'Afirmaciones positivas', category: 'Mental', difficulty: 'easy', pts: 15 },
  { name: 'No quejarse', category: 'Mental', difficulty: 'hard', pts: 50 },
  { name: 'Practicar mindfulness', category: 'Mental', difficulty: 'normal', pts: 30 },
  { name: 'Terapia / psicólogo', category: 'Mental', difficulty: 'normal', pts: 30 },
  { name: 'Digital detox 1h', category: 'Mental', difficulty: 'normal', pts: 30 },
  { name: 'Digital detox completo', category: 'Mental', difficulty: 'beast', pts: 80 },

  // PRODUCTIVIDAD
  { name: 'Madrugar (antes de las 7)', category: 'Productividad', difficulty: 'hard', pts: 50 },
  { name: 'Madrugar (antes de las 6)', category: 'Productividad', difficulty: 'beast', pts: 80 },
  { name: 'Planificar el día', category: 'Productividad', difficulty: 'easy', pts: 15 },
  { name: 'Hacer la cama', category: 'Productividad', difficulty: 'easy', pts: 15 },
  { name: 'Revisar objetivos', category: 'Productividad', difficulty: 'easy', pts: 15 },
  { name: 'Deep work 2h sin distracciones', category: 'Productividad', difficulty: 'hard', pts: 50 },
  { name: 'Deep work 4h sin distracciones', category: 'Productividad', difficulty: 'beast', pts: 80 },
  { name: 'Inbox zero', category: 'Productividad', difficulty: 'normal', pts: 30 },
  { name: 'Time blocking', category: 'Productividad', difficulty: 'normal', pts: 30 },
  { name: 'Pomodoro x4', category: 'Productividad', difficulty: 'normal', pts: 30 },
  { name: 'No procrastinar tarea principal', category: 'Productividad', difficulty: 'hard', pts: 50 },
  { name: 'Ordenar escritorio', category: 'Productividad', difficulty: 'easy', pts: 15 },
  { name: 'Limpiar casa 15min', category: 'Productividad', difficulty: 'easy', pts: 15 },

  // LECTURA & APRENDIZAJE
  { name: 'Leer 20 páginas', category: 'Aprendizaje', difficulty: 'normal', pts: 30 },
  { name: 'Leer 30min', category: 'Aprendizaje', difficulty: 'normal', pts: 30 },
  { name: 'Leer 1h', category: 'Aprendizaje', difficulty: 'hard', pts: 50 },
  { name: 'Escuchar podcast', category: 'Aprendizaje', difficulty: 'easy', pts: 15 },
  { name: 'Estudiar idioma 15min', category: 'Aprendizaje', difficulty: 'normal', pts: 30 },
  { name: 'Estudiar idioma 1h', category: 'Aprendizaje', difficulty: 'hard', pts: 50 },
  { name: 'Practicar instrumento 30min', category: 'Aprendizaje', difficulty: 'normal', pts: 30 },
  { name: 'Curso online 30min', category: 'Aprendizaje', difficulty: 'normal', pts: 30 },
  { name: 'Escribir 500 palabras', category: 'Aprendizaje', difficulty: 'normal', pts: 30 },
  { name: 'Escribir 1000 palabras', category: 'Aprendizaje', difficulty: 'hard', pts: 50 },
  { name: 'Aprender algo nuevo', category: 'Aprendizaje', difficulty: 'normal', pts: 30 },
  { name: 'Flashcards / Anki', category: 'Aprendizaje', difficulty: 'easy', pts: 15 },
  { name: 'Programar 1h', category: 'Aprendizaje', difficulty: 'hard', pts: 50 },

  // SUEÑO & DESCANSO
  { name: 'Dormir 8h', category: 'Sueño', difficulty: 'normal', pts: 30 },
  { name: 'Acostarse antes de las 23', category: 'Sueño', difficulty: 'hard', pts: 50 },
  { name: 'Acostarse antes de las 22', category: 'Sueño', difficulty: 'beast', pts: 80 },
  { name: 'No pantallas 1h antes de dormir', category: 'Sueño', difficulty: 'hard', pts: 50 },
  { name: 'No cafeína después de las 14h', category: 'Sueño', difficulty: 'normal', pts: 30 },
  { name: 'Rutina nocturna', category: 'Sueño', difficulty: 'normal', pts: 30 },
  { name: 'No snooze al despertar', category: 'Sueño', difficulty: 'normal', pts: 30 },
  { name: 'Siesta 20min', category: 'Sueño', difficulty: 'easy', pts: 15 },

  // HÁBITOS DIFÍCILES / RETOS
  { name: 'Cold shower', category: 'Retos', difficulty: 'beast', pts: 80 },
  { name: 'Baño de hielo', category: 'Retos', difficulty: 'beast', pts: 80 },
  { name: 'Sin alcohol', category: 'Retos', difficulty: 'normal', pts: 30 },
  { name: 'No fumar', category: 'Retos', difficulty: 'hard', pts: 50 },
  { name: 'No fap', category: 'Retos', difficulty: 'hard', pts: 50 },
  { name: 'No redes sociales', category: 'Retos', difficulty: 'hard', pts: 50 },
  { name: 'No TikTok / Reels', category: 'Retos', difficulty: 'normal', pts: 30 },
  { name: 'Sin quejas 24h', category: 'Retos', difficulty: 'hard', pts: 50 },
  { name: 'Hablar con un desconocido', category: 'Retos', difficulty: 'hard', pts: 50 },
  { name: 'Salir de la zona de confort', category: 'Retos', difficulty: 'hard', pts: 50 },
  { name: 'Cold exposure 10min', category: 'Retos', difficulty: 'beast', pts: 80 },
  { name: 'Sauna 20min', category: 'Retos', difficulty: 'normal', pts: 30 },

  // SOCIAL & RELACIONES
  { name: 'Llamar a familia', category: 'Social', difficulty: 'easy', pts: 15 },
  { name: 'Quedar con amigos', category: 'Social', difficulty: 'normal', pts: 30 },
  { name: 'Acto de amabilidad', category: 'Social', difficulty: 'easy', pts: 15 },
  { name: 'Networking 1 persona', category: 'Social', difficulty: 'normal', pts: 30 },
  { name: 'Decir no a algo innecesario', category: 'Social', difficulty: 'normal', pts: 30 },
  { name: 'Poner límites', category: 'Social', difficulty: 'hard', pts: 50 },
  { name: 'Escuchar sin interrumpir', category: 'Social', difficulty: 'normal', pts: 30 },

  // CUIDADO PERSONAL
  { name: 'Skincare mañana y noche', category: 'Cuidado', difficulty: 'easy', pts: 15 },
  { name: 'Crema solar', category: 'Cuidado', difficulty: 'easy', pts: 15 },
  { name: 'Cepillarse los dientes 3x', category: 'Cuidado', difficulty: 'easy', pts: 15 },
  { name: 'Hilo dental', category: 'Cuidado', difficulty: 'easy', pts: 15 },
  { name: 'Ducha fría', category: 'Cuidado', difficulty: 'hard', pts: 50 },
  { name: 'Mascarilla facial', category: 'Cuidado', difficulty: 'easy', pts: 15 },
  { name: 'Crema hidratante', category: 'Cuidado', difficulty: 'easy', pts: 15 },
  { name: 'Pílulas pelo', category: 'Cuidado', difficulty: 'easy', pts: 15 },
  { name: 'Jabón cara', category: 'Cuidado', difficulty: 'easy', pts: 15 },
  { name: 'Crema cara', category: 'Cuidado', difficulty: 'easy', pts: 15 },
  { name: 'Vestir bien / outfit del día', category: 'Cuidado', difficulty: 'easy', pts: 15 },

  // FINANZAS
  { name: 'No gastar dinero innecesario', category: 'Finanzas', difficulty: 'normal', pts: 30 },
  { name: 'Anotar gastos', category: 'Finanzas', difficulty: 'easy', pts: 15 },
  { name: 'Ahorrar al menos 5€', category: 'Finanzas', difficulty: 'normal', pts: 30 },
  { name: 'Revisar inversiones', category: 'Finanzas', difficulty: 'easy', pts: 15 },
  { name: 'No compras impulsivas', category: 'Finanzas', difficulty: 'hard', pts: 50 },
  { name: 'Estudiar finanzas 15min', category: 'Finanzas', difficulty: 'normal', pts: 30 },

  // CREATIVIDAD
  { name: 'Dibujar / pintar 30min', category: 'Creatividad', difficulty: 'normal', pts: 30 },
  { name: 'Fotografía del día', category: 'Creatividad', difficulty: 'easy', pts: 15 },
  { name: 'Crear contenido', category: 'Creatividad', difficulty: 'hard', pts: 50 },
  { name: 'Escribir diario creativo', category: 'Creatividad', difficulty: 'normal', pts: 30 },
  { name: 'Componer música', category: 'Creatividad', difficulty: 'hard', pts: 50 },
  { name: 'Hacer vídeo', category: 'Creatividad', difficulty: 'hard', pts: 50 },
  { name: 'Publicar en blog', category: 'Creatividad', difficulty: 'hard', pts: 50 },

  // NATURALEZA & EXTERIOR
  { name: 'Tomar el sol 15min', category: 'Exterior', difficulty: 'easy', pts: 15 },
  { name: 'Pasar tiempo en naturaleza', category: 'Exterior', difficulty: 'normal', pts: 30 },
  { name: 'Senderismo', category: 'Exterior', difficulty: 'hard', pts: 50 },
  { name: 'Grounding / pies descalzos', category: 'Exterior', difficulty: 'easy', pts: 15 },
  { name: 'No usar ascensor', category: 'Exterior', difficulty: 'easy', pts: 15 },
  { name: 'Ir andando al trabajo', category: 'Exterior', difficulty: 'normal', pts: 30 },
  { name: 'Ir en bici al trabajo', category: 'Exterior', difficulty: 'hard', pts: 50 },
]

export const CATEGORIES = [...new Set(HABIT_CATALOG.map(h => h.category))]

export function searchHabits(query: string): CatalogHabit[] {
  if (!query.trim()) return []
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return HABIT_CATALOG.filter(h => {
    const name = h.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const cat = h.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return name.includes(q) || cat.includes(q)
  }).slice(0, 8)
}
