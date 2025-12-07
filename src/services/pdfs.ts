export interface PDFMetadata {
  id: string;
  name: string;
  path: string;
  category: string;
  examType: "SSC" | "Banking" | "Both";
  language: "English" | "Hindi" | "Bilingual";
}

// All available PDFs from content_bank folder
export const availablePDFs: PDFMetadata[] = [
  // SSC - English
  {
    id: "ssc-cgl-2022-english",
    name: "SSC CGL 2022 Tier-1 All Shifts (English)",
    path: "/content_bank/ssc/english/ssc-cgl-2022-tier-1-all-40-shifts-papers-english.pdf",
    category: "Previous Year Papers",
    examType: "SSC",
    language: "English",
  },
  {
    id: "ssc-chsl-pyp-english",
    name: "SSC CHSL Previous Year Papers (English)",
    path: "/content_bank/ssc/english/ssc-chsl-pyp-english-2021.pdf",
    category: "Previous Year Papers",
    examType: "SSC",
    language: "English",
  },
  {
    id: "hindu-vocab-dec-2020",
    name: "The Hindu Vocabulary - December 2020",
    path: "/content_bank/ssc/english/The-Hindu-Vocab-PDF-December-2020.pdf",
    category: "Vocabulary",
    examType: "SSC",
    language: "English",
  },
  // SSC - General Awareness
  {
    id: "ssc-1000-gk-questions",
    name: "1000 GK Questions for SSC",
    path: "/content_bank/ssc/general_awareness/1000-gk-questions-ssc.pdf",
    category: "General Awareness",
    examType: "SSC",
    language: "English",
  },
  {
    id: "ssc-complete-ga-preparation",
    name: "Complete GA Preparation - RRB NTPC",
    path: "/content_bank/ssc/general_awareness/Complete-GA-Preparation-RRB-NTPC.pdf",
    category: "General Awareness",
    examType: "SSC",
    language: "English",
  },
  {
    id: "ssc-static-bolt",
    name: "General Static BOLT",
    path: "/content_bank/ssc/general_awareness/General-STATIC-BOLT.pdf",
    category: "General Awareness",
    examType: "SSC",
    language: "English",
  },
  {
    id: "ssc-bolt-may-2024",
    name: "SSC BOLT May 2024",
    path: "/content_bank/ssc/general_awareness/SSC BOLT May 2024.pdf",
    category: "Current Affairs",
    examType: "SSC",
    language: "English",
  },
  {
    id: "ssc-mega-ebook",
    name: "SSC Mega Ebook",
    path: "/content_bank/ssc/general_awareness/ssc_mega_ebook.pdf",
    category: "General Awareness",
    examType: "SSC",
    language: "English",
  },
  // SSC - Quantitative Aptitude
  {
    id: "ssc-500-pre-level-quant",
    name: "500+ Pre-Level Quant Questions",
    path: "/content_bank/ssc/quantitative_aptitude/500+_Pre-level_Quant_Questions.pdf",
    category: "Quantitative Aptitude",
    examType: "SSC",
    language: "English",
  },
  // Banking - Banking Awareness
  {
    id: "banking-mega-ebook",
    name: "Bank Mega Ebook",
    path: "/content_bank/banking/banking_awareness/bank_mega_ebook.pdf",
    category: "Banking Awareness",
    examType: "Banking",
    language: "English",
  },
  {
    id: "banking-bolt-static",
    name: "Banking BOLT - Static Banking GK",
    path: "/content_bank/banking/banking_awareness/BANKING BOLT_Static Banking GK.pdf",
    category: "Banking Awareness",
    examType: "Banking",
    language: "English",
  },
  {
    id: "ibps-po-clerk-mains-bolt",
    name: "IBPS PO/Clerk Mains Special BOLT",
    path: "/content_bank/banking/banking_awareness/IBPS-PO-Clerk-Mains-Special-BOLT.pdf",
    category: "Banking Awareness",
    examType: "Banking",
    language: "English",
  },
  {
    id: "sbi-clerk-mains-2024",
    name: "SBI Clerk Mains 2024 BOLT",
    path: "/content_bank/banking/banking_awareness/SBI_Clerk_Mains_2024_Bolt.pdf",
    category: "Banking Awareness",
    examType: "Banking",
    language: "English",
  },
  // Banking - Current Affairs
  {
    id: "january-2024-bolt",
    name: "January 2024 BOLT",
    path: "/content_bank/banking/current_affairs/January_2024_Bolt.pdf",
    category: "Current Affairs",
    examType: "Banking",
    language: "English",
  },
  // Banking - Financial Awareness
  {
    id: "financial-awareness-bolt",
    name: "Financial Awareness - IBPS PO/Clerk Mains",
    path: "/content_bank/banking/financial_awareness/IBPS-PO-Clerk-Mains-Special-BOLT.pdf",
    category: "Financial Awareness",
    examType: "Banking",
    language: "English",
  },
  // Bilingual - Hindi Versions
  {
    id: "banking-bolt-hindi",
    name: "Banking Bolt (Hindi)",
    path: "/content_bank/bilingual/hindi_versions/Banking Bolt.pdf",
    category: "Banking Awareness",
    examType: "Banking",
    language: "Hindi",
  },
  {
    id: "ebook-hindi-lic-1",
    name: "Ebook Hindi LIC - Part 1",
    path: "/content_bank/bilingual/hindi_versions/Ebook-Hindi-LIC.pdf",
    category: "Insurance",
    examType: "Both",
    language: "Hindi",
  },
  {
    id: "ebook-hindi-lic-2",
    name: "Ebook Hindi LIC - Part 2",
    path: "/content_bank/bilingual/hindi_versions/Ebook-Hindi-LIC-2.pdf",
    category: "Insurance",
    examType: "Both",
    language: "Hindi",
  },
  {
    id: "january-2024-bolt-hindi",
    name: "January 2024 BOLT (Hindi)",
    path: "/content_bank/bilingual/hindi_versions/January_2024_Bolt_Hindi.pdf",
    category: "Current Affairs",
    examType: "Both",
    language: "Hindi",
  },
  {
    id: "ssc-cgl-2022-hindi",
    name: "SSC CGL 2022 Tier-1 All Shifts (Hindi)",
    path: "/content_bank/bilingual/hindi_versions/ssc-cgl-2022-tier-1-all-40-shifts-papers-hindi.pdf",
    category: "Previous Year Papers",
    examType: "SSC",
    language: "Hindi",
  },
  {
    id: "ssc-chsl-pyp-hindi",
    name: "SSC CHSL Previous Year Papers (Hindi)",
    path: "/content_bank/bilingual/hindi_versions/ssc-chsl-pyp-hindi-2021.pdf",
    category: "Previous Year Papers",
    examType: "SSC",
    language: "Hindi",
  },
];

export function getPDFsByExamType(examType: "SSC" | "Banking"): PDFMetadata[] {
  return availablePDFs.filter(
    (pdf) => pdf.examType === examType || pdf.examType === "Both"
  );
}

export function getPDFsByCategory(category: string): PDFMetadata[] {
  return availablePDFs.filter(
    (pdf) => pdf.category.toLowerCase() === category.toLowerCase()
  );
}

export function getPDFById(id: string): PDFMetadata | undefined {
  return availablePDFs.find((pdf) => pdf.id === id);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(availablePDFs.map((pdf) => pdf.category)));
}

