import './SiteLogo.css';

type SiteLogoProps = {
  className?: string;
  size?: number;
};

export const SiteLogo = ({ className = '', size }: SiteLogoProps) => (
  <span
    className={`site-logo ${className}`.trim()}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
  >
    <img src="/brand/logo-quill-dark.png" alt="" className="site-logo__mark site-logo__mark--dark" />
    <img src="/brand/logo-quill-light.png" alt="" className="site-logo__mark site-logo__mark--light" />
  </span>
);
