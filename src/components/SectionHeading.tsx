import React from 'react';
import '../styles/SectionHeading.css';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ 
  title, 
  subtitle, 
  children, 
  className, 
  action 
}) => (
  <div className={`section-heading-wrapper ${className || ''}`}>
    <div className="section-heading-container">
      <div>
        <div className="section-heading-title">{title}</div>
        {subtitle && <div className="section-heading-subtitle">{subtitle}</div>}
        {children}
      </div>
      {action && (
        <div className="section-heading-action">
          {action}
        </div>
      )}
    </div>
  </div>
);

export default SectionHeading; 