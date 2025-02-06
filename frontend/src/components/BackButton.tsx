"use client";

const BackButton = () => {
  return (
    <button className="back-button" onClick={() => window.history.back()}>
      <span className="back-button-icon"></span>
      Go back
    </button>
  );
};

export default BackButton;
