import { FormEvent } from 'react';
import Modal from '../../generic/components/Modal';

const CreateRoomModal = ({
  closeFunc,
  createRoom
}: {
  closeFunc: () => void;
  createRoom: (room: string) => void;
}) => {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const roomNameInput = (e.target as HTMLFormElement).room.value;

    if (roomNameInput) {
      createRoom(`room:${roomNameInput}`);
      return closeFunc();
    }
  };
  return (
    <Modal closeFunc={closeFunc}>
      <form onSubmit={onSubmit} className="register-form">
        <input
          type="text"
          name="room"
          placeholder="Create Room"
          className="input-field"
          autoFocus
          minLength={2}
          required
        />
        <button type="submit" className="submit-button">
          Create
        </button>
      </form>
    </Modal>
  );
};

export default CreateRoomModal;
