import { useEffect } from 'react';
import './App.css';
import ChatPage from './chat/components/ChatPage';
import { useListeners } from './chat/hooks/useListeners';
import { NavBar } from './generic/components/NavBar';
import RegisterForm from './generic/components/RegisterForm';
import { useConnection } from './generic/hooks/useConnection';
import { useErrorsState } from './generic/hooks/useErrors';
import { useSocket } from './generic/hooks/useSocket';
import { register } from './socket/actions';
import { socket } from './socket/config';

const errorPath = 'register';

const App = () => {
  const { connection, setConnection } = useConnection((state) => ({
    connection: state.connection,
    setConnection: state.setConnection
  }));
  const { errors, resetErrors } = useErrorsState(errorPath);
  const isConnected = connection && !errors;

  useSocket();
  useListeners();

  useEffect(() => {
    if (errors) {
      setConnection(undefined);
    }
  }, [errors, setConnection]);

  const registerHandler = (nickname: string) => {
    if (errors) {
      resetErrors();
    }
    register(nickname, 'room:main');
    setConnection({
      clientId: socket.id!,
      nickname,
      room: 'room:main'
    });
  };

  const renderTitle = () => {
    return isConnected ? `Welcome ${connection.nickname}!` : 'Please register';
  };

  const signOut = () => {
    console.log('signing out');
    setConnection(undefined);
    socket.disconnect();
  };

  return (
    <div className="App">
      <NavBar connected={isConnected ?? false} content={renderTitle()} signOut={signOut} />
      <div>
        {isConnected ? (
          <ChatPage />
        ) : (
          <RegisterForm errors={errors} handleSubmit={registerHandler} />
        )}
      </div>
    </div>
  );
};

export default App;
