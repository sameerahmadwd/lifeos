import React from 'react';

const Button = ({ children, onClick, type = 'button', isLoading }) => {
  return (
    <button 
      className="btn" 
      onClick={onClick} 
      type={type} 
      disabled={isLoading}
    >
      {isLoading ? (
        <React.Fragment>
          <span className="btn-icon">
            <svg className="animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"></circle>
              <path d="M12 2v4a6 6 0 00-6 6H2a10 10 0 0110-10z" fill="currentColor"></path>
            </svg>
          </span>
          Processing...
        </React.Fragment>
      ) : children}
    </button>
  );
};

export default Button;
