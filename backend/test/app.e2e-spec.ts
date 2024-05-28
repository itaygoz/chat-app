import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket, io } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { Connection, Message, PrivateMessage } from '../src/chat/events';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let socket: Socket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(3001);
  });

  beforeEach((done) => {
    socket = io('http://localhost:3001');
    socket.on('connect', () => {
      console.log('Im connected!');

      done();
    });
  });

  afterEach(() => {
    socket.close();
  });

  afterAll(async () => {
    await app.close();
  });

  it('register room and get the new room list', (done) => {
    socket.on('room-list', (data) => {
      expect(data.rooms).toEqual(expect.arrayContaining(['room:test']));
      done();
    });
    socket.emit('register', {
      nickname: 'test',
      room: 'room:test',
    } as Connection);
  });

  it('test welcome message', (done) => {
    socket.on('message', (data) => {
      if (data.clientId === 'system') {
        expect(data).toEqual(
          expect.objectContaining({
            message: `Welcome 'test' to 'room:test!'`,
            clientId: 'system',
          }),
        );
        done();
      }
    });
    socket.emit('register', {
      nickname: 'test',
      room: 'room:test',
    } as Connection);
  });

  it('test private message', (done) => {
    socket.on('private-message', (data) => {
      expect(data).toEqual(
        expect.objectContaining({
          message: 'Hi there',
          clientId: socket2.id,
        }),
      );
      done();
    });
    const socket2 = io('http://localhost:3001');
    socket.emit('register', {
      nickname: 'test',
      room: 'room:test',
    } as Connection);
    socket2.emit('private-message', {
      nickname: 'test',
      room: 'room:test',
      message: 'Hi there',
      destination: socket.id,
    } as PrivateMessage);
  });

  it('test message', (done) => {
    socket.on('message', (data) => {
      if (data.clientId !== 'system') {
        expect(data).toEqual(
          expect.objectContaining({
            message: 'Hi there',
          }),
        );
        done();
      }
    });
    socket.emit('register', {
      nickname: 'test',
      room: 'room:test',
    } as Connection);
    socket.send({
      nickname: 'test',
      room: 'room:test',
      message: 'Hi there',
    } as Message);
  });

  it('test room info', (done) => {
    socket.on('room', (data) => {
      expect(data).toEqual(
        expect.objectContaining({
          clientId: socket.id,
          room: 'room:test',
        }),
      );
      done();
    });
    socket.emit('register', {
      nickname: 'test',
      room: 'room:test',
    } as Connection);
  });

  it('re register to the same room', (done) => {
    let counter = 0;
    socket.on('room-list', (data) => {
      if (counter % 1 == 1) {
        expect(data.rooms).toEqual(['room:test']);
      } else {
        expect(data.rooms).toEqual([]);
      }
      if (counter === 3) done();
      counter++;
    });
    socket.emit('register', {
      nickname: 'test',
      room: 'room:test',
    } as Connection);
    socket.emit('register', {
      nickname: 'test',
      room: 'room:test',
    } as Connection);
  });
});
