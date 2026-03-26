interface Logout{
  size : number,
  color : string,
  onClick : ()=>void
}
export default function Logout_icon({ size = 24, color = "#667eea",onClick } : Logout) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      onClick={onClick}
      style={{cursor:"pointer"}}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Door */}
      <rect x="3" y="4" width="12" height="16" />
      {/* Door knob */}
      <circle cx="13" cy="12" r="1" fill={color} />
      {/* Arrow pointing out */}
      <path d="M15 12h6m0 0l-3-3m3 3l-3 3" />
    </svg>
  );
}