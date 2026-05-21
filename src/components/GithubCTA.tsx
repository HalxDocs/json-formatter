// components/GithubCTA.tsx


import { Github } from "lucide-react";

const GithubCTA = () => {
  return (
    <a
      href="https://github.com/HalxDocs/json-formatter"
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex items-center gap-2 px-4 py-2 rounded-2xl 
        bg-black/20 hover:bg-black/30
        text-white/90 text-sm font-medium
        transition shadow-xl backdrop-blur-xl
      "
    >
      <Github size={18} />
      Star on GitHub
    </a>
  );
};

export default GithubCTA;
