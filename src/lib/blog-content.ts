export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string; // HTML content
  author: {
    name: string;
    role: string;
    avatar: string; // url or initials
  };
  tags: string[];
  coverImage?: string;
  category: string; // e.g. "Engineering", "Product", "Community"
}

export const blogPosts: BlogPost[] = [
  {
    slug: "why-you-shouldnt-trust-ai-for-exam-answers",
    title: "Why You Shouldn't Rely on AI for Exam Answers",
    excerpt:
      "While AI tools like ChatGPT are powerful, using them for exam preparation carries significant risks. Discover why human-verified resources are superior for academic success.",
    date: "Jan 6, 2026",
    readTime: "5 min read",
    category: "Education",
    author: {
      name: "StudyPilot Team",
      role: "Education Experts",
      avatar: "SP",
    },
    tags: ["Study Tips", "AI in Education", "Exam Prep"],
    coverImage: "/images/blog/ai-exam-trust.jpg", // Placeholder path
    content: `
      <h2>The Allure of AI in Education</h2>
      <p>
        In the age of generative AI, it's tempting to copy-paste an exam question into a chatbot and trust the instant response. After all, these models have read the entire internet, right? While Large Language Models (LLMs) are impressive, they are fundamentally <strong>predictive text engines</strong>, not knowledge bases. They prioritize sounding plausible over being factually correct.
      </p>

      <h2>1. The Hallucination Problem</h2>
      <p>
        The most critical flaw of AI models is "hallucination." An AI can confidently generate a completely fabricated fact, a non-existent legal precedent, or a chemically impossible reaction.
      </p>
      <ul>
        <li><strong>False Confidence:</strong> AI answers don't come with a "confidence score." A wrong answer looks just as authoritative as a right one.</li>
        <li><strong>Subtle Errors:</strong> In complex subjects like engineering or medicine, an answer might be 95% correct but contain a fatal flaw in the final step.</li>
      </ul>

      <h2>2. Lack of Curriculum Context</h2>
      <p>
        University exams are specific to a course's syllabus. An AI model gives you a "general consensus" answer, which might contradict the specific methodology or notation taught by your professor.
      </p>
      <p>
        For example, a variable name in a Physics equation might differ between textbooks. An AI might use the most common notation, while your exam marks you down for not using the course-standard notation.
      </p>

      <h2>3. Reasoning vs. Pattern Matching</h2>
      <p>
        Exams test your ability to <em>reason</em>. AI approximates reasoning by matching patterns it has seen before.
      </p>
      <blockquote>
        "Learning is about the process of arriving at an answer, not just the answer itself. If you rely on AI to bypass the struggle, you bypass the learning."
      </blockquote>
      <p>
        When you encounter a question on the final that is slightly different from the practice ones, the pattern-matching approach fails. True understanding—gained through practice and grappling with difficult concepts—adapts.
      </p>

      <h2>The StudyPilot Advantage: Verified Accuracy</h2>
      <p>
        This is why platforms like <strong>StudyPilot</strong> are essential. Our question banks are:
      </p>
      <ol>
        <li><strong>Curated by Humans:</strong> Every question is reviewed for accuracy and relevance to your specific university courses.</li>
        <li><strong>Syllabus-Aligned:</strong> We know exactly what your specific course covers this semester.</li>
        <li><strong>Explanation-Rich:</strong> We provide detailed steps explaining <em>why</em> an answer is correct, not just <em>what</em> it is.</li>
      </ol>

      <h2>Conclusion</h2>
      <p>
        Use AI as a tutor to explain concepts, or a brainstorming partner to generate ideas. But when it comes to the specific, high-stakes answers required for university exams, trust verified sources. Your GPA will thank you.
      </p>
    `,
  },
  {
    slug: "mastering-spaced-repetition",
    title: "Mastering Spaced Repetition for Finals",
    excerpt:
      "Learn how to optimize your study schedule using the scientifically proven spaced repetition technique to retain information longer.",
    date: "Jan 4, 2026",
    readTime: "7 min read",
    category: "Study Tips",
    author: {
      name: "Dr. Sarah Chen",
      role: "Cognitive Psychologist",
      avatar: "SC",
    },
    tags: ["Memory", "Study Techniques"],
    content: "<p>Content placeholder...</p>",
  },
  {
    slug: "engineering-mechanics-101",
    title: "Engineering Mechanics: Top 5 Mistakes Students Make",
    excerpt:
      "From free body diagrams to unit conversion errors, we break down the most common pitfalls in first-year engineering mechanics.",
    date: "Dec 28, 2025",
    readTime: "6 min read",
    category: "Engineering",
    author: {
      name: "Prof. James Wilson",
      role: "Senior Lecturer",
      avatar: "JW",
    },
    tags: ["Engineering", "Mechanics", "University"],
    content: "<p>Content placeholder...</p>",
  },
  {
    slug: "updates-jan-2026",
    title: "Product Update: Dark Mode & New Question Banks",
    excerpt:
      "We've listened to your feedback! Introducing a sleek new dark mode for late-night study sessions and 50+ new question banks.",
    date: "Jan 2, 2026",
    readTime: "3 min read",
    category: "Product",
    author: {
      name: "StudyPilot Team",
      role: "Product",
      avatar: "SP",
    },
    tags: ["Product Update", "Features"],
    content: "<p>Content placeholder...</p>",
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts;
}
