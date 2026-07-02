import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { userRepository } from '../../../src/infrastructure/persistence/repositories/user.repository';
import { UserModel } from '../../../src/infrastructure/persistence/mongo/models/user.model';

let mongoServer: MongoMemoryServer;

describe('user.repository (MongoDB)', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db?.dropDatabase();
    await UserModel.syncIndexes();
  });

  it('crea y encuentra usuario por email', async () => {
    const created = await userRepository.create({
      university_id: 'uni-1',
      full_name: 'Ana Pérez',
      email: 'ana@uni.edu',
      password: 'password123',
      password_hash: 'hashed',
    });

    const found = await userRepository.findByEmail('ana@uni.edu');

    expect(found).not.toBeNull();
    expect(found!.id).toBe(created.id);
    expect(found!.full_name).toBe('Ana Pérez');
    expect(found!.role).toBe('student');
  });

  it('encuentra usuario por id', async () => {
    const created = await userRepository.create({
      university_id: 'uni-1',
      full_name: 'Luis Gómez',
      email: 'luis@uni.edu',
      password: 'password123',
      password_hash: 'hashed',
    });

    const found = await userRepository.findById(created.id);

    expect(found?.email).toBe('luis@uni.edu');
  });

  it('findByIds devuelve varios usuarios', async () => {
    const userA = await userRepository.create({
      university_id: 'uni-1',
      full_name: 'Usuario A',
      email: 'a@uni.edu',
      password: 'password123',
      password_hash: 'hashed',
    });
    const userB = await userRepository.create({
      university_id: 'uni-1',
      full_name: 'Usuario B',
      email: 'b@uni.edu',
      password: 'password123',
      password_hash: 'hashed',
    });

    const users = await userRepository.findByIds([userA.id, userB.id, 'invalid-id']);

    expect(users).toHaveLength(2);
    expect(users.map((user) => user.email).sort()).toEqual(['a@uni.edu', 'b@uni.edu']);
  });

  it('actualiza contraseña', async () => {
    const created = await userRepository.create({
      university_id: 'uni-1',
      full_name: 'Cambio Pass',
      email: 'pass@uni.edu',
      password: 'password123',
      password_hash: 'old-hash',
    });

    await userRepository.updatePassword(created.id, 'new-hash');
    const found = await userRepository.findById(created.id);

    expect(found?.password_hash).toBe('new-hash');
  });

  it('rechaza email duplicado', async () => {
    await userRepository.create({
      university_id: 'uni-1',
      full_name: 'Primero',
      email: 'dup@uni.edu',
      password: 'password123',
      password_hash: 'hashed',
    });

    await expect(
      userRepository.create({
        university_id: 'uni-1',
        full_name: 'Segundo',
        email: 'dup@uni.edu',
        password: 'password123',
        password_hash: 'hashed',
      }),
    ).rejects.toThrow();
  });
});
