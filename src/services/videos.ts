export interface VideoMetadata {
  id: string;
  filename: string;
  title: string;
  titleHi?: string;
  topic: string;
  subject: string;
  examType: "SSC" | "Banking";
  duration: number; // in seconds
  difficulty: "beginner" | "intermediate" | "advanced";
  path: string;
}

// Video metadata mapping based on file naming convention
export const videoMetadata: VideoMetadata[] = [
  // SSC Videos
  {
    id: "ssc-average",
    filename: "ssc_average.mp4",
    title: "Average Tricks",
    titleHi: "औसत ट्रिक्स",
    topic: "Average",
    subject: "Quantitative Aptitude",
    examType: "SSC",
    duration: 60,
    difficulty: "beginner",
    path: "/videos/ssc/ssc_average.mp4",
  },
  {
    id: "ssc-bloodrelations",
    filename: "ssc_bloodrelations.mp4",
    title: "Blood Relations",
    titleHi: "रक्त संबंध",
    topic: "Blood Relations",
    subject: "General Intelligence and Reasoning",
    examType: "SSC",
    duration: 60,
    difficulty: "beginner",
    path: "/videos/ssc/ssc_bloodrelations.mp4",
  },
  {
    id: "ssc-codingdecoding",
    filename: "ssc_codingdecoding.mp4",
    title: "Coding Decoding",
    titleHi: "कोडिंग डिकोडिंग",
    topic: "Coding Decoding",
    subject: "General Intelligence and Reasoning",
    examType: "SSC",
    duration: 60,
    difficulty: "intermediate",
    path: "/videos/ssc/ssc_codingdecoding.mp4",
  },
  {
    id: "ssc-embeddedfigures",
    filename: "ssc_embeddedfigures.mp4",
    title: "Embedded Figures",
    titleHi: "एम्बेडेड फिगर्स",
    topic: "Embedded Figures",
    subject: "General Intelligence and Reasoning",
    examType: "SSC",
    duration: 60,
    difficulty: "advanced",
    path: "/videos/ssc/ssc_embeddedfigures.mp4",
  },
  {
    id: "ssc-parajumbles",
    filename: "ssc_parajumbles.mp4",
    title: "Para Jumbles",
    titleHi: "पैरा जंबल्स",
    topic: "Para Jumbles",
    subject: "English Language",
    examType: "SSC",
    duration: 60,
    difficulty: "intermediate",
    path: "/videos/ssc/ssc_parajumbles.mp4",
  },
  {
    id: "ssc-profitloss",
    filename: "ssc_profitloss.mp4",
    title: "Profit and Loss",
    titleHi: "लाभ और हानि",
    topic: "Profit and Loss",
    subject: "Quantitative Aptitude",
    examType: "SSC",
    duration: 60,
    difficulty: "beginner",
    path: "/videos/ssc/ssc_profitloss.mp4",
  },
  {
    id: "ssc-venndiagrams",
    filename: "ssc_venndiagrams.mp4",
    title: "Venn Diagrams",
    titleHi: "वेन आरेख",
    topic: "Venn Diagrams",
    subject: "General Intelligence and Reasoning",
    examType: "SSC",
    duration: 60,
    difficulty: "intermediate",
    path: "/videos/ssc/ssc_venndiagrams.mp4",
  },
  // Banking Videos
  {
    id: "banking-codingdecoding",
    filename: "banking coding decoding.mp4",
    title: "Coding Decoding",
    titleHi: "कोडिंग डिकोडिंग",
    topic: "Coding Decoding",
    subject: "Reasoning Ability",
    examType: "Banking",
    duration: 60,
    difficulty: "intermediate",
    path: "/videos/banking/banking coding decoding.mp4",
  },
  {
    id: "banking-financialmarkets",
    filename: "banking Financial Markets.mp4",
    title: "Financial Markets",
    titleHi: "वित्तीय बाजार",
    topic: "Financial Markets",
    subject: "General/Economic/Banking Awareness",
    examType: "Banking",
    duration: 60,
    difficulty: "advanced",
    path: "/videos/banking/banking Financial Markets.mp4",
  },
  {
    id: "banking-numberseries",
    filename: "banking number series.mp4",
    title: "Number Series",
    titleHi: "संख्या श्रृंखला",
    topic: "Number Series",
    subject: "Quantitative Aptitude",
    examType: "Banking",
    duration: 60,
    difficulty: "beginner",
    path: "/videos/banking/banking number series.mp4",
  },
  {
    id: "banking-parajumbles",
    filename: "banking para jumbles.mp4",
    title: "Para Jumbles",
    titleHi: "पैरा जंबल्स",
    topic: "Para Jumbles",
    subject: "English Language",
    examType: "Banking",
    duration: 60,
    difficulty: "intermediate",
    path: "/videos/banking/banking para jumbles.mp4",
  },
  {
    id: "banking-quadraticequation",
    filename: "banking quadratic equation tricks.mp4",
    title: "Quadratic Equation Tricks",
    titleHi: "द्विघात समीकरण ट्रिक्स",
    topic: "Quadratic Equations",
    subject: "Quantitative Aptitude",
    examType: "Banking",
    duration: 60,
    difficulty: "advanced",
    path: "/videos/banking/banking quadratic equation tricks.mp4",
  },
  {
    id: "banking-simplification",
    filename: "banking simplification.mp4",
    title: "Simplification",
    titleHi: "सरलीकरण",
    topic: "Simplification",
    subject: "Quantitative Aptitude",
    examType: "Banking",
    duration: 60,
    difficulty: "beginner",
    path: "/videos/banking/banking simplification.mp4",
  },
  {
    id: "banking-syllogism",
    filename: "banking syllogism reasoning.mp4",
    title: "Syllogism Reasoning",
    titleHi: "सिलॉजिज़्म रीज़निंग",
    topic: "Syllogism",
    subject: "Reasoning Ability",
    examType: "Banking",
    duration: 60,
    difficulty: "intermediate",
    path: "/videos/banking/banking syllogism reasoning.mp4",
  },
];

export function getVideosByExamType(examType: "SSC" | "Banking"): VideoMetadata[] {
  return videoMetadata.filter((v) => v.examType === examType);
}

export function getVideosByTopic(topic: string): VideoMetadata[] {
  return videoMetadata.filter((v) =>
    v.topic.toLowerCase().includes(topic.toLowerCase())
  );
}

export function getVideosBySubject(subject: string): VideoMetadata[] {
  return videoMetadata.filter((v) =>
    v.subject.toLowerCase().includes(subject.toLowerCase())
  );
}

export function getVideoById(id: string): VideoMetadata | undefined {
  return videoMetadata.find((v) => v.id === id);
}

