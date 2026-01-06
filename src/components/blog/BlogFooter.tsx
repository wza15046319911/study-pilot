import Link from "next/link";

export function BlogFooter() {
  return (
    <>
      {/* CTA Section */}
      <section className="w-full bg-slate-50 dark:bg-slate-900 py-20 mt-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
            Ready to Ace Your Exams?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of students who are already studying smarter, not
            harder. Start your free trial today.
          </p>
          <Link
            href="/library"
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/20"
          >
            Start to Practice
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📚</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  StudyPilot
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                The AI-powered study companion that helps you master any subject
                faster with personalized learning paths.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                Product
              </h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                <li>
                  <Link
                    href="/library"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Library
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-blue-600 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                Company
              </h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-blue-600 transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 md:mb-0">
              © 2026 StudyPilot Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link
                href="/terms"
                className="hover:text-blue-600 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="hover:text-blue-600 transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
