import { ArrowUpRight, Braces } from "lucide-react";

const FooterBrand = () => (
  <footer className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/8">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
      <div className="flex items-start gap-3 text-center sm:text-left">
        <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Braces size={14} className="text-blue-400" />
        </div>
        <div>
          <p className="font-semibold text-sm">Built by HalxDocs</p>
          <p className="text-xs opacity-50 leading-relaxed mt-0.5 max-w-sm">
            Built while cleaning thousands of JSON lines during a Bible app project —
            so developers never struggle with massive JSON structures again.
          </p>
        </div>
      </div>

      <a
        href="https://halxdocs.com"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium
          transition-all hover:scale-[1.03] active:scale-95
          bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90
          dark:bg-white/5 dark:border-white/10"
      >
        View Creator
        <ArrowUpRight size={14} />
      </a>
    </div>
  </footer>
);

export default FooterBrand;
