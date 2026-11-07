export type Choice = 'Sí' | 'No' | 'No sé'
export type Alternative = 'basic' | 'model' | 'guidance' | 'technician'
export const questions = [
  '¿El lavarropas indicó que el ciclo había terminado?',
  '¿Aparece algún código o mensaje de error?',
  '¿Notaste algún ruido, olor o comportamiento diferente?',
]
export const alternatives: Record<Alternative, { title: string; description: string; details: string[] }> = {
  basic: {
    title: 'Hacer una comprobación básica',
    description: 'Revisar aspectos que no requieren desarmar el equipo.',
    details: ['Reconocer lo que ves, sin saber la causa.', 'Ninguna. Si necesitás herramientas, detenete.', 'Puede haber riesgos aun sin desarmar. Respetá los límites indicados.', 'Un momento de observación, sin apuro.', 'Si comprendés qué vas a observar y no encontrás las situaciones de advertencia.'],
  },
  model: {
    title: 'Buscar información del modelo',
    description: 'Consultar el manual o información específica de tu lavarropas.',
    details: ['Identificar el modelo y leer su información. No hace falta saber reparar.', 'El manual o un medio para consultarlo.', 'Consultar no requiere intervenir. No sigas indicaciones que no comprendés.', 'Puede llevar un rato encontrar la información adecuada.', 'Si querés entender lo que indica el manual antes de decidir.'],
  },
  guidance: {
    title: 'Pedir orientación',
    description: 'Compartir la situación con alguien de confianza o con experiencia.',
    details: ['Contar lo que observaste. Podés decir que no sabés.', 'Ninguna para pedir orientación.', 'Pedir orientación no requiere intervenir. Un consejo no garantiza seguridad.', 'Depende de la disponibilidad de la otra persona.', 'Si tenés dudas o preferís pensar el próximo paso con alguien.'],
  },
  technician: {
    title: 'Contactar a un técnico',
    description: 'Solicitar una evaluación profesional.',
    details: ['Describir la situación, sin conocer la causa.', 'Ninguna de tu parte para solicitar la evaluación.', 'No requiere que intervengas. El profesional deberá evaluar la situación.', 'Coordinar una visita; puede implicar espera y costo.', 'Si encontrás advertencias, no comprendés qué revisar o preferís no intervenir.'],
  },
}
export const detailLabels = ['Nivel de conocimiento necesario', 'Herramientas necesarias', 'Riesgo de intervención', 'Tiempo/esfuerzo', 'Cuándo podría ser conveniente']
export function observations(answers: (Choice | null)[]) {
  return [
    answers[0] === 'Sí' ? 'El lavarropas indicó que el ciclo terminó.' : answers[0] === 'No' ? 'El lavarropas no indicó que el ciclo terminó.' : 'No sabés si el lavarropas indicó que el ciclo había terminado.',
    answers[1] === 'Sí' ? 'Reportaste un código o mensaje de error.' : answers[1] === 'No' ? 'No apareció un código de error.' : 'No sabés si muestra un código de error.',
    answers[2] === 'Sí' ? 'Reportaste ruido, olor o un comportamiento diferente.' : answers[2] === 'No' ? 'No se detectaron ruidos u olores inusuales.' : 'No sabés si hubo ruido, olor o un comportamiento diferente.',
  ]
}
export const confirmations: Record<Alternative, string> = {
  basic: 'Elegiste hacer una comprobación básica que no requiere desarmar el lavarropas.',
  model: 'Elegiste buscar información del modelo para consultar información específica de tu lavarropas.',
  guidance: 'Elegiste pedir orientación para pensar cómo avanzar con alguien de confianza o con experiencia.',
  technician: 'Elegiste contactar a un técnico para obtener una evaluación profesional.',
}
