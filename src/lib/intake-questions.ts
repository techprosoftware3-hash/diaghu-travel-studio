// Questions for client intake in multiple languages
export interface IntakeQuestion {
  id: number;
  category: string;
  question: {
    es: string;
    fr: string;
    ht: string;
    en: string;
  };
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  // Personal Information
  { id: 1, category: 'personal', question: { es: '¿Cuál es tu nombre completo?', fr: 'Quel est votre nom complet?', ht: 'Ki non konplè ou?', en: 'What is your full name?' } },
  { id: 2, category: 'personal', question: { es: '¿Cuál es tu nacionalidad?', fr: 'Quelle est votre nationalité?', ht: 'Ki nasyonalite ou?', en: 'What is your nationality?' } },
  { id: 3, category: 'personal', question: { es: '¿En qué país te encuentras actualmente?', fr: 'Dans quel pays êtes-vous actuellement?', ht: 'Nan ki peyi ou ye kounye a?', en: 'Which country are you currently in?' } },
  { id: 4, category: 'personal', question: { es: '¿En qué ciudad resides?', fr: 'Dans quelle ville résidez-vous?', ht: 'Nan ki vil ou rete?', en: 'Which city do you live in?' } },
  { id: 5, category: 'personal', question: { es: '¿Cuál es tu número de WhatsApp?', fr: 'Quel est votre numéro WhatsApp?', ht: 'Ki nimewo WhatsApp ou?', en: 'What is your WhatsApp number?' } },
  { id: 6, category: 'personal', question: { es: '¿Cuál es tu correo electrónico?', fr: 'Quelle est votre adresse e-mail?', ht: 'Ki adrès imèl ou?', en: 'What is your email address?' } },
  { id: 7, category: 'personal', question: { es: '¿Qué idioma prefieres usar: Criollo, Francés o Español?', fr: 'Quelle langue préférez-vous utiliser: Créole, Français ou Espagnol?', ht: 'Ki lang ou prefere itilize: Kreyòl, Franse oswa Panyòl?', en: 'Which language do you prefer to use: Creole, French, or Spanish?' } },

  // Migration Project
  { id: 8, category: 'project', question: { es: '¿A qué país te gustaría ir?', fr: 'Dans quel pays aimeriez-vous aller?', ht: 'Nan ki peyi ou ta renmen ale?', en: 'Which country would you like to go to?' } },
  { id: 9, category: 'project', question: { es: '¿Cuál es el objetivo de tu viaje: turismo, trabajo, estudios, familia u otro?', fr: 'Quel est l\'objectif de votre voyage: tourisme, travail, études, famille ou autre?', ht: 'Ki objektif vwayaj ou: touris, travay, etid, fanmi oswa lòt?', en: 'What is the purpose of your trip: tourism, work, studies, family, or other?' } },
  { id: 10, category: 'project', question: { es: '¿Por qué elegiste este país?', fr: 'Pourquoi avez-vous choisi ce pays?', ht: 'Poukisa ou chwazi peyi sa a?', en: 'Why did you choose this country?' } },
  { id: 11, category: 'project', question: { es: '¿Tienes otro país como alternativa?', fr: 'Avez-vous un autre pays comme alternative?', ht: 'Èske ou gen yon lòt peyi kòm altènativ?', en: 'Do you have another country as an alternative?' } },
  { id: 12, category: 'project', question: { es: '¿Ya tienes un proyecto de migración bien definido?', fr: 'Avez-vous déjà un projet de migration bien défini?', ht: 'Èske ou deja gen yon pwojè migrasyon byen defini?', en: 'Do you already have a well-defined migration project?' } },

  // Current Situation
  { id: 13, category: 'situation', question: { es: '¿Qué estatus migratorio tienes en el país donde estás?', fr: 'Quel statut migratoire avez-vous dans le pays où vous êtes?', ht: 'Ki estati migratwa ou genyen nan peyi kote ou ye a?', en: 'What is your immigration status in the country where you are?' } },
  { id: 14, category: 'situation', question: { es: '¿Es válido tu pasaporte?', fr: 'Votre passeport est-il valide?', ht: 'Èske paspò ou valab?', en: 'Is your passport valid?' } },
  { id: 15, category: 'situation', question: { es: '¿Ya tienes una visa para otro país?', fr: 'Avez-vous déjà un visa pour un autre pays?', ht: 'Èske ou deja gen yon viza pou yon lòt peyi?', en: 'Do you already have a visa for another country?' } },
  { id: 16, category: 'situation', question: { es: '¿Ya has solicitado una visa?', fr: 'Avez-vous déjà demandé un visa?', ht: 'Èske ou te deja aplike pou yon viza?', en: 'Have you already applied for a visa?' } },
  { id: 17, category: 'situation', question: { es: 'Si te rechazaron una visa anteriormente, ¿en qué país fue?', fr: 'Si on vous a refusé un visa précédemment, dans quel pays était-ce?', ht: 'Si yo te refize w yon viza deja, nan ki peyi sa te fèt?', en: 'If you were refused a visa before, in which country was it?' } },

  // Preparation
  { id: 18, category: 'preparation', question: { es: '¿Cuándo te gustaría comenzar tus trámites?', fr: 'Quand aimeriez-vous commencer vos démarches?', ht: 'Kilè ou ta renmen kòmanse demach ou?', en: 'When would you like to start your process?' } },
  { id: 19, category: 'preparation', question: { es: '¿Tienes una fecha de salida prevista?', fr: 'Avez-vous une date de départ prévue?', ht: 'Èske ou gen yon dat depa ou prevwa?', en: 'Do you have a planned departure date?' } },
  { id: 20, category: 'preparation', question: { es: '¿Qué documentos ya tienes para el proyecto?', fr: 'Quels documents avez-vous déjà pour le projet?', ht: 'Ki dokiman ou deja genyen pou pwojè a?', en: 'What documents do you already have for the project?' } },
  { id: 21, category: 'preparation', question: { es: '¿Tienes un presupuesto previsto para el proyecto de migración?', fr: 'Avez-vous un budget prévu pour le projet de migration?', ht: 'Èske ou gen yon bidjè ou prevwa pou pwojè migrasyon an?', en: 'Do you have a budget planned for the migration project?' } },
  { id: 22, category: 'preparation', question: { es: '¿Tienes intención de viajar solo o con tu familia?', fr: 'Avez-vous l\'intention de voyager seul ou avec votre famille?', ht: 'Èske ou gen entansyon vwayaje poukont ou oswa avèk fanmi ou?', en: 'Do you intend to travel alone or with your family?' } },

  // Consultation and Services
  { id: 23, category: 'consultation', question: { es: '¿Qué tipo de asistencia necesitas de Diaghu Asesor Migratorio?', fr: 'Quel type d\'assistance avez-vous besoin de Diaghu Asesor Migratorio?', ht: 'Ki kalite asistans ou bezwen nan men Diaghu Asesor Migratorio?', en: 'What type of assistance do you need from Diaghu Asesor Migratorio?' } },
  { id: 24, category: 'consultation', question: { es: '¿Te gustaría un análisis de tu proyecto de migración?', fr: 'Aimeriez-vous une analyse de votre projet de migration?', ht: 'Èske ou ta renmen yon analiz sou pwojè migrasyon ou?', en: 'Would you like an analysis of your migration project?' } },
  { id: 25, category: 'consultation', question: { es: '¿Sabes que la consulta de Diaghu es obligatoria y cuesta 50 USD?', fr: 'Savez-vous que la consultation Diaghu est obligatoire et coûte 50 USD?', ht: 'Èske ou konnen konsiltasyon Diaghu a obligatwa epi li koute 50 USD?', en: 'Do you know that the Diaghu consultation is mandatory and costs 50 USD?' } },
  { id: 26, category: 'consultation', question: { es: '¿Estás disponible para tomar una cita?', fr: 'Êtes-vous disponible pour prendre un rendez-vous?', ht: 'Èske ou disponib pou pran yon randevou?', en: 'Are you available to take an appointment?' } },
  { id: 27, category: 'consultation', question: { es: '¿Cuál es el mejor momento para que el equipo de Diaghu te contacte?', fr: 'Quel est le meilleur moment pour que l\'équipe Diaghu vous contacte?', ht: 'Ki lè ki pi bon pou ekip Diaghu a kontakte ou?', en: 'What is the best time for the Diaghu team to contact you?' } },
];

export function getQuestion(questionId: number, language: string): string {
  const question = INTAKE_QUESTIONS.find(q => q.id === questionId);
  if (!question) return '';
  return question.question[language as keyof typeof question.question] || question.question['en'];
}

export function getCategory(category: string, language: string): string {
  const categories: Record<string, Record<string, string>> = {
    personal: { es: 'Información Personal', fr: 'Informations Personnelles', ht: 'Enfòmasyon Pèsonèl', en: 'Personal Information' },
    project: { es: 'Proyecto de Migración', fr: 'Projet de Migration', ht: 'Pwojè Migrasyon', en: 'Migration Project' },
    situation: { es: 'Situación Actual', fr: 'Situation Actuelle', ht: 'Sitiyasyon Aktyèl', en: 'Current Situation' },
    preparation: { es: 'Preparación', fr: 'Préparation', ht: 'Preparasyon', en: 'Preparation' },
    consultation: { es: 'Consulta y Servicios', fr: 'Consultation et Services', ht: 'Konsiltasyon ak Sèvis', en: 'Consultation and Services' },
  };
  return categories[category]?.[language as keyof typeof categories[category]] || categories[category]?.['en'] || category;
}

export function getCompletionMessage(language: string): string {
  const messages: Record<string, string> = {
    es: '¡Gracias por completar la información! Basado en tus respuestas, te recomiendo programar una consulta con Diaghu Asesor Migratorio. La consulta cuesta 50 USD y nos permitirá analizar tu caso en detalle.\n\n⚠️ **IMPORTANTE**: Debes realizar el pago y adjuntar el comprobante para que tu caso sea tomado en cuenta. Cualquier solicitud sin comprobante será rechazada.\n\nPara proceder con el pago de la consulta, puedes utilizar uno de los siguientes métodos:\n\n💳 **PayPal**: https://www.paypal.com/ncp/payment/VFWUNHUB4A88C\n\n🏦 **Pichincha**: https://envios.pichincha.com/l/CN1LBrB8\n\nUna vez realizado el pago, adjunta el comprobante para programar tu cita.',
    fr: 'Merci d\'avoir complété les informations! Basé sur vos réponses, je vous recommande de planifier une consultation avec Diaghu Asesor Migratorio. La consultation coûte 50 USD et nous permettra d\'analyser votre cas en détail.\n\n⚠️ **IMPORTANT**: Vous devez effectuer le paiement et joindre le reçu pour que votre cas soit pris en compte. Toute demande sans reçu sera rejetée.\n\nPour procéder au paiement de la consultation, vous pouvez utiliser l\'une des méthodes suivantes:\n\n💳 **PayPal**: https://www.paypal.com/ncp/payment/VFWUNHUB4A88C\n\n🏦 **Pichincha**: https://envios.pichincha.com/l/CN1LBrB8\n\nUne fois le paiement effectué, veuillez joindre le reçu pour planifier votre rendez-vous.',
    ht: 'Mèsi pou finisman enfòmasyon an! Baze sou repons ou yo, mwen rekòmande ou pwograme yon konsiltasyon ak Diaghu Asesor Migratorio. Konsiltasyon an koute 50 USD epi li pèmèt nou analize ka ou an detay.\n\n⚠️ **ENPÒTAN**: Ou dwe fè peyman an epi jwen resi a pou ka ou a ka pran an konsiderasyon. Okenn demann san resi ap rejte.\n\nPou pwosede ak peyman konsiltasyon an, ou ka itilize youn nan metòd sa yo:\n\n💳 **PayPal**: https://www.paypal.com/ncp/payment/VFWUNHUB4A88C\n\n🏦 **Pichincha**: https://envios.pichincha.com/l/CN1LBrB8\n\nYon fwa peyman an fèt, tanpri jwen resi a pou pwograme randevou ou.',
    en: 'Thank you for completing the information! Based on your answers, I recommend scheduling a consultation with Diaghu Asesor Migratorio. The consultation costs 50 USD and will allow us to analyze your case in detail.\n\n⚠️ **IMPORTANT**: You must make the payment and attach the receipt for your case to be considered. Any request without receipt will be rejected.\n\nTo proceed with the consultation payment, you can use one of the following methods:\n\n💳 **PayPal**: https://www.paypal.com/ncp/payment/VFWUNHUB4A88C\n\n🏦 **Pichincha**: https://envios.pichincha.com/l/CN1LBrB8\n\nOnce payment is made, please attach the receipt to schedule your appointment.'
  };
  return messages[language] || messages['en'];
}
