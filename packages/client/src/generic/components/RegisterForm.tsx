import React from 'react';

const RegisterForm = ({
  errors,
  handleSubmit
}: {
  errors?: { messages: string[]; status: number };
  handleSubmit: (nickname: string) => void;
}) => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nicknameInput = (e.target as HTMLFormElement).nickname.value;

    handleSubmit(nicknameInput);
  };

  const renderErrors = () => {
    return (
      errors &&
      errors.messages.map((v, i) => (
        <div key={i} className="error-message">
          {v}
        </div>
      ))
    );
  };

  return (
    <div className="register-form-container">
      <form onSubmit={onSubmit} className="register-form">
        {renderErrors()}
        <input
          type="text"
          name="nickname"
          placeholder="Enter your nickname"
          className="input-field"
          autoFocus
          required
        />
        <button type="submit" className="submit-button">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
