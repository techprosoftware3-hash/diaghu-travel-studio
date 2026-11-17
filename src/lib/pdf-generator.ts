import jsPDF from 'jspdf';
import { INTAKE_QUESTIONS, getQuestion, getCategory } from './intake-questions';

export interface IntakeData {
  answers: Record<number, string>;
  language: string;
  conversationId: string;
  userId?: string;
  date: string;
}

export function generateIntakePDF(data: IntakeData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = 20;

  // Add title
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text('DIAGHU - Ficha de Consulta Migratoria', margin, yPosition);
  yPosition += 15;

  // Add date and conversation info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Fecha: ${data.date}`, margin, yPosition);
  yPosition += 7;
  doc.text(`ID de Conversación: ${data.conversationId}`, margin, yPosition);
  yPosition += 7;
  if (data.userId) {
    doc.text(`ID de Usuario: ${data.userId}`, margin, yPosition);
    yPosition += 7;
  }
  yPosition += 10;

  // Group answers by category
  const categories = ['personal', 'project', 'situation', 'preparation', 'consultation'];
  const categoryNames: Record<string, string> = {
    personal: 'Información Personal',
    project: 'Proyecto de Migración',
    situation: 'Situación Actual',
    preparation: 'Preparación',
    consultation: 'Consulta y Servicios'
  };

  categories.forEach(category => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Add category header
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text(categoryNames[category], margin, yPosition);
    yPosition += 10;

    // Add questions and answers
    const categoryQuestions = INTAKE_QUESTIONS.filter(q => q.category === category);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    categoryQuestions.forEach((question, index) => {
      const questionText = getQuestion(question.id, data.language);
      const answer = data.answers[question.id] || 'No respondido';

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Add question
      doc.setFont(undefined, 'bold');
      const questionLines = doc.splitTextToSize(`${index + 1}. ${questionText}`, maxWidth);
      doc.text(questionLines, margin, yPosition);
      yPosition += questionLines.length * 5;

      // Add answer
      doc.setFont(undefined, 'normal');
      const answerLines = doc.splitTextToSize(`Respuesta: ${answer}`, maxWidth);
      doc.text(answerLines, margin, yPosition);
      yPosition += answerLines.length * 5 + 5;
    });

    yPosition += 5;
  });

  // Add footer
  yPosition = 280;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Este documento contiene información recopilada durante la consulta inicial.', margin, yPosition);
  yPosition += 5;
  doc.text('Diaghu Asesor Migratorio - Todos los derechos reservados', margin, yPosition);

  return doc.output('blob');
}

export function downloadIntakePDF(data: IntakeData, filename?: string): void {
  const pdfBlob = generateIntakePDF(data);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `diaghu-intake-${data.conversationId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
