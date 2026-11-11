export default function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return <Tag className={`rounded-2xl border border-line bg-white p-6 shadow-card ${className}`} {...props}>{children}</Tag>;
}
