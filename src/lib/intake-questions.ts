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
  { id: 1, category: 'personal', question: { es: '¿Cuál es tu nombre completo?', fr: 'Quel est votre nom complet?', ht: 'Non konplè', en: 'What is your full name?' } },
  { id: 2, category: 'service', question: { es: '¿Qué servicio necesitas?', fr: 'Quel service avez-vous besoin?', ht: 'Ki service ou bezwen ?', en: 'What service do you need?' } },
  { id: 3, category: 'financial', question: { es: '¿Tienes una cuenta bancaria?', fr: 'Avez-vous un compte bancaire?', ht: 'Eskew gen yon kont bank ?', en: 'Do you have a bank account?' } },
  { id: 4, category: 'personal', question: { es: '¿Cuál es tu nacionalidad?', fr: 'Quelle est votre nationalité?', ht: 'Ki nasyonalitew ?', en: 'What is your nationality?' } },
  { id: 5, category: 'location', question: { es: '¿En qué país vives actualmente?', fr: 'Dans quel pays vivez-vous actuellement?', ht: 'nan ki peyi eap viv actuel ?', en: 'Which country do you currently live in?' } },
];

export function getQuestion(questionId: number, language: string): string {
  const question = INTAKE_QUESTIONS.find(q => q.id === questionId);
  if (!question) return '';
  return question.question[language as keyof typeof question.question] || question.question['en'];
}

export function getCategory(category: string, language: string): string {
  const categories: Record<string, Record<string, string>> = {
    personal: { es: 'Información Personal', fr: 'Informations Personnelles', ht: 'Enfòmasyon Pèsonèl', en: 'Personal Information' },
    service: { es: 'Servicio', fr: 'Service', ht: 'Sèvis', en: 'Service' },
    financial: { es: 'Información Financiera', fr: 'Informations Financières', ht: 'Enfòmasyon Finansye', en: 'Financial Information' },
    location: { es: 'Ubicación', fr: 'Emplacement', ht: 'Lokasyon', en: 'Location' },
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
