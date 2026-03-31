type CaseStudy = {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  summary: string;
  sections: CaseStudySection[];
};

type CaseStudySection = {
  heading: string;
  body: string;
  table?: { headers: string[]; rows: string[][] };
  code?: { label: string; code: string };
};

export { type CaseStudy, type CaseStudySection };
