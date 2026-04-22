import { Twitter, Linkedin, Github, Facebook } from "lucide-react";
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto max-w-[1304px] px-6 py-12">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="text-sm text-white/50 mb-2">
              VIDCLUSTER
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Topic intelligence system for YouTube.  
              Discover what is growing — not just what is trending.
            </p>
          </div>

          {/* Links */}
          <div>
            <div className="text-sm text-white/50 mb-3">Navigation</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="/" className="hover:text-white">Home</a>
              </li>
              <li>
                <a href="/insights" className="hover:text-white">Insights</a>
              </li>
              <li>
                <a href="/method" className="hover:text-white">Method</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white">Contact</a>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <div className="text-sm text-white/50 mb-3">
              Early Access
            </div>
            <p className="text-white/60 text-sm mb-4">
              Get access when VidCluster opens.
            </p>

            <a
              href="/"
              className="inline-block rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:border-white/40 transition"
            >
              Join Early Access
            </a>
          </div>
        </div>
         <div>
        <div className="text-sm text-white/50 mb-3">Follow</div>

        <div className="flex items-center gap-4">

            <a
            href="https://twitter.com/vidcluster"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition"
            >
            <Twitter size={18} />
            </a>

            <a
            href="https://facebook.com/vidcluster"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition"
            >
            <Facebook size={18} />
            </a>

            <a
            href="https://github.com/agentdot/vidcluster"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition"
            >
            <Github size={18} />
            </a>

        </div>
        </div>


        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/10 text-xs text-white/40 flex flex-col md:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} VidCluster</div>
          <div>Built on structured topic intelligence</div>
        </div>
       
      </div>
    </footer>
  );
}